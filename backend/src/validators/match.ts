import { z } from "zod";
import { dateString, MATCH_STAGES, paginationQuery, timeString } from "./common.js";

const matchBase = z.object({
  tournamentId: z.string().min(1, "Tournament is required"),
  matchNumber: z.number().int().min(1, "Match number is required"),
  stage: z.enum(MATCH_STAGES),
  date: dateString,
  time: timeString,
  venueId: z.string().min(1, "Venue is required"),
  team1Id: z.string().min(1, "Team 1 is required"),
  team2Id: z.string().min(1, "Team 2 is required"),
  status: z.enum(["upcoming", "live", "completed"]).default("upcoming"),
});

export const createMatchSchema = matchBase.refine((d) => d.team1Id !== d.team2Id, {
  message: "Team 1 and Team 2 must be different",
  path: ["team2Id"],
});

export const updateMatchSchema = matchBase
  .partial()
  .extend({
    tossWinnerId: z.string().nullable().optional(),
    electedTo: z.enum(["bat", "field"]).nullable().optional(),
    resultText: z.string().nullable().optional(),
    winnerTeamId: z.string().nullable().optional(),
    playerOfMatchId: z.string().nullable().optional(),
    target: z.number().int().min(0).nullable().optional(),
  })
  .refine((d) => !d.team1Id || !d.team2Id || d.team1Id !== d.team2Id, {
    message: "Team 1 and Team 2 must be different",
    path: ["team2Id"],
  });

export const matchQuerySchema = paginationQuery.extend({
  tournamentId: z.string().optional(),
  teamId: z.string().optional(),
  venueId: z.string().optional(),
  status: z.enum(["upcoming", "live", "completed"]).optional(),
  date: dateString.optional(),
});
