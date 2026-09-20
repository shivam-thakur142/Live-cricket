import { z } from "zod";
import { paginationQuery } from "./common.js";

const teamBase = z.object({
  name: z.string().min(1, "Team name is required"),
  shortName: z.string().min(1, "Short name is required").max(10),
  logoUrl: z.string().optional(),
  captainId: z.string().optional(),
  captainName: z.string().optional(),
  coach: z.string().optional(),
  foundedYear: z.number().int().min(1800).max(2100).optional(),
});

export const createTeamSchema = teamBase;
export const updateTeamSchema = teamBase.partial();

export const teamQuerySchema = paginationQuery.extend({
  search: z.string().optional(),
});
