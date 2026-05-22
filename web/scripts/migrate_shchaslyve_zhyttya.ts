/**
 * Одноразовая миграция прод-БД в поселок «Щасливе Життя».
 * Сохраняет пароли, пользователей и весь контент.
 *
 * Запуск: npx tsx scripts/migrate_shchaslyve_zhyttya.ts
 */
import { PrismaClient } from "@prisma/client";

const COMMUNITY_ID = "cm_shchaslyve_zhyttya";
const COMMUNITY_NAME = "Щасливе Життя";
const COMMUNITY_SLUG = "shchaslyve-zhyttya";
const INVITE_CODE = process.env.INVITE_CODE?.trim();
if (!INVITE_CODE) {
  console.error("Missing INVITE_CODE in env.");
  process.exit(1);
}
const OLD_DEFAULT_ID = "cm_default_community";

const prisma = new PrismaClient();

async function tableExists(name: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ${name}
    ) AS "exists"
  `;
  return Boolean(rows[0]?.exists);
}

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${table} AND column_name = ${column}
    ) AS "exists"
  `;
  return Boolean(rows[0]?.exists);
}

async function ensureCommunity() {
  const hasCommunity = await tableExists("Community");

  if (!hasCommunity) {
    console.log("Community table missing — run: npx prisma migrate deploy");
    process.exit(1);
  }

  const existing = await prisma.community.findFirst({
    where: {
      OR: [
        { id: COMMUNITY_ID },
        { id: OLD_DEFAULT_ID },
        { slug: COMMUNITY_SLUG },
        { name: COMMUNITY_NAME },
      ],
    },
  });

  if (existing && existing.id !== COMMUNITY_ID) {
    console.log(`Merging community ${existing.id} → ${COMMUNITY_ID}`);
    await reassignCommunityId(existing.id, COMMUNITY_ID);
    await prisma.community.delete({ where: { id: existing.id } }).catch(() => null);
  }

  await prisma.community.upsert({
    where: { id: COMMUNITY_ID },
    create: {
      id: COMMUNITY_ID,
      name: COMMUNITY_NAME,
      slug: COMMUNITY_SLUG,
      inviteCode: INVITE_CODE,
      defaultLocale: "uk",
      memorandumVersion: "MVP-2026-05-05",
    },
    update: {
      name: COMMUNITY_NAME,
      slug: COMMUNITY_SLUG,
      inviteCode: INVITE_CODE,
    },
  });
}

async function reassignCommunityId(fromId: string, toId: string) {
  const tables = [
    "User",
    "CommunityAddress",
    "NewsPost",
    "Ticket",
    "Vote",
    "BoardPost",
    "ForumTopic",
    "ForumPost",
    "ConfidentialReport",
    "HouseholdBilling",
    "DirectMessage",
  ] as const;

  for (const table of tables) {
    if (!(await columnExists(table, "communityId"))) continue;
    const n = await prisma.$executeRawUnsafe(
      `UPDATE "${table}" SET "communityId" = $1 WHERE "communityId" = $2`,
      toId,
      fromId,
    );
    if (n > 0) console.log(`  ${table}: ${n} rows`);
  }
}

async function backfillNullCommunityIds() {
  const cid = COMMUNITY_ID;

  if (await columnExists("User", "communityId")) {
    const users = await prisma.$executeRawUnsafe(
      `UPDATE "User" SET "communityId" = $1 WHERE "communityId" IS NULL AND "role" <> 'PLATFORM_ADMIN'`,
      cid,
    );
    console.log(`User (null communityId): ${users}`);
  }

  const entityTables = [
    "CommunityAddress",
    "NewsPost",
    "Ticket",
    "Vote",
    "BoardPost",
    "ForumTopic",
    "ForumPost",
    "ConfidentialReport",
    "HouseholdBilling",
    "DirectMessage",
  ];

  for (const table of entityTables) {
    if (!(await columnExists(table, "communityId"))) continue;
    const n = await prisma.$executeRawUnsafe(
      `UPDATE "${table}" SET "communityId" = $1 WHERE "communityId" IS NULL`,
      cid,
    );
    if (n > 0) console.log(`${table} (null): ${n}`);
  }

  if (await columnExists("User", "communityId")) {
    const old = await prisma.$executeRawUnsafe(
      `UPDATE "User" SET "communityId" = $1 WHERE "communityId" = $2`,
      cid,
      OLD_DEFAULT_ID,
    );
    if (old > 0) console.log(`User (from ${OLD_DEFAULT_ID}): ${old}`);
  }

  for (const table of entityTables) {
    if (!(await columnExists(table, "communityId"))) continue;
    const n = await prisma.$executeRawUnsafe(
      `UPDATE "${table}" SET "communityId" = $1 WHERE "communityId" = $2`,
      cid,
      OLD_DEFAULT_ID,
    );
    if (n > 0) console.log(`${table} (from default): ${n}`);
  }
}

async function printSummary() {
  const c = await prisma.community.findUnique({
    where: { id: COMMUNITY_ID },
    include: {
      _count: {
        select: {
          users: true,
          tickets: true,
          votes: true,
          boardPosts: true,
          forumTopics: true,
          householdBillings: true,
        },
      },
    },
  });

  console.log("\n=== Щасливе Життя ===");
  console.log("ID:", c?.id);
  console.log("Invite code:", c?.inviteCode);
  console.log("Users:", c?._count.users);
  console.log("Tickets:", c?._count.tickets);
  console.log("Votes:", c?._count.votes);
  console.log("Board:", c?._count.boardPosts);
  console.log("Forum topics:", c?._count.forumTopics);
  console.log("Billing rows:", c?._count.householdBillings);

  const chairs = await prisma.user.findMany({
    where: { communityId: COMMUNITY_ID, role: "CHAIR" },
    select: { email: true, name: true },
  });
  const mods = await prisma.user.findMany({
    where: { communityId: COMMUNITY_ID, role: "MODERATOR" },
    select: { email: true, name: true },
  });
  console.log("Chair:", chairs.map((u) => u.email).join(", ") || "—");
  console.log("Moderator:", mods.map((u) => u.email).join(", ") || "—");
}

async function main() {
  console.log("Migrating to community:", COMMUNITY_NAME);

  const hasUserCommunity = await columnExists("User", "communityId");
  if (!hasUserCommunity) {
    console.log("Schema not multi-tenant yet. Running prisma migrate deploy…");
    const { execSync } = await import("child_process");
    execSync("npx prisma migrate deploy", { stdio: "inherit", cwd: process.cwd() });
  }

  await ensureCommunity();
  await backfillNullCommunityIds();

  await prisma.community.delete({ where: { id: OLD_DEFAULT_ID } }).catch(() => {
    console.log("(no old default community to remove)");
  });

  await printSummary();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
