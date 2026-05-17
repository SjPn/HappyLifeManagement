/**
 * Одноразово: перенос з таблиці HouseholdPayment (без місяця) у HouseholdBilling.
 * Запуск: npx tsx scripts/migrate_household_billing.ts
 */
import { PrismaClient } from "@prisma/client";
import { currentBillingPeriod } from "../src/lib/billing";
import { normalizeHouseNumber, normalizeStreet } from "../src/lib/household";

const prisma = new PrismaClient();

type LegacyRow = {
  id: string;
  street: string;
  houseNumber: string;
  subscriptionFeeUah: number;
  electricityUah: number;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

async function main() {
  const period = currentBillingPeriod();
  let rows: LegacyRow[] = [];

  try {
    rows = await prisma.$queryRaw<LegacyRow[]>`
      SELECT id, street, "houseNumber", "subscriptionFeeUah", "electricityUah",
             "paidAt", "createdAt", "updatedAt"
      FROM "HouseholdPayment"
    `;
  } catch {
    console.log("HouseholdPayment table not found — nothing to migrate.");
    return;
  }

  if (rows.length === 0) {
    console.log("No legacy rows.");
    return;
  }

  for (const r of rows) {
    const street = normalizeStreet(r.street);
    const houseNumber = normalizeHouseNumber(r.houseNumber);
    await prisma.householdBilling.upsert({
      where: {
        street_houseNumber_periodYear_periodMonth: {
          street,
          houseNumber,
          periodYear: period.year,
          periodMonth: period.month,
        },
      },
      create: {
        street,
        houseNumber,
        periodYear: period.year,
        periodMonth: period.month,
        subscriptionFeeUah: r.subscriptionFeeUah,
        electricityUah: r.electricityUah,
        paidAt: r.paidAt,
        createdAt: r.createdAt,
      },
      update: {
        subscriptionFeeUah: r.subscriptionFeeUah,
        electricityUah: r.electricityUah,
        paidAt: r.paidAt,
      },
    });
    console.log(`Migrated ${street} ${houseNumber}`);
  }

  console.log(`Done: ${rows.length} address(es) → ${period.year}-${period.month}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
