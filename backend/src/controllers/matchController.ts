import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { created, makePagination, ok } from "../utils/response.js";
import { getSerializedMatch, serializeMatch, matchInclude } from "../services/matchSerializer.js";
import { logActivity } from "../services/activityService.js";

async function playerNameMap() {
  const players = await prisma.player.findMany({ select: { id: true, name: true } });
  return new Map(players.map((p) => [p.id, p.name]));
}

/** GET /api/matches?tournamentId=&teamId=&venueId=&status=&date=&page=&limit= */
export const listMatches = asyncHandler(async (req: Request, res: Response) => {
  const { tournamentId, teamId, venueId, status, date, page, limit } = req.query as {
    tournamentId?: string;
    teamId?: string;
    venueId?: string;
    status?: "upcoming" | "live" | "completed";
    date?: string;
    page?: number;
    limit?: number;
  };

  const where = {
    ...(tournamentId ? { tournamentId } : {}),
    ...(venueId ? { venueId } : {}),
    ...(status ? { status } : {}),
    ...(date ? { date: new Date(date) } : {}),
    ...(teamId ? { OR: [{ team1Id: teamId }, { team2Id: teamId }] } : {}),
  };

  if (page && limit) {
    const [total, rows, names] = await Promise.all([
      prisma.match.count({ where }),
      prisma.match.findMany({
        where,
        orderBy: [{ date: "asc" }, { matchNumber: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: matchInclude,
      }),
      playerNameMap(),
    ]);
    ok(res, rows.map((m) => serializeMatch(m, names)), makePagination(page, limit, total));
    return;
  }

  const [rows, names] = await Promise.all([
    prisma.match.findMany({ where, orderBy: [{ date: "asc" }, { matchNumber: "asc" }], include: matchInclude }),
    playerNameMap(),
  ]);
  ok(res, rows.map((m) => serializeMatch(m, names)));
});

/** GET /api/matches/:id — full scorecard + live state. */
export const getMatch = asyncHandler(async (req: Request, res: Response) => {
  const match = await getSerializedMatch(req.params.id);
  if (!match) throw ApiError.notFound("Match not found");
  ok(res, match);
});

/** POST /api/matches — schedule a match (scorecards arrive via the scoring engine later). */
export const createMatch = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;

  const [tournament, venue, team1, team2] = await Promise.all([
    prisma.tournament.findUnique({ where: { id: data.tournamentId } }),
    prisma.venue.findUnique({ where: { id: data.venueId } }),
    prisma.team.findUnique({ where: { id: data.team1Id } }),
    prisma.team.findUnique({ where: { id: data.team2Id } }),
  ]);
  const fields: Record<string, string> = {};
  if (!tournament) fields.tournamentId = "Tournament not found";
  if (!venue) fields.venueId = "Venue not found";
  if (!team1) fields.team1Id = "Team not found";
  if (!team2) fields.team2Id = "Team not found";
  if (Object.keys(fields).length > 0) throw ApiError.validation("Invalid request", fields);

  const duplicate = await prisma.match.findUnique({
    where: { tournamentId_matchNumber: { tournamentId: data.tournamentId, matchNumber: data.matchNumber } },
  });
  if (duplicate) throw ApiError.conflict(`Match number ${data.matchNumber} already exists in this tournament`);

  const row = await prisma.match.create({
    data: { ...data, date: new Date(data.date) },
    include: matchInclude,
  });
  void logActivity({
    type: "match",
    description: `Scheduled match ${data.matchNumber}: ${team1!.name} vs ${team2!.name}`,
    user: req.user,
    entityType: "match",
    entityId: row.id,
  });
  const names = await playerNameMap();
  created(res, serializeMatch(row, names));
});

/** PATCH /api/matches/:id — schedule/status/toss/result fields (not scorecards). */
export const updateMatch = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;
  const existing = await prisma.match.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound("Match not found");

  // Reference checks for any changed relationships.
  const fields: Record<string, string> = {};
  if (data.tournamentId && !(await prisma.tournament.findUnique({ where: { id: data.tournamentId } }))) fields.tournamentId = "Tournament not found";
  if (data.venueId && !(await prisma.venue.findUnique({ where: { id: data.venueId } }))) fields.venueId = "Venue not found";
  if (data.team1Id && !(await prisma.team.findUnique({ where: { id: data.team1Id } }))) fields.team1Id = "Team not found";
  if (data.team2Id && !(await prisma.team.findUnique({ where: { id: data.team2Id } }))) fields.team2Id = "Team not found";
  if (data.tossWinnerId && !(await prisma.team.findUnique({ where: { id: data.tossWinnerId } }))) fields.tossWinnerId = "Team not found";
  if (data.winnerTeamId && !(await prisma.team.findUnique({ where: { id: data.winnerTeamId } }))) fields.winnerTeamId = "Team not found";
  if (data.playerOfMatchId && !(await prisma.player.findUnique({ where: { id: data.playerOfMatchId } }))) fields.playerOfMatchId = "Player not found";
  if (Object.keys(fields).length > 0) throw ApiError.validation("Invalid request", fields);

  if (data.matchNumber && data.matchNumber !== existing.matchNumber) {
    const duplicate = await prisma.match.findUnique({
      where: { tournamentId_matchNumber: { tournamentId: data.tournamentId ?? existing.tournamentId, matchNumber: data.matchNumber } },
    });
    if (duplicate) throw ApiError.conflict(`Match number ${data.matchNumber} already exists in this tournament`);
  }

  const row = await prisma.match.update({
    where: { id: req.params.id },
    data: { ...data, ...(data.date ? { date: new Date(data.date) } : {}) },
    include: matchInclude,
  });
  void logActivity({ type: "match", description: `Updated match ${row.matchNumber} (${row.id})`, user: req.user, entityType: "match", entityId: row.id });
  const names = await playerNameMap();
  ok(res, serializeMatch(row, names));
});

/** DELETE /api/matches/:id — blocked when the match has scorecard/innings history. */
export const deleteMatch = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.match.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { innings: true } } },
  });
  if (!existing) throw ApiError.notFound("Match not found");
  if (existing._count.innings > 0) {
    throw ApiError.conflict("Cannot delete a match that has scorecard data. This protects cricket history.");
  }

  await prisma.match.delete({ where: { id: req.params.id } });
  void logActivity({ type: "match", description: `Deleted match ${existing.matchNumber} (${existing.id})`, user: req.user, entityType: "match", entityId: existing.id });
  ok(res, { deleted: true });
});
