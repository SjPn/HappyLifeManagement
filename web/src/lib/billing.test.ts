import { describe, expect, it } from "vitest";
import {
  billingPeriodKey,
  billingUniqueWhere,
  parseBillingPeriod,
  shiftBillingPeriod,
} from "@/lib/billing";

describe("billing", () => {
  it("parses valid period from query", () => {
    expect(parseBillingPeriod("2026", "5")).toEqual({ year: 2026, month: 5 });
  });

  it("falls back to current period on bad input", () => {
    const cur = parseBillingPeriod("x", "y");
    expect(cur.month).toBeGreaterThanOrEqual(1);
    expect(cur.month).toBeLessThanOrEqual(12);
  });

  it("formats period key", () => {
    expect(billingPeriodKey({ year: 2026, month: 3 })).toBe("2026-03");
  });

  it("shifts months", () => {
    expect(shiftBillingPeriod({ year: 2026, month: 1 }, -1)).toEqual({
      year: 2025,
      month: 12,
    });
  });

  it("builds unique where with communityId", () => {
    const w = billingUniqueWhere("c1", "Лісова", "5", {
      year: 2026,
      month: 5,
    });
    expect(w.communityId_street_houseNumber_periodYear_periodMonth.communityId).toBe(
      "c1",
    );
  });
});
