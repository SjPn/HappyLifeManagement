import {
  billingPeriodWhere,
  billingUniqueWhere,
  previousBillingPeriod,
  type BillingPeriod,
} from "@/lib/billing";
import { normalizeHouseNumber, normalizeStreet } from "@/lib/household";
import { prisma } from "@/lib/prisma";

export type MeterValues = { day: number; night: number };

export type ElectricityRates = {
  dayRateUah: number;
  nightRateUah: number;
};

export function parseMeterReading(raw: string): number | null {
  const n = Number(String(raw).trim().replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 1000) / 1000;
}

export function roundMoneyUah(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeElectricityCharge(
  current: MeterValues,
  previous: MeterValues | null,
  rates: ElectricityRates,
): {
  deltaDay: number;
  deltaNight: number;
  totalUah: number;
} {
  const prevDay = previous?.day ?? 0;
  const prevNight = previous?.night ?? 0;
  const deltaDay = Math.max(0, current.day - prevDay);
  const deltaNight = Math.max(0, current.night - prevNight);
  const totalUah = roundMoneyUah(
    deltaDay * rates.dayRateUah + deltaNight * rates.nightRateUah,
  );
  return { deltaDay, deltaNight, totalUah };
}

export function meterUniqueWhere(
  communityId: string,
  street: string,
  houseNumber: string,
  period: BillingPeriod,
) {
  return {
    communityId_street_houseNumber_periodYear_periodMonth: {
      communityId,
      street: normalizeStreet(street),
      houseNumber: normalizeHouseNumber(houseNumber),
      periodYear: period.year,
      periodMonth: period.month,
    },
  };
}

export async function getCommunityElectricityRates(communityId: string) {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: {
      electricityDayRateUah: true,
      electricityNightRateUah: true,
    },
  });
  if (!community) {
    return { dayRateUah: 0, nightRateUah: 0 };
  }
  return {
    dayRateUah: community.electricityDayRateUah,
    nightRateUah: community.electricityNightRateUah,
  };
}

export async function getPreviousMeterReading(
  communityId: string,
  street: string,
  houseNumber: string,
  period: BillingPeriod,
) {
  const prev = previousBillingPeriod(period);
  return prisma.householdMeterReading.findUnique({
    where: meterUniqueWhere(communityId, street, houseNumber, prev),
  });
}

export async function applyElectricityToBilling(
  communityId: string,
  street: string,
  houseNumber: string,
  period: BillingPeriod,
  electricityUah: number,
) {
  const s = normalizeStreet(street);
  const h = normalizeHouseNumber(houseNumber);
  const uniqueWhere = billingUniqueWhere(communityId, s, h, period);
  const existing = await prisma.householdBilling.findUnique({
    where: uniqueWhere,
  });
  const amountsChanged =
    existing != null && existing.electricityUah !== electricityUah;

  await prisma.householdBilling.upsert({
    where: uniqueWhere,
    create: {
      communityId,
      street: s,
      houseNumber: h,
      periodYear: period.year,
      periodMonth: period.month,
      subscriptionFeeUah: 0,
      electricityUah,
    },
    update: {
      electricityUah,
      ...(amountsChanged ? { paidAt: null, paymentSentAt: null } : {}),
    },
  });
}
