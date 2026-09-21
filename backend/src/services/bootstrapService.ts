import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";

/**
 * Ensures that at least one admin account exists in the database.
 * If the configured admin user (env.effectiveAdminEmail) does not exist,
 * it creates it using bcrypt with 10 salt rounds.
 * If it already exists, ensures its role is "admin".
 */
async function ensureUser(
  name: string,
  email: string,
  rawPassword: string,
  role: "admin" | "editor" | "viewer"
): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!existing) {
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role,
      },
    });
    console.log(`[bootstrap] Created default ${role} account: ${normalizedEmail}`);
  } else {
    const isMatch = await bcrypt.compare(rawPassword, existing.passwordHash);
    if (!isMatch || existing.role !== role) {
      const passwordHash = isMatch ? existing.passwordHash : await bcrypt.hash(rawPassword, 10);
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          role,
          passwordHash,
        },
      });
      console.log(`[bootstrap] Synced ${role} account credentials/role: ${normalizedEmail}`);
    } else {
      console.log(`[bootstrap] Verified ${role} account: ${normalizedEmail}`);
    }
  }
}

/**
 * Ensures default admin, editor, and viewer accounts exist in the database.
 */
export async function ensureDefaultAdmin(): Promise<void> {
  try {
    await ensureUser("SCL Admin", env.effectiveAdminEmail, env.effectiveAdminPassword, "admin");
    await ensureUser("Tournament Editor", env.SEED_EDITOR_EMAIL, env.SEED_EDITOR_PASSWORD, "editor");
    await ensureUser("Guest Viewer", env.SEED_VIEWER_EMAIL, env.SEED_VIEWER_PASSWORD, "viewer");
  } catch (err) {
    console.error("[bootstrap] Error checking/creating default users:", err);
  }
}
