import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { created, makePagination, ok } from "../utils/response.js";
import { serializePlayer, serializeTeam } from "../services/serializers.js";
import { serializeMatch, matchInclude } from "../services/matchSerializer.js";
import { logActivity } from "../services/activityService.js";

/** GET /api/teams?search=&page=&limit= */
export const listTeams = asyncHandler(async (req: Request, res: Response) => {
  const { search, page, limit } = req.query as { search?: string; page?: number; limit?: number };
  const where = search
    ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { shortName: { contains: search, mode: "insensitive" as const } }] }
    : {};

  if (page && limit) {
    const [total, rows] = await Promise.all([
      prisma.team.count({ where }),
      prisma.team.findMany({ where, orderBy: { name: "asc" }, skip: (page - 1) * limit, take: limit }),
    ]);
    ok(res, rows.map(serializeTeam), makePagination(page, limit, total));
    return;
  }

  const rows = await prisma.team.findMany({ where, orderBy: { name: "asc" } });
  ok(res, rows.map(serializeTeam));
});

/** GET /api/teams/:id */
export const getTeam = asyncHandler(async (req: Request, res: Response) => {
  const row = await prisma.team.findUnique({ where: { id: req.params.id } });
  if (!row) throw ApiError.notFound("Team not found");
  ok(res, serializeTeam(row));
});

/** POST /api/teams */
export const createTeam = asyncHandler(async (req: Request, res: Response) => {
  const row = await prisma.team.create({ data: req.body });
  void logActivity({ type: "team", description: `Created team ${row.name}`, user: req.user, entityType: "team", entityId: row.id });
  created(res, serializeTeam(row));
});

/** PATCH /api/teams/:id */
export const updateTeam = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.team.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound("Team not found");
  const row = await prisma.team.update({ where: { id: req.params.id }, data: req.body });
  void logActivity({ type: "team", description: `Updated team ${row.name}`, user: req.user, entityType: "team", entityId: row.id });
  ok(res, serializeTeam(row));
});

/**
 * DELETE /api/teams/:id
 * Blocked (409) when the team has matches — deleting would destroy cricket history.
 * Otherwise removes the team with its players and tournament registrations in one transaction.
 */
export const deleteTeam = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.team.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { homeMatches: true, awayMatches: true } } },
  });
  if (!existing) throw ApiError.notFound("Team not found");
  if (existing._count.homeMatches + existing._count.awayMatches > 0) {
    throw ApiError.conflict("Cannot delete a team that has matches. Remove its matches first.");
  }

  await prisma.$transaction([
    prisma.tournamentTeam.deleteMany({ where: { teamId: req.params.id } }),
    prisma.player.deleteMany({ where: { teamId: req.params.id } }),
    prisma.team.delete({ where: { id: req.params.id } }),
  ]);
  void logActivity({ type: "team", description: `Deleted team ${existing.name}`, user: req.user, entityType: "team", entityId: existing.id });
  ok(res, { deleted: true });
});

/** GET /api/teams/:id/players */
export const getTeamPlayers = asyncHandler(async (req: Request, res: Response) => {
  const team = await prisma.team.findUnique({ where: { id: req.params.id } });
  if (!team) throw ApiError.notFound("Team not found");
  const rows = await prisma.player.findMany({
    where: { teamId: req.params.id },
    orderBy: { jerseyNumber: "asc" },
  });
  ok(res, rows.map(serializePlayer));
});

/** GET /api/teams/:id/matches */
export const getTeamMatches = asyncHandler(async (req: Request, res: Response) => {
  const team = await prisma.team.findUnique({ where: { id: req.params.id } });
  if (!team) throw ApiError.notFound("Team not found");
  const matches = await prisma.match.findMany({
    where: { OR: [{ team1Id: req.params.id }, { team2Id: req.params.id }] },
    orderBy: [{ date: "asc" }, { matchNumber: "asc" }],
    include: matchInclude,
  });
  const players = await prisma.player.findMany({ select: { id: true, name: true } });
  const names = new Map(players.map((p) => [p.id, p.name]));
  ok(res, matches.map((m) => serializeMatch(m, names)));
});
