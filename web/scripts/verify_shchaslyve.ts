import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const CID = "cm_shchaslyve_zhyttya";

async function main() {
  const orphans = {
    users: await prisma.user.count({
      where: {
        role: { not: "PLATFORM_ADMIN" },
        OR: [{ communityId: null }, { communityId: { not: CID } }],
      },
    }),
    tickets: await prisma.ticket.count({
      where: { OR: [{ communityId: null }, { communityId: { not: CID } }] },
    }),
    votes: await prisma.vote.count({
      where: { OR: [{ communityId: null }, { communityId: { not: CID } }] },
    }),
    billing: await prisma.householdBilling.count({
      where: { OR: [{ communityId: null }, { communityId: { not: CID } }] },
    }),
  };

  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      status: true,
      communityId: true,
      passwordHash: true,
    },
  });

  console.log("Orphans (should be 0):", orphans);
  console.log(
    "Users:",
    users.map((u) => ({
      email: u.email,
      role: u.role,
      status: u.status,
      communityId: u.communityId,
      hasPassword: u.passwordHash.length > 10,
    })),
  );
}

main().finally(() => prisma.$disconnect());
