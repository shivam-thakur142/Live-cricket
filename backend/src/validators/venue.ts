import { z } from "zod";
import { paginationQuery } from "./common.js";

const venueBase = z.object({
  name: z.string().min(1, "Venue name is required"),
  location: z.string().min(1, "Location is required"),
  address: z.string().default(""),
  capacity: z.number().int().min(0).default(0),
  pitchInfo: z.string().default(""),
  imageUrl: z.string().optional(),
});

export const createVenueSchema = venueBase;
export const updateVenueSchema = venueBase.partial();

export const venueQuerySchema = paginationQuery.extend({
  search: z.string().optional(),
});
