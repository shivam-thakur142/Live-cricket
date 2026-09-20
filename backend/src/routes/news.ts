import { Router } from "express";
import {
  createNews,
  deleteNews,
  getNews,
  listNews,
  updateNews,
} from "../controllers/newsController.js";
import { authenticate, requireEditor } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParamSchema } from "../validators/common.js";
import { createNewsSchema, newsQuerySchema, updateNewsSchema } from "../validators/news.js";

export const newsRouter = Router();

newsRouter.get("/", validate({ query: newsQuerySchema }), listNews);
newsRouter.get("/:id", validate({ params: idParamSchema }), getNews);
newsRouter.post("/", authenticate, requireEditor, validate({ body: createNewsSchema }), createNews);
newsRouter.patch("/:id", authenticate, requireEditor, validate({ params: idParamSchema, body: updateNewsSchema }), updateNews);
newsRouter.delete("/:id", authenticate, requireEditor, validate({ params: idParamSchema }), deleteNews);
