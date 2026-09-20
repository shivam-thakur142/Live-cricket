import { Router } from "express";
import { createVenue, deleteVenue, getVenue, getVenueMatches, listVenues, updateVenue } from "../controllers/venueController.js";
import { authenticate, requireEditor } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParamSchema } from "../validators/common.js";
import { createVenueSchema, updateVenueSchema, venueQuerySchema } from "../validators/venue.js";

export const venueRouter = Router();

venueRouter.get("/", validate({ query: venueQuerySchema }), listVenues);
venueRouter.get("/:id", validate({ params: idParamSchema }), getVenue);
venueRouter.get("/:id/matches", validate({ params: idParamSchema }), getVenueMatches);

venueRouter.post("/", authenticate, requireEditor, validate({ body: createVenueSchema }), createVenue);
venueRouter.patch("/:id", authenticate, requireEditor, validate({ params: idParamSchema, body: updateVenueSchema }), updateVenue);
venueRouter.delete("/:id", authenticate, requireEditor, validate({ params: idParamSchema }), deleteVenue);
