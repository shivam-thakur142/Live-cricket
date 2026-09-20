import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { created, makePagination, ok } from "../utils/response.js";
import { serializeTeam, serializeTournament } from "../services/serializers.js";
import { serializeMatch, matchInclude } from "../services/matchSerializer.js";
import { logActivity } from "../services/activityService.js";

/** GET /api/tournaments?status=&page=&limit= */
export const listTournaments = asyncHandler(async (req: Request, res: Response) => {
  const { status, page, limit } = req.query as { status?: string; page?: number; limit?: number };
  const where = status ? { status: status as never } : {};

  if (page && limit) {
    const [total, rows] = await Promise.all([
      prisma.tournament.count({ where }),
      prisma.tournament.findMany({
        where,
        orderBy: { startDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    ok(res, rows.map(serializeTournament), makePagination(page, limit, total));
    return;
  }

  const rows = await prisma.tournament.findMany({ where, orderBy: { startDate: "desc" } });
  ok(res, rows.map(serializeTournament));
});

/** GET /api/tournaments/:id */
export const getTournament = asyncHandler(async (req: Request, res: Response) => {
  const row = await prisma.tournament.findUnique({ where: { id: req.params.id } });
  if (!row) throw ApiError.notFound("Tournament not found");
  ok(res, serializeTournament(row));
});

/** POST /api/tournaments */
export const createTournament = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;
  const row = await prisma.tournament.create({
    data: {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
  });
  void logActivity({ type: "tournament", description: `Created tournament ${row.name}`, user: req.user, entityType: "tournament", entityId: row.id });
  created(res, serializeTournament(row));
});

/** PATCH /api/tournaments/:id */
export const updateTournament = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;
  const existing = await prisma.tournament.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound("Tournament not found");

  const row = await prisma.tournament.update({
    where: { id: req.params.id },
    data: {
      ...data,
      ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
      ...(data.endDate ? { endDate: new Date(data.endDate) } : {}),
    },
  });
  void logActivity({ type: "tournament", description: `Updated tournament ${row.name}`, user: req.user, entityType: "tournament", entityId: row.id });
  ok(res, serializeTournament(row));
});

/** DELETE /api/tournaments/:id — blocked when the tournament has matches (protects history). */
export const deleteTournament = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.tournament.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { matches: true } } },
  });
  if (!existing) throw ApiError.notFound("Tournament not found");
  if (existing._count.matches > 0) {
    throw ApiError.conflict(
      "Cannot delete a tournament that has matches. Delete its matches first or mark it completed."
    );
  }

  await prisma.tournament.delete({ where: { id: req.params.id } });
  void logActivity({ type: "tournament", description: `Deleted tournament ${existing.name}`, user: req.user, entityType: "tournament", entityId: existing.id });
  ok(res, { deleted: true });
});

/** GET /api/tournaments/:id/teams — registered teams (Team[] shape). */
export const getTournamentTeams = asyncHandler(async (req: Request, res: Response) => {
  const tournament = await prisma.tournament.findUnique({ where: { id: req.params.id } });
  if (!tournament) throw ApiError.notFound("Tournament not found");

  const registrations = await prisma.tournamentTeam.findMany({
    where: { tournamentId: req.params.id },
    include: { team: true },
    orderBy: { createdAt: "asc" },
  });
  ok(res, registrations.map((r) => serializeTeam(r.team)));
});

/** GET /api/tournaments/:id/matches */
export const getTournamentMatches = asyncHandler(async (req: Request, res: Response) => {
  const tournament = await prisma.tournament.findUnique({ where: { id: req.params.id } });
  if (!tournament) throw ApiError.notFound("Tournament not found");

  const matches = await prisma.match.findMany({
    where: { tournamentId: req.params.id },
    orderBy: [{ date: "asc" }, { matchNumber: "asc" }],
    include: matchInclude,
  });
  const players = await prisma.player.findMany({ select: { id: true, name: true } });
  const names = new Map(players.map((p) => [p.id, p.name]));
  ok(res, matches.map((m) => serializeMatch(m, names)));
});

/** POST /api/tournaments/:id/teams/:teamId — register a team (409 on duplicate). */
export const registerTeam = asyncHandler(async (req: Request, res: Response) => {
  const { id, teamId } = req.params;
  const [tournament, team] = await Promise.all([
    prisma.tournament.findUnique({ where: { id } }),
    prisma.team.findUnique({ where: { id: teamId } }),
  ]);
  if (!tournament) throw ApiError.notFound("Tournament not found");
  if (!team) throw ApiError.notFound("Team not found");

  const existing = await prisma.tournamentTeam.findUnique({
    where: { tournamentId_teamId: { tournamentId: id, teamId } },
  });
  if (existing) throw ApiError.conflict("Team is already registered in this tournament");

  const row = await prisma.tournamentTeam.create({ data: { tournamentId: id, teamId } });
  void logActivity({ type: "tournament", description: `Registered ${team.name} in ${tournament.name}`, user: req.user, entityType: "tournament", entityId: id });
  created(res, { id: row.id, tournamentId: row.tournamentId, teamId: row.teamId });
});

/** DELETE /api/tournaments/:id/teams/:teamId — unregister (blocked when the team has matches). */
export const unregisterTeam = asyncHandler(async (req: Request, res: Response) => {
  const { id, teamId } = req.params;
  const existing = await prisma.tournamentTeam.findUnique({
    where: { tournamentId_teamId: { tournamentId: id, teamId } },
  });
  if (!existing) throw ApiError.notFound("Team is not registered in this tournament");

  const matchCount = await prisma.match.count({
    where: { tournamentId: id, OR: [{ team1Id: teamId }, { team2Id: teamId }] },
  });
  if (matchCount > 0) {
    throw ApiError.conflict("Cannot remove a team that already has matches in this tournament");
  }

  await prisma.tournamentTeam.delete({ where: { id: existing.id } });
  void logActivity({ type: "tournament", description: `Removed team ${teamId} from tournament ${id}`, user: req.user, entityType: "tournament", entityId: id });
  ok(res, { deleted: true });
});

