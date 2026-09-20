import { prisma } from "../config/prisma.js";
import type { AuthUser } from "../middleware/auth.js";

interface LogInput {
  type: string;
  description: string;
  user?: AuthUser;
  entityType?: string;
  entityId?: string;
}

/** Writes an audit row. Fire-and-forget safe: callers may await or not. */
export async function logActivity(input: LogInput) {
  try {
    await prisma.activity.create({
      data: {
        type: input.type,
        description: input.description,
        userId: input.user?.id ?? null,
        userName: input.user?.name ?? null,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
      },
    });
  } catch (err) {
    console.error("[activity] failed to log:", err);
  }
}
