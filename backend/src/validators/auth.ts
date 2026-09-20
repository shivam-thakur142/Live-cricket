import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("A valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "editor", "viewer"]).default("viewer"),
});
