/**
 * prisma migrate deploy for CI/Vercel.
 * Neon pooler URLs cannot acquire pg_advisory_lock — use a direct (non-pooler) URL.
 *
 * On Vercel set DIRECT_URL (or POSTGRES_URL_NON_POOLING) to the Neon *direct* endpoint.
 * DATABASE_URL may stay on the pooler for runtime.
 */
import { execSync } from "node:child_process";

function pickDirectDatabaseUrl(): string {
  const candidates = [
    process.env.DIRECT_URL,
    process.env.DIRECT_DATABASE_URL,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.POSTGRES_URL_NON_POOLING,
  ]
    .map((v) => v?.trim())
    .filter(Boolean) as string[];

  if (candidates[0]) return candidates[0];

  const pooled = process.env.DATABASE_URL?.trim() ?? "";
  const looksPooled =
    pooled.includes("-pooler.") ||
    pooled.includes("pgbouncer=true") ||
    pooled.includes("pooler");

  if (looksPooled) {
    console.error(
      "\n[prisma-migrate-deploy] DATABASE_URL looks like a connection pooler.",
    );
    console.error(
      "Add DIRECT_URL in Vercel → Settings → Environment Variables:",
    );
    console.error(
      "  Neon Console → your DB → Connection string → Direct connection (not pooler).\n",
    );
    process.exit(1);
  }

  if (!pooled) {
    console.error("[prisma-migrate-deploy] DATABASE_URL is not set.");
    process.exit(1);
  }

  return pooled;
}

const migrateUrl = pickDirectDatabaseUrl();
const masked = migrateUrl.replace(/:([^:@/]+)@/, ":****@");
console.log(`[prisma-migrate-deploy] Using ${masked}`);

execSync("npx prisma migrate deploy", {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: migrateUrl,
  },
});
