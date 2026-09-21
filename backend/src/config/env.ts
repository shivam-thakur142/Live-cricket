import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  FRONTEND_URL: z.string().default("http://localhost:5173,https://live-cricket-gilt.vercel.app"),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(6).optional(),
  SEED_ADMIN_EMAIL: z.string().email().default("admin@scl.local"),
  SEED_ADMIN_PASSWORD: z.string().min(6).default("Admin@123"),
  SEED_EDITOR_EMAIL: z.string().email().default("editor@scl.local"),
  SEED_EDITOR_PASSWORD: z.string().min(6).default("Editor@123"),
  SEED_VIEWER_EMAIL: z.string().email().default("viewer@scl.local"),
  SEED_VIEWER_PASSWORD: z.string().min(6).default("Viewer@123"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const rawEnv = parsed.data;

export const env = {
  ...rawEnv,
  effectiveAdminEmail: (rawEnv.ADMIN_EMAIL || rawEnv.SEED_ADMIN_EMAIL).toLowerCase(),
  effectiveAdminPassword: rawEnv.ADMIN_PASSWORD || rawEnv.SEED_ADMIN_PASSWORD,
};
export const isProd = env.NODE_ENV === "production";

