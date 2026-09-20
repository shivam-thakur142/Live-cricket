import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { created, makePagination, ok } from "../utils/response.js";
import { serializeVenue } from "../services/serializers.js";
import { serializeMatch, matchInclude } from "../services/matchSerializer.js";
import { logActivity } from "../services/activityService.js";

/** GET /api/venues?search=&page=&limit= — includes computed matchesHosted. */
export const listVenues = asyncHandler(async (req: Request, res: Response) => {
  const { search, page, limit } = req.query as { search?: string; page?: number; limit?: number };
  const where = search
    ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { location: { contains: search, mode: "insensitive" as const } }] }
    : {};
  const include = { _count: { select: { matches: true } } };

  if (page && limit) {
    const [total, rows] = await Promise.all([
      prisma.venue.count({ where }),
      prisma.venue.findMany({ where, include, orderBy: { name: "asc" }, skip: (page - 1) * limit, take: limit }),
    ]);
    ok(res, rows.map(serializeVenue), makePagination(page, limit, total));
    return;
  }

  const rows = await prisma.venue.findMany({ where, include, orderBy: { name: "asc" } });
  ok(res, rows.map(serializeVenue));
});

/** GET /api/venues/:id */
export const getVenue = asyncHandler(async (req: Request, res: Response) => {
  const row = await prisma.venue.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { matches: true } } },
  });
  if (!row) throw ApiError.notFound("Venue not found");
  ok(res, serializeVenue(row));
});

/** POST /api/venues */
export const createVenue = asyncHandler(async (req: Request, res: Response) => {
  const row = await prisma.venue.create({ data: req.body, include: { _count: { select: { matches: true } } } });
  void logActivity({ type: "venue", description: `Created venue ${row.name}`, user: req.user, entityType: "venue", entityId: row.id });
  created(res, serializeVenue(row));
});

/** PATCH /api/venues/:id */
export const updateVenue = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.venue.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound("Venue not found");
  const row = await prisma.venue.update({
    where: { id: req.params.id },
    data: req.body,
    include: { _count: { select: { matches: true } } },
  });
  void logActivity({ type: "venue", description: `Updated venue ${row.name}`, user: req.user, entityType: "venue", entityId: row.id });
  ok(res, serializeVenue(row));
});

/** DELETE /api/venues/:id — blocked when matches are scheduled at the venue. */
export const deleteVenue = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.venue.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { matches: true } } },
  });
  if (!existing) throw ApiError.notFound("Venue not found");
  if (existing._count.matches > 0) {
    throw ApiError.conflict("Cannot delete a venue that has matches scheduled");
  }

  await prisma.venue.delete({ where: { id: req.params.id } });
  void logActivity({ type: "venue", description: `Deleted venue ${existing.name}`, user: req.user, entityType: "venue", entityId: existing.id });
  ok(res, { deleted: true });
});

/** GET /api/venues/:id/matches */
export const getVenueMatches = asyncHandler(async (req: Request, res: Response) => {
  const venue = await prisma.venue.findUnique({ where: { id: req.params.id } });
  if (!venue) throw ApiError.notFound("Venue not found");
  const matches = await prisma.match.findMany({
    where: { venueId: req.params.id },
    orderBy: [{ date: "asc" }, { matchNumber: "asc" }],
    include: matchInclude,
  });
  const players = await prisma.player.findMany({ select: { id: true, name: true } });
  const names = new Map(players.map((p) => [p.id, p.name]));
  ok(res, matches.map((m) => serializeMatch(m, names)));
});
