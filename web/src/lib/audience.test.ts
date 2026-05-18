import { describe, expect, it } from "vitest";
import { voteAudienceWhere, forumTopicAudienceWhere } from "@/lib/audience";
import { TenancyType } from "@/lib/audience";

describe("voteAudienceWhere", () => {
  it("allows all for staff", () => {
    const w = voteAudienceWhere({
      role: "CHAIR",
      tenancyType: TenancyType.TENANT,
    });
    expect(w).toEqual({});
  });

  it("filters owners only for tenants", () => {
    const w = voteAudienceWhere({
      role: "RESIDENT",
      tenancyType: TenancyType.TENANT,
    });
    expect(w).toHaveProperty("OR");
  });
});

describe("forumTopicAudienceWhere", () => {
  it("matches vote audience rules", () => {
    const w = forumTopicAudienceWhere({
      role: "RESIDENT",
      tenancyType: TenancyType.OWNER,
    });
    expect(w).toHaveProperty("OR");
  });
});
