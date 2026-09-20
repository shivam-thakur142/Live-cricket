import { Router } from "express";

export const healthRouter = Router();

/**
 * GET /api/health
 * Liveness probe — confirms the API process is up.
 */
healthRouter.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "SCL backend is running",
  });
});
