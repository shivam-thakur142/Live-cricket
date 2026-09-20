import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { created, makePagination, ok } from "../utils/response.js";
import { serializeNews } from "../services/serializers.js";
import { logActivity } from "../services/activityService.js";

/** GET /api/news?category=&tournamentId=&search=&page=&limit= */
export const listNews = asyncHandler(async (req: Request, res: Response) => {
  const { category, tournamentId, search, page, limit } = req.query as {
    category?: string;
    tournamentId?: string;
    search?: string;
    page?: number;
    limit?: number;
  };

  const where = {
    ...(category ? { category } : {}),
    ...(tournamentId ? { tournamentId } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { content: { contains: search, mode: "insensitive" as const } },
            { excerpt: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  if (page && limit) {
    const [total, rows] = await Promise.all([
      prisma.newsArticle.count({ where }),
      prisma.newsArticle.findMany({
        where,
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    ok(res, rows.map(serializeNews), makePagination(page, limit, total));
    return;
  }

  const rows = await prisma.newsArticle.findMany({ where, orderBy: { date: "desc" } });
  ok(res, rows.map(serializeNews));
});

/** GET /api/news/:id */
export const getNews = asyncHandler(async (req: Request, res: Response) => {
  const row = await prisma.newsArticle.findUnique({ where: { id: req.params.id } });
  if (!row) throw ApiError.notFound("News article not found");
  ok(res, serializeNews(row));
});

/** POST /api/news */
export const createNews = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;
  const row = await prisma.newsArticle.create({
    data: {
      ...data,
      date: new Date(data.date),
    },
  });
  void logActivity({
    type: "news",
    description: `Created news article: ${row.title}`,
    user: req.user,
    entityType: "news",
    entityId: row.id,
  });
  created(res, serializeNews(row));
});

/** PATCH /api/news/:id */
export const updateNews = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.newsArticle.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound("News article not found");

  const data = req.body;
  const row = await prisma.newsArticle.update({
    where: { id: req.params.id },
    data: {
      ...data,
      ...(data.date ? { date: new Date(data.date) } : {}),
    },
  });
  void logActivity({
    type: "news",
    description: `Updated news article: ${row.title}`,
    user: req.user,
    entityType: "news",
    entityId: row.id,
  });
  ok(res, serializeNews(row));
});

/** DELETE /api/news/:id */
export const deleteNews = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.newsArticle.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound("News article not found");

  await prisma.newsArticle.delete({ where: { id: req.params.id } });
  void logActivity({
    type: "news",
    description: `Deleted news article: ${existing.title}`,
    user: req.user,
    entityType: "news",
    entityId: existing.id,
  });
  ok(res, { deleted: true });
});
