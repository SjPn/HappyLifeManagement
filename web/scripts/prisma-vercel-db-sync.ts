/**
 * Sync schema on Vercel build (same approach as CI: db push, not migrate deploy).
 *
 * Production was created with db push; migrate deploy fails with P3005 or
 * "relation already exists". Use direct Neon URL (not pooler) for DDL.
 */
import { execSync } from "node:child_process";

function deriveNeonDirectFromPooler(pooled: string): string | null {
  try {
    const u = new URL(pooled);
    if (!u.hostname.includes("-pooler")) return null;
    const directHost = u.hostname.replace(/-pooler(?=\.|$)/, "");
    if (directHost === u.hostname) return null;
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

  if (explicit[0]) return explicit[0];

  const pooled = process.env.DATABASE_URL?.trim() ?? "";
  if (!pooled) {
    console.error("[prisma-vercel-db-sync] DATABASE_URL is not set.");
    process.exit(1);
  }

  const derived = deriveNeonDirectFromPooler(pooled);
  if (derived) return derived;

  const looksPooled =
    pooled.includes("-pooler.") ||
    pooled.includes("pgbouncer=true") ||
    /pooler/i.test(pooled);

  if (looksPooled) {
    console.error(
      "[prisma-vercel-db-sync] Pooler DATABASE_URL but no DIRECT_URL and cannot derive direct host.",
    );
    process.exit(1);
  }

  return pooled;
}

const syncUrl = pickDirectDatabaseUrl();
console.log(
  `[prisma-vercel-db-sync] ${syncUrl.replace(/:([^:@/]+)@/, ":****@")}`,
);

try {
  execSync("npx prisma db push --skip-generate", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: syncUrl },
  });
} catch {
  console.error("[prisma-vercel-db-sync] prisma db push failed (see output above).");
  process.exit(1);
}
