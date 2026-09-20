import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

async function main() {
  // Fail fast if the database is unreachable.
  await prisma.$queryRaw`SELECT 1`;
  console.log("[server] Database connection established.");

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`[server] SCL backend listening on http://localhost:${env.PORT}`);
    console.log(`[server] Health check: http://localhost:${env.PORT}/api/health`);
  });
}

main().catch((err) => {
  console.error("[server] Failed to start:", err);
  process.exit(1);
});
