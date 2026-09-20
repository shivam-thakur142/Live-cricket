import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("A valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "editor", "viewer"]).default("viewer"),
  avatarUrl: z.string().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["admin", "editor", "viewer"]),
});

export const updateSettingsSchema = z.record(
  z.string().min(1),
  z.string()
);
