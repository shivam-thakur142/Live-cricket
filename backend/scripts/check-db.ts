import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const rows = await prisma.$queryRawUnsafe<{ ok: number; version: string }[]>(
  "SELECT 1+1 AS ok, version() AS version"
);
console.log("DB connection OK:", rows[0].ok);
console.log("Server:", rows[0].version.split(",")[0]);
const tables = await prisma.$queryRawUnsafe<{ tablename: string }[]>(
  "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
);
console.log("Tables:", tables.map((t) => t.tablename).join(", "));
await prisma.$disconnect();
