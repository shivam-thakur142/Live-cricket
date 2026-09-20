import { Router } from "express";
import { login, logout, me, register } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../validators/auth.js";

export const authRouter = Router();

authRouter.post("/login", authLimiter, validate({ body: loginSchema }), login);
authRouter.post("/register", authLimiter, validate({ body: registerSchema }), register);
authRouter.get("/me", authenticate, me);
authRouter.post("/logout", authenticate, logout);
