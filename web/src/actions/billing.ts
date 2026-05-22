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
import {
  BillingAuditAction,
  logHouseholdBillingChange,
  type BillingAuditActor,
} from "@/lib/billingAudit";

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

  const actor: BillingAuditActor = {
    id: session.user.id!,
    name:
      session.user.name?.trim() ||
      session.user.email?.trim() ||
      "—",
  };

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
    await logHouseholdBillingChange({
      communityId,
      street,
      houseNumber,
      period: targetPeriod,
      actor,
      action: BillingAuditAction.COPIED_FROM_PREV,
      details: {
        sourcePeriodYear: source.year,
        sourcePeriodMonth: source.month,
        subscriptionFeeUah: row.subscriptionFeeUah,
        electricityUah: row.electricityUah,
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
