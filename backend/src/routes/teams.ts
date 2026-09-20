import { Router } from "express";
import {
  createTeam,
  deleteTeam,
  getTeam,
  getTeamMatches,
  getTeamPlayers,
  listTeams,
  updateTeam,
} from "../controllers/teamController.js";
import { authenticate, requireEditor } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParamSchema } from "../validators/common.js";
import { createTeamSchema, teamQuerySchema, updateTeamSchema } from "../validators/team.js";

export const teamRouter = Router();

teamRouter.get("/", validate({ query: teamQuerySchema }), listTeams);
teamRouter.get("/:id", validate({ params: idParamSchema }), getTeam);
teamRouter.get("/:id/players", validate({ params: idParamSchema }), getTeamPlayers);
teamRouter.get("/:id/matches", validate({ params: idParamSchema }), getTeamMatches);

teamRouter.post("/", authenticate, requireEditor, validate({ body: createTeamSchema }), createTeam);
teamRouter.patch("/:id", authenticate, requireEditor, validate({ params: idParamSchema, body: updateTeamSchema }), updateTeam);
teamRouter.delete("/:id", authenticate, requireEditor, validate({ params: idParamSchema }), deleteTeam);
