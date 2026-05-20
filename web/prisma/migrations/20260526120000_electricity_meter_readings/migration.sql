-- Electricity meter readings and dual-tariff rates per billing period
CREATE TABLE "CommunityElectricityTariff" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "dayRateUah" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nightRateUah" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityElectricityTariff_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HouseholdMeterReading" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "houseNumber" TEXT NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "dayReading" DOUBLE PRECISION,
    "nightReading" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseholdMeterReading_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunityElectricityTariff_communityId_periodYear_periodMonth_key" ON "CommunityElectricityTariff"("communityId", "periodYear", "periodMonth");

CREATE UNIQUE INDEX "HouseholdMeterReading_communityId_street_houseNumber_periodYear_periodMonth_key" ON "HouseholdMeterReading"("communityId", "street", "houseNumber", "periodYear", "periodMonth");

CREATE INDEX "HouseholdMeterReading_communityId_periodYear_periodMonth_idx" ON "HouseholdMeterReading"("communityId", "periodYear", "periodMonth");

ALTER TABLE "CommunityElectricityTariff" ADD CONSTRAINT "CommunityElectricityTariff_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HouseholdMeterReading" ADD CONSTRAINT "HouseholdMeterReading_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
