import { Router } from "express";
import { healthRouter } from "./health.js";
import { authRouter } from "./auth.js";
import { tournamentRouter } from "./tournaments.js";
import { teamRouter } from "./teams.js";
import { playerRouter } from "./players.js";
import { venueRouter } from "./venues.js";
import { matchRouter } from "./matches.js";
import { newsRouter } from "./news.js";
import { galleryRouter } from "./gallery.js";
import { userRouter } from "./users.js";

/** Root API router. */
export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/tournaments", tournamentRouter);
apiRouter.use("/teams", teamRouter);
apiRouter.use("/players", playerRouter);
apiRouter.use("/venues", venueRouter);
apiRouter.use("/matches", matchRouter);
apiRouter.use("/news", newsRouter);
apiRouter.use("/gallery", galleryRouter);
apiRouter.use("/", userRouter); // /users, /activities, /settings
