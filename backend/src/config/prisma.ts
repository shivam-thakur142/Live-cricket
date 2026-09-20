import { PrismaClient } from "@prisma/client";

/**
 * Shared Prisma client. Import this everywhere instead of
 * constructing new PrismaClient instances.
 */
export const prisma = new PrismaClient();
