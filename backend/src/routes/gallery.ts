import { Router } from "express";
import {
  createGalleryItem,
  deleteGalleryItem,
  listGallery,
} from "../controllers/galleryController.js";
import { authenticate, requireEditor } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParamSchema } from "../validators/common.js";
import { createGallerySchema, galleryQuerySchema } from "../validators/gallery.js";

export const galleryRouter = Router();

galleryRouter.get("/", validate({ query: galleryQuerySchema }), listGallery);
galleryRouter.post("/", authenticate, requireEditor, validate({ body: createGallerySchema }), createGalleryItem);
galleryRouter.delete("/:id", authenticate, requireEditor, validate({ params: idParamSchema }), deleteGalleryItem);
