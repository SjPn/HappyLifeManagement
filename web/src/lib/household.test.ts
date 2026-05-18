import { describe, expect, it } from "vitest";
import {
  normalizeHouseNumber,
  normalizeStreet,
  householdAddressKey,
} from "@/lib/household";

describe("household normalization", () => {
  it("normalizes street whitespace and case", () => {
    expect(normalizeStreet("  лісова  ")).toBe("лісова");
  });

  it("normalizes house number", () => {
    expect(normalizeHouseNumber(" 12а ")).toBe("12а");
  });

  it("builds stable address key", () => {
    expect(householdAddressKey("Лісова", "5")).toBe(
      householdAddressKey("лісова", "5"),
    );
  });
});
