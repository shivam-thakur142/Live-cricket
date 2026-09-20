import { Router } from "express";
import {
  createTournament,
  deleteTournament,
  getTournament,
  getTournamentMatches,
  getTournamentTeams,
  listTournaments,
  registerTeam,
  unregisterTeam,
  updateTournament,
} from "../controllers/tournamentController.js";
import { authenticate, requireEditor } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParamSchema } from "../validators/common.js";
import { createTournamentSchema, tournamentQuerySchema, updateTournamentSchema } from "../validators/tournament.js";
import { z } from "zod";

export const tournamentRouter = Router();

const teamRegistrationParams = z.object({ id: z.string().min(1), teamId: z.string().min(1) });

// Public reads
tournamentRouter.get("/", validate({ query: tournamentQuerySchema }), listTournaments);
tournamentRouter.get("/:id", validate({ params: idParamSchema }), getTournament);
tournamentRouter.get("/:id/teams", validate({ params: idParamSchema }), getTournamentTeams);
tournamentRouter.get("/:id/matches", validate({ params: idParamSchema }), getTournamentMatches);

// Mutations: admin + editor
tournamentRouter.post("/", authenticate, requireEditor, validate({ body: createTournamentSchema }), createTournament);
tournamentRouter.patch("/:id", authenticate, requireEditor, validate({ params: idParamSchema, body: updateTournamentSchema }), updateTournament);
tournamentRouter.delete("/:id", authenticate, requireEditor, validate({ params: idParamSchema }), deleteTournament);
tournamentRouter.post("/:id/teams/:teamId", authenticate, requireEditor, validate({ params: teamRegistrationParams }), registerTeam);
tournamentRouter.delete("/:id/teams/:teamId", authenticate, requireEditor, validate({ params: teamRegistrationParams }), unregisterTeam);
