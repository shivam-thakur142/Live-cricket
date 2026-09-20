import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { ok, created } from "../utils/response.js";
import { serializeUser } from "../services/serializers.js";
import { logActivity } from "../services/activityService.js";
import { signToken } from "../middleware/auth.js";

/** POST /api/auth/login */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  // Same response for unknown email and wrong password (no user enumeration).
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = signToken(user);
  void logActivity({ type: "auth", description: `${user.name} logged in`, user: req.user, entityType: "user", entityId: user.id });
  ok(res, { token, user: serializeUser(user) });
});

/** GET /api/auth/me */
export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) throw ApiError.unauthorized("User no longer exists");
  ok(res, serializeUser(user));
});

/** POST /api/auth/logout — stateless JWT: client discards the token. */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  void logActivity({ type: "auth", description: `${req.user!.name} logged out`, user: req.user });
  ok(res, { message: "Logged out" });
});

/**
 * POST /api/auth/register
 * Bootstrap: open when no users exist (creates an admin).
 * Afterwards: admin-only (used by the Users admin page).
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role: "admin" | "editor" | "viewer";
  };

  const userCount = await prisma.user.count();
  const isBootstrap = userCount === 0;
  if (!isBootstrap && req.user?.role !== "admin") {
    throw ApiError.forbidden("Only admins can create users");
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) throw ApiError.conflict("A user with this email already exists");

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      role: isBootstrap ? "admin" : role,
    },
  });

  void logActivity({
    type: "user",
    description: `User ${user.name} created (${user.role})`,
    user: req.user,
    entityType: "user",
    entityId: user.id,
  });

  created(res, serializeUser(user));
});
