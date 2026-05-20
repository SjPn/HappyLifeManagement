-- Community-wide electricity rates (not per billing period)
ALTER TABLE "Community" ADD COLUMN "electricityDayRateUah" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Community" ADD COLUMN "electricityNightRateUah" DOUBLE PRECISION NOT NULL DEFAULT 0;

UPDATE "Community" c
SET
  "electricityDayRateUah" = COALESCE(t."dayRateUah", 0),
  "electricityNightRateUah" = COALESCE(t."nightRateUah", 0)
FROM (
  SELECT DISTINCT ON ("communityId")
    "communityId",
    "dayRateUah",
    "nightRateUah"
  FROM "CommunityElectricityTariff"
  ORDER BY "communityId", "periodYear" DESC, "periodMonth" DESC
) t
WHERE c."id" = t."communityId";

DROP TABLE "CommunityElectricityTariff";
