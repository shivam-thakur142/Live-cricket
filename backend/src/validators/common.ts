import { z } from "zod";

export const idParamSchema = z.object({ id: z.string().min(1) });

export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected date format YYYY-MM-DD");

export const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Expected time format HH:mm");

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export const MATCH_STAGES = [
  "League",
  "Group Stage",
  "Qualifier",
  "Eliminator",
  "Quarter Final",
  "Semi Final",
  "Final",
] as const;

export const PLAYER_ROLES = ["Batsman", "Bowler", "All-rounder", "Wicket-keeper"] as const;

export const NEWS_CATEGORIES = [
  "Match Report",
  "Announcement",
  "Tournament News",
  "Team News",
  "Player News",
] as const;

export const GALLERY_CATEGORIES = ["Match", "Team", "Trophy", "Ground", "Moment"] as const;

export const DISMISSAL_TYPES = ["bowled", "caught", "lbw", "run_out", "stumped", "hit_wicket"] as const;
