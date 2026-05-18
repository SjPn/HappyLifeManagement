/**
 * prisma migrate deploy for CI/Vercel.
 * Neon pooler URLs cannot acquire pg_advisory_lock — migrations need a direct connection.
 */
import { execSync } from "node:child_process";

function deriveNeonDirectFromPooler(pooled: string): string | null {
  try {
    const u = new URL(pooled);
    const host = u.hostname;
    if (!host.includes("-pooler")) return null;

    const directHost = host.replace(/-pooler(?=\.|$)/, "");
    if (directHost === host) return null;

    u.hostname = directHost;
    u.searchParams.delete("pgbouncer");
    return u.toString();
  } catch {
    return null;
  }
}

function pickDirectDatabaseUrl(): string {
  const explicit = [
    process.env.DIRECT_URL,
    process.env.DIRECT_DATABASE_URL,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.POSTGRES_URL_NON_POOLING,
  ]
    .map((v) => v?.trim())
    .filter(Boolean) as string[];

  if (explicit[0]) {
    console.log("[prisma-migrate-deploy] Using DIRECT_URL (explicit)");
    return explicit[0];
  }

  const pooled = process.env.DATABASE_URL?.trim() ?? "";
  if (!pooled) {
    console.error("[prisma-migrate-deploy] DATABASE_URL is not set.");
    process.exit(1);
  }

  const derived = deriveNeonDirectFromPooler(pooled);
  if (derived) {
    console.log(
      "[prisma-migrate-deploy] DIRECT_URL not set — using Neon direct host derived from pooler URL",
    );
    return derived;
  }

  const looksPooled =
    pooled.includes("-pooler.") ||
    pooled.includes("pgbouncer=true") ||
    pooled.includes("pooler");

  if (looksPooled) {
    console.error(
      "\n[prisma-migrate-deploy] DATABASE_URL looks like a pooler but could not derive direct URL.",
    );
    console.error(
      "Add DIRECT_URL in Vercel (Neon → Connection string → Direct connection).\n",
    );
    process.exit(1);
  }

  console.log("[prisma-migrate-deploy] Using DATABASE_URL (already direct)");
  return pooled;
}

const migrateUrl = pickDirectDatabaseUrl();
const masked = migrateUrl.replace(/:([^:@/]+)@/, ":****@");
console.log(`[prisma-migrate-deploy] ${masked}`);

execSync("npx prisma migrate deploy", {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: migrateUrl,
  },
});
