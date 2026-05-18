import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRaw<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name
  `;
  console.log("Tables:", tables.map((t) => t.table_name).join(", "));

  const mig = await prisma.$queryRaw<{ migration_name: string }[]>`
    SELECT migration_name FROM _prisma_migrations ORDER BY finished_at
  `.catch(() => []);
  console.log("Migrations:", mig);

  const users = await prisma.user.count().catch(() => -1);
  console.log("Users:", users);

  const community = await prisma.community.count().catch(() => -1);
  console.log("Communities:", community);
}

main()
  .finally(() => prisma.$disconnect());
