"use server";

import { auth } from "@/auth";
import { parseBillingPeriod } from "@/lib/billing";
import { listHouseholdBillingAudit } from "@/lib/billingAudit";
import { normalizeHouseNumber, normalizeStreet } from "@/lib/household";
import { requireCommunityId } from "@/lib/tenant";

export async function fetchHouseholdBillingAudit(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "CHAIR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);
  const year = Number(formData.get("periodYear"));
  const month = Number(formData.get("periodMonth"));
  const period = parseBillingPeriod(String(year || ""), String(month || ""));
  const street = normalizeStreet(String(formData.get("street") || ""));
  const houseNumber = normalizeHouseNumber(String(formData.get("houseNumber") || ""));

  if (!period || !street || !houseNumber) {
    return { error: "badData" as const };
  }

  const entries = await listHouseholdBillingAudit({
    communityId,
    street,
    houseNumber,
    period,
  });

  return { ok: true as const, entries };
}
