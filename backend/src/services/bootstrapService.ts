import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";

/**
 * Ensures that at least one admin account exists in the database.
 * If the configured admin user (env.effectiveAdminEmail) does not exist,
 * it creates it using bcrypt with 10 salt rounds.
 * If it already exists, ensures its role is "admin".
 */
export async function ensureDefaultAdmin(): Promise<void> {
  try {
    const adminEmail = env.effectiveAdminEmail;
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existing) {
      const passwordHash = await bcrypt.hash(env.effectiveAdminPassword, 10);
      await prisma.user.create({
        data: {
          name: "SCL Admin",
          email: adminEmail,
          passwordHash,
          role: "admin",
        },
      });
      console.log(`[bootstrap] Created default admin account: ${adminEmail}`);
    } else {
      const isMatch = await bcrypt.compare(env.effectiveAdminPassword, existing.passwordHash);
      if (!isMatch || existing.role !== "admin") {
        const passwordHash = isMatch ? existing.passwordHash : await bcrypt.hash(env.effectiveAdminPassword, 10);
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            role: "admin",
            passwordHash,
          },
        });
        console.log(`[bootstrap] Synced admin account credentials/role: ${adminEmail}`);
      } else {
        console.log(`[bootstrap] Admin account verified: ${adminEmail}`);
      }
    }
  } catch (err) {
    console.error("[bootstrap] Error checking/creating default admin:", err);
  }
}
