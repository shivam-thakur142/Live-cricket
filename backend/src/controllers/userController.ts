import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { created, ok } from "../utils/response.js";
import { serializeActivity, serializeUser, settingsToObject } from "../services/serializers.js";
import { logActivity } from "../services/activityService.js";

/** GET /api/users (admin) */
export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  ok(res, rows.map(serializeUser));
});

/** POST /api/users (admin) */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, avatarUrl } = req.body;
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) throw ApiError.conflict("A user with this email already exists");

  const row = await prisma.user.create({
    data: { name, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 10), role, avatarUrl },
  });
  void logActivity({ type: "user", description: `User ${row.name} created (${row.role})`, user: req.user, entityType: "user", entityId: row.id });
  created(res, serializeUser(row));
});

/** PATCH /api/users/:id/role (admin) */
export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound("User not found");
  if (existing.id === req.user!.id && req.body.role !== "admin") {
    throw ApiError.conflict("You cannot demote your own admin account");
  }
  const row = await prisma.user.update({ where: { id: req.params.id }, data: { role: req.body.role } });
  void logActivity({ type: "user", description: `Changed ${row.name}'s role to ${row.role}`, user: req.user, entityType: "user", entityId: row.id });
  ok(res, serializeUser(row));
});

/** DELETE /api/users/:id (admin) */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound("User not found");
  if (existing.id === req.user!.id) throw ApiError.conflict("You cannot delete your own account");
  await prisma.user.delete({ where: { id: req.params.id } });
  void logActivity({ type: "user", description: `Deleted user ${existing.name}`, user: req.user, entityType: "user", entityId: existing.id });
  ok(res, { deleted: true });
});

/** GET /api/activities (authenticated admin-panel users) */
export const listActivities = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const rows = await prisma.activity.findMany({ orderBy: { createdAt: "desc" }, take: limit });
  ok(res, rows.map(serializeActivity));
});

/** GET /api/settings (public — footer/contact info) */
export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await prisma.setting.findMany();
  ok(res, settingsToObject(rows));
});

/** PUT /api/settings (admin) — upserts the provided keys. */
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const entries = Object.entries(req.body as Record<string, string>);
  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } })
    )
  );
  void logActivity({ type: "settings", description: "Updated platform settings", user: req.user });
  const rows = await prisma.setting.findMany();
  ok(res, settingsToObject(rows));
});
