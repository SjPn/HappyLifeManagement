"use server";

import { auth } from "@/auth";
import {
  applyElectricityToBilling,
  computeElectricityCharge,
  getCommunityElectricityRates,
  getPreviousMeterReading,
  meterUniqueWhere,
  parseMeterReading,
} from "@/lib/electricity";
import { parseBillingPeriod, type BillingPeriod } from "@/lib/billing";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import { normalizeHouseNumber, normalizeStreet } from "@/lib/household";
import { requireCommunityId } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

function parsePeriodFromForm(formData: FormData): BillingPeriod | null {
  const year = Number(formData.get("periodYear"));
  const month = Number(formData.get("periodMonth"));
  return parseBillingPeriod(String(year || ""), String(month || ""));
}

function parseRate(raw: string): number | null {
  const n = Number(String(raw).trim().replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 10000) / 10000;
}

export async function saveElectricityTariff(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "CHAIR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);
  const dayRateUah = parseRate(String(formData.get("dayRateUah") || ""));
  const nightRateUah = parseRate(String(formData.get("nightRateUah") || ""));

  if (dayRateUah === null || nightRateUah === null) {
    return { error: "badData" as const };
  }

  await prisma.community.update({
    where: { id: communityId },
    data: { electricityDayRateUah: dayRateUah, electricityNightRateUah: nightRateUah },
  });

  revalidateAllLocales("/payments");
  return { ok: true as const };
}

export async function saveHouseholdMeterReading(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "CHAIR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);
  const period = parsePeriodFromForm(formData);
  const street = normalizeStreet(String(formData.get("street") || ""));
  const houseNumber = normalizeHouseNumber(
    String(formData.get("houseNumber") || ""),
  );
  const dayReading = parseMeterReading(
    String(formData.get("dayReading") ?? ""),
  );
  const nightReading = parseMeterReading(
    String(formData.get("nightReading") ?? ""),
  );

  if (!period || !street || !houseNumber) {
    return { error: "badData" as const };
  }
  if (dayReading === null || nightReading === null) {
    return { error: "badReadings" as const };
  }

  const rates = await getCommunityElectricityRates(communityId);
  if (rates.dayRateUah <= 0 && rates.nightRateUah <= 0) {
    return { error: "noTariff" as const };
  }

  const prevRow = await getPreviousMeterReading(
    communityId,
    street,
    houseNumber,
    period,
  );
  const prev =
    prevRow?.dayReading != null && prevRow?.nightReading != null
      ? { day: prevRow.dayReading, night: prevRow.nightReading }
      : null;

  const { totalUah, deltaDay, deltaNight } = computeElectricityCharge(
    { day: dayReading, night: nightReading },
    prev,
    rates,
  );

  await prisma.householdMeterReading.upsert({
    where: meterUniqueWhere(communityId, street, houseNumber, period),
    create: {
      communityId,
      street,
      houseNumber,
      periodYear: period.year,
      periodMonth: period.month,
      dayReading,
      nightReading,
    },
    update: { dayReading, nightReading },
  });

  await applyElectricityToBilling(
    communityId,
    street,
    houseNumber,
    period,
    totalUah,
  );

  revalidateAllLocales("/payments");
  revalidateAllLocales("/dashboard");

  return {
    ok: true as const,
    electricityUah: totalUah,
    deltaDay,
    deltaNight,
  };
}
