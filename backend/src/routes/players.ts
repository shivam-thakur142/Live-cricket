import { Router } from "express";
import { createPlayer, deletePlayer, getPlayer, listPlayers, updatePlayer } from "../controllers/playerController.js";
import { authenticate, requireEditor } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParamSchema } from "../validators/common.js";
import { createPlayerSchema, playerQuerySchema, updatePlayerSchema } from "../validators/player.js";

export const playerRouter = Router();

playerRouter.get("/", validate({ query: playerQuerySchema }), listPlayers);
playerRouter.get("/:id", validate({ params: idParamSchema }), getPlayer);

playerRouter.post("/", authenticate, requireEditor, validate({ body: createPlayerSchema }), createPlayer);
playerRouter.patch("/:id", authenticate, requireEditor, validate({ params: idParamSchema, body: updatePlayerSchema }), updatePlayer);
playerRouter.delete("/:id", authenticate, requireEditor, validate({ params: idParamSchema }), deletePlayer);
