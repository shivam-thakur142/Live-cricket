/**
 * Starts a local embedded PostgreSQL server for development.
 * No system installation required — real PostgreSQL binaries managed by npm.
 *
 * Usage:  npm run db:start
 * Then:   npm run db:migrate && npm run seed
 */
import EmbeddedPostgres from "embedded-postgres";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.EMBEDDED_PG_PORT ?? 5433);
const DATABASE = process.env.EMBEDDED_PG_DATABASE ?? "scl";
const dataDir = path.join(__dirname, "..", ".pgdata");

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: true,
});

async function main() {
  const alreadyInitialized = fs.existsSync(path.join(dataDir, "PG_VERSION"));
  if (alreadyInitialized) {
    console.log(`[db] Existing cluster found in .pgdata — skipping initdb.`);
  } else {
    console.log(`[db] Initializing embedded PostgreSQL on port ${PORT}...`);
    await pg.initialise();
  }
  await pg.start();
  try {
    await pg.createDatabase(DATABASE);
    console.log(`[db] Database "${DATABASE}" created.`);
  } catch {
    console.log(`[db] Database "${DATABASE}" already exists.`);
  }
  console.log(`[db] Ready. DATABASE_URL=postgresql://postgres:postgres@localhost:${PORT}/${DATABASE}`);
  console.log("[db] Press Ctrl+C to stop.");
  process.on("SIGINT", async () => {
    await pg.stop();
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    await pg.stop();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("[db] Failed to start:", err);
  process.exit(1);
});
