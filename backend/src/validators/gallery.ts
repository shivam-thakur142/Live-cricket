import { z } from "zod";
import { GALLERY_CATEGORIES, paginationQuery } from "./common.js";

const galleryBase = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.enum(GALLERY_CATEGORIES),
  imageUrl: z.string().min(1, "Image URL is required"),
  tournamentId: z.string().optional(),
});

export const createGallerySchema = galleryBase;
export const updateGallerySchema = galleryBase.partial();

export const galleryQuerySchema = paginationQuery.extend({
  category: z.enum(GALLERY_CATEGORIES).optional(),
  tournamentId: z.string().optional(),
});
