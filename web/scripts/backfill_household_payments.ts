/**
 * Одноразово: перенос платежів з полів User (якщо ще є) у HouseholdPayment по адресі.
 * Запуск: npx tsx scripts/backfill_household_payments.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { householdAddressKey, normalizeHouseNumber, normalizeStreet } from "../src/lib/household";

const prisma = new PrismaClient();

type UserRow = {
  street: string;
  houseNumber: string;
  subscriptionFeeUah?: number;
  electricityUah?: number;
};

async function main() {
  const users = (await prisma.user.findMany({
    where: { role: "RESIDENT" },
    select: {
      street: true,
      houseNumber: true,
      subscriptionFeeUah: true,
      electricityUah: true,
    },
  })) as UserRow[];

  const byKey = new Map<
    string,
    { street: string; houseNumber: string; subscriptionFeeUah: number; electricityUah: number }
  >();

  for (const u of users) {
    const street = normalizeStreet(u.street);
    const houseNumber = normalizeHouseNumber(u.houseNumber);
    const key = householdAddressKey(street, houseNumber);
    const sub = u.subscriptionFeeUah ?? 0;
    const elec = u.electricityUah ?? 0;
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, { street, houseNumber, subscriptionFeeUah: sub, electricityUah: elec });
    } else {
      prev.subscriptionFeeUah = Math.max(prev.subscriptionFeeUah, sub);
      prev.electricityUah = Math.max(prev.electricityUah, elec);
    }
  }

  let upserted = 0;
  for (const row of byKey.values()) {
    if (row.subscriptionFeeUah === 0 && row.electricityUah === 0) continue;
    await prisma.householdPayment.upsert({
      where: {
        street_houseNumber: { street: row.street, houseNumber: row.houseNumber },
      },
      create: row,
      update: {
        subscriptionFeeUah: row.subscriptionFeeUah,
        electricityUah: row.electricityUah,
      },
    });
    upserted++;
  }

  console.log("Household payments upserted:", upserted);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
