import { z } from "zod";
import { paginationQuery, PLAYER_ROLES } from "./common.js";

const playerBase = z.object({
  name: z.string().min(1, "Player name is required"),
  photoUrl: z.string().optional(),
  teamId: z.string().min(1, "Team is required"),
  role: z.enum(PLAYER_ROLES),
  jerseyNumber: z.number().int().min(0).max(999).optional(),
  battingStyle: z.string().optional(),
  bowlingStyle: z.string().optional(),
});

export const createPlayerSchema = playerBase;
export const updatePlayerSchema = playerBase.partial();

export const playerQuerySchema = paginationQuery.extend({
  search: z.string().optional(),
  teamId: z.string().optional(),
  role: z.enum(PLAYER_ROLES).optional(),
  tournamentId: z.string().optional(),
});
