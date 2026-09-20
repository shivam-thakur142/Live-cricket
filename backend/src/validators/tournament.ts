import { z } from "zod";
import { dateString, paginationQuery } from "./common.js";

const tournamentBase = z.object({
  name: z.string().min(1, "Name is required"),
  shortName: z.string().optional(),
  season: z.string().min(1, "Season is required"),
  format: z.string().min(1, "Format is required"),
  overs: z.number().int().min(1).max(50),
  location: z.string().min(1, "Location is required"),
  startDate: dateString,
  endDate: dateString,
  status: z.enum(["upcoming", "registration_open", "ongoing", "completed"]),
  description: z.string().default(""),
  logoUrl: z.string().optional(),
  currentStage: z.string().optional(),
  pointsWin: z.number().int().min(0).optional(),
  pointsNoResult: z.number().int().min(0).optional(),
});

export const createTournamentSchema = tournamentBase.refine(
  (d) => d.endDate >= d.startDate,
  { message: "End date must be on or after start date", path: ["endDate"] }
);

export const updateTournamentSchema = tournamentBase.partial();

export const tournamentQuerySchema = paginationQuery.extend({
  status: z.enum(["upcoming", "registration_open", "ongoing", "completed"]).optional(),
});
