import { Router } from "express";
import { createMatch, deleteMatch, getMatch, listMatches, updateMatch } from "../controllers/matchController.js";
import { authenticate, requireEditor } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParamSchema } from "../validators/common.js";
import { createMatchSchema, matchQuerySchema, updateMatchSchema } from "../validators/match.js";

export const matchRouter = Router();

matchRouter.get("/", validate({ query: matchQuerySchema }), listMatches);
matchRouter.get("/:id", validate({ params: idParamSchema }), getMatch);

matchRouter.post("/", authenticate, requireEditor, validate({ body: createMatchSchema }), createMatch);
matchRouter.patch("/:id", authenticate, requireEditor, validate({ params: idParamSchema, body: updateMatchSchema }), updateMatch);
matchRouter.delete("/:id", authenticate, requireEditor, validate({ params: idParamSchema }), deleteMatch);
