import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { created, makePagination, ok } from "../utils/response.js";
import { serializePlayer } from "../services/serializers.js";
import { logActivity } from "../services/activityService.js";

/**
 * GET /api/players?search=&teamId=&role=&tournamentId=&page=&limit=
 * tournamentId filter: players whose team is registered in the tournament
 * OR appears in any of its matches (mirrors the frontend's Players page logic).
 */
export const listPlayers = asyncHandler(async (req: Request, res: Response) => {
  const { search, teamId, role, tournamentId, page, limit } = req.query as {
    search?: string;
    teamId?: string;
    role?: string;
    tournamentId?: string;
    page?: number;
    limit?: number;
  };

  let tournamentTeamIds: string[] | undefined;
  if (tournamentId) {
    const [registrations, matchTeams] = await Promise.all([
      prisma.tournamentTeam.findMany({ where: { tournamentId }, select: { teamId: true } }),
      prisma.match.findMany({ where: { tournamentId }, select: { team1Id: true, team2Id: true } }),
    ]);
    tournamentTeamIds = [
      ...new Set([...registrations.map((r) => r.teamId), ...matchTeams.flatMap((m) => [m.team1Id, m.team2Id])]),
    ];
  }

  const where = {
    ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
    ...(teamId ? { teamId } : {}),
    ...(role ? { role } : {}),
    ...(tournamentTeamIds ? { teamId: { in: tournamentTeamIds } } : {}),
  };

  if (page && limit) {
    const [total, rows] = await Promise.all([
      prisma.player.count({ where }),
      prisma.player.findMany({ where, orderBy: { name: "asc" }, skip: (page - 1) * limit, take: limit }),
    ]);
    ok(res, rows.map(serializePlayer), makePagination(page, limit, total));
    return;
  }

  const rows = await prisma.player.findMany({ where, orderBy: { name: "asc" } });
  ok(res, rows.map(serializePlayer));
});

/** GET /api/players/:id */
export const getPlayer = asyncHandler(async (req: Request, res: Response) => {
  const row = await prisma.player.findUnique({ where: { id: req.params.id } });
  if (!row) throw ApiError.notFound("Player not found");
  ok(res, serializePlayer(row));
});

/** POST /api/players */
export const createPlayer = asyncHandler(async (req: Request, res: Response) => {
  const team = await prisma.team.findUnique({ where: { id: req.body.teamId } });
  if (!team) throw ApiError.validation("Invalid request", { teamId: "Team not found" });
  const row = await prisma.player.create({ data: req.body });
  void logActivity({ type: "player", description: `Added player ${row.name} to ${team.name}`, user: req.user, entityType: "player", entityId: row.id });
  created(res, serializePlayer(row));
});

/** PATCH /api/players/:id */
export const updatePlayer = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.player.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound("Player not found");
  if (req.body.teamId) {
    const team = await prisma.team.findUnique({ where: { id: req.body.teamId } });
    if (!team) throw ApiError.validation("Invalid request", { teamId: "Team not found" });
  }
  const row = await prisma.player.update({ where: { id: req.params.id }, data: req.body });
  void logActivity({ type: "player", description: `Updated player ${row.name}`, user: req.user, entityType: "player", entityId: row.id });
  ok(res, serializePlayer(row));
});

/** DELETE /api/players/:id — blocked when the player has match history (scorecards/balls). */
export const deletePlayer = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.player.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { battingCards: true, bowlingCards: true, ballsAsStriker: true, ballsAsBowler: true } } },
  });
  if (!existing) throw ApiError.notFound("Player not found");
  const history =
    existing._count.battingCards + existing._count.bowlingCards + existing._count.ballsAsStriker + existing._count.ballsAsBowler;
  if (history > 0) {
    throw ApiError.conflict("Cannot delete a player who has match history (scorecards or ball data)");
  }

  await prisma.player.delete({ where: { id: req.params.id } });
  void logActivity({ type: "player", description: `Deleted player ${existing.name}`, user: req.user, entityType: "player", entityId: existing.id });
  ok(res, { deleted: true });
});
