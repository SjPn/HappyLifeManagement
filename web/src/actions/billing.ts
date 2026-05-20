"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  billingPeriodWhere,
  parseBillingPeriod,
  previousBillingPeriod,
  type BillingPeriod,
} from "@/lib/billing";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import { normalizeHouseNumber, normalizeStreet } from "@/lib/household";
import { requireCommunityId } from "@/lib/tenant";

export async function copyBillingFromPreviousMonth(
  targetPeriod: BillingPeriod,
) {
  const session = await auth();
  if (session?.user?.role !== "CHAIR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);
  const source = previousBillingPeriod(targetPeriod);

  const sourceRows = await prisma.householdBilling.findMany({
    where: billingPeriodWhere(communityId, source),
  });

  if (sourceRows.length === 0) {
    return { error: "noSourceMonth" as const };
  }

  let copied = 0;
  for (const row of sourceRows) {
    const street = normalizeStreet(row.street);
    const houseNumber = normalizeHouseNumber(row.houseNumber);
    await prisma.householdBilling.upsert({
      where: {
        communityId_street_houseNumber_periodYear_periodMonth: {
          communityId,
          street,
          houseNumber,
          periodYear: targetPeriod.year,
          periodMonth: targetPeriod.month,
        },
      },
      create: {
        communityId,
        street,
        houseNumber,
        periodYear: targetPeriod.year,
        periodMonth: targetPeriod.month,
        subscriptionFeeUah: row.subscriptionFeeUah,
        electricityUah: row.electricityUah,
      },
      update: {
        subscriptionFeeUah: row.subscriptionFeeUah,
        electricityUah: row.electricityUah,
        paidAt: null,
        paymentSentAt: null,
      },
    });
    copied += 1;
  }

  revalidateAllLocales("/payments");
  revalidateAllLocales("/dashboard");
  return { ok: true as const, copied };
}

export async function copyBillingFromPreviousMonthAction(formData: FormData) {
  const year = Number(formData.get("periodYear"));
  const month = Number(formData.get("periodMonth"));
  const period = parseBillingPeriod(String(year || ""), String(month || ""));
  if (!period) return { error: "badData" as const };
  return copyBillingFromPreviousMonth(period);
}
