import rateLimit from "express-rate-limit";

/** Strict limiter for credential endpoints (brute-force protection). */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "RATE_LIMITED", message: "Too many attempts. Please try again later." },
  },
});
