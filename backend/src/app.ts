import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  const allowedOrigins = env.FRONTEND_URL.split(",").map((s) => s.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes("*") ||
          allowedOrigins.includes(origin) ||
          origin.endsWith(".vercel.app") ||
          origin.includes("localhost")
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
    })
  );
  app.use(express.json());

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
