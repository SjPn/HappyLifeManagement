/**
 * Одноразово: створити CommunityAddress з унікальних street/houseNumber користувачів
 * і прив’язати communityAddressId.
 * Запуск: npx tsx scripts/backfill_community_addresses.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { householdAddressKey, normalizeHouseNumber, normalizeStreet } from "../src/lib/household";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, street: true, houseNumber: true, communityAddressId: true },
  });

  const byKey = new Map<string, { street: string; houseNumber: string; userIds: string[] }>();

  for (const u of users) {
    const street = normalizeStreet(u.street);
    const houseNumber = normalizeHouseNumber(u.houseNumber);
    if (!street || !houseNumber) continue;
    const key = householdAddressKey(street, houseNumber);
    const row = byKey.get(key) ?? { street, houseNumber, userIds: [] };
    row.userIds.push(u.id);
    byKey.set(key, row);
  }

  let addresses = 0;
  let linked = 0;

  for (const row of byKey.values()) {
    const addr = await prisma.communityAddress.upsert({
      where: {
        street_houseNumber: { street: row.street, houseNumber: row.houseNumber },
      },
      create: { street: row.street, houseNumber: row.houseNumber },
      update: {},
    });
    addresses++;
    for (const userId of row.userIds) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          communityAddressId: addr.id,
          street: addr.street,
          houseNumber: addr.houseNumber,
        },
      });
      linked++;
    }
  }

  console.log("Community addresses upserted:", addresses, "users linked:", linked);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
