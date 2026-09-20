import { z } from "zod";
import { dateString, NEWS_CATEGORIES, paginationQuery } from "./common.js";

const newsBase = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.enum(NEWS_CATEGORIES),
  date: dateString,
  tournamentId: z.string().optional(),
  imageUrl: z.string().optional(),
  excerpt: z.string().default(""),
  content: z.string().default(""),
  author: z.string().optional(),
});

export const createNewsSchema = newsBase;
export const updateNewsSchema = newsBase.partial();

export const newsQuerySchema = paginationQuery.extend({
  category: z.enum(NEWS_CATEGORIES).optional(),
  tournamentId: z.string().optional(),
  search: z.string().optional(),
});
