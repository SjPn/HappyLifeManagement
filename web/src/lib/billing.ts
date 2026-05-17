import { dateLocaleForUi } from "@/lib/dateLocale";
import { normalizeHouseNumber, normalizeStreet } from "@/lib/household";

export type BillingPeriod = { year: number; month: number };

export function currentBillingPeriod(now = new Date()): BillingPeriod {
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function parseBillingPeriod(
  y?: string | string[] | null,
  m?: string | string[] | null,
): BillingPeriod {
  const cur = currentBillingPeriod();
  const yRaw = Array.isArray(y) ? y[0] : y;
  const mRaw = Array.isArray(m) ? m[0] : m;
  const year = Number(yRaw);
  const month = Number(mRaw);
  if (
    Number.isInteger(year) &&
    year >= 2020 &&
    year <= 2100 &&
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12
  ) {
    return { year, month };
  }
  return cur;
}

export function billingPeriodKey(p: BillingPeriod): string {
  return `${p.year}-${String(p.month).padStart(2, "0")}`;
}

export function shiftBillingPeriod(
  p: BillingPeriod,
  deltaMonths: number,
): BillingPeriod {
  const d = new Date(p.year, p.month - 1 + deltaMonths, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function formatBillingPeriodLabel(
  locale: string,
  p: BillingPeriod,
): string {
  const date = new Date(p.year, p.month - 1, 1);
  return date.toLocaleDateString(dateLocaleForUi(locale), {
    month: "long",
    year: "numeric",
  });
}

export function billingPeriodWhere(p: BillingPeriod) {
  return { periodYear: p.year, periodMonth: p.month };
}

export function billingUniqueWhere(
  street: string,
  houseNumber: string,
  p: BillingPeriod,
) {
  return {
    street_houseNumber_periodYear_periodMonth: {
      street: normalizeStreet(street),
      houseNumber: normalizeHouseNumber(houseNumber),
      periodYear: p.year,
      periodMonth: p.month,
    },
  };
}

export function compareBillingPeriods(
  a: BillingPeriod,
  b: BillingPeriod,
): number {
  if (a.year !== b.year) return a.year - b.year;
  return a.month - b.month;
}
