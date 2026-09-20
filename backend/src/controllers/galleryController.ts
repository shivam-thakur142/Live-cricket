import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { created, makePagination, ok } from "../utils/response.js";
import { serializeGallery } from "../services/serializers.js";
import { logActivity } from "../services/activityService.js";

/** GET /api/gallery?category=&tournamentId=&page=&limit= */
export const listGallery = asyncHandler(async (req: Request, res: Response) => {
  const { category, tournamentId, page, limit } = req.query as {
    category?: string;
    tournamentId?: string;
    page?: number;
    limit?: number;
  };

  const where = {
    ...(category ? { category } : {}),
    ...(tournamentId ? { tournamentId } : {}),
  };

  if (page && limit) {
    const [total, rows] = await Promise.all([
      prisma.galleryItem.count({ where }),
      prisma.galleryItem.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    ok(res, rows.map(serializeGallery), makePagination(page, limit, total));
    return;
  }

  const rows = await prisma.galleryItem.findMany({ where, orderBy: { createdAt: "desc" } });
  ok(res, rows.map(serializeGallery));
});

/** POST /api/gallery */
export const createGalleryItem = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;
  const row = await prisma.galleryItem.create({ data });
  void logActivity({
    type: "gallery",
    description: `Added gallery item: ${row.title}`,
    user: req.user,
    entityType: "gallery",
    entityId: row.id,
  });
  created(res, serializeGallery(row));
});

/** DELETE /api/gallery/:id */
export const deleteGalleryItem = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.galleryItem.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound("Gallery item not found");

  await prisma.galleryItem.delete({ where: { id: req.params.id } });
  void logActivity({
    type: "gallery",
    description: `Deleted gallery item: ${existing.title}`,
    user: req.user,
    entityType: "gallery",
    entityId: existing.id,
  });
  ok(res, { deleted: true });
});
