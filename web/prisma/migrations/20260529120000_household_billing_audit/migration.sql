-- CreateTable
CREATE TABLE "HouseholdBillingAuditLog" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "houseNumber" TEXT NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseholdBillingAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HouseholdBillingAuditLog_communityId_street_houseNumber_periodYear_periodMonth_createdAt_idx" ON "HouseholdBillingAuditLog"("communityId", "street", "houseNumber", "periodYear", "periodMonth", "createdAt");

-- AddForeignKey
ALTER TABLE "HouseholdBillingAuditLog" ADD CONSTRAINT "HouseholdBillingAuditLog_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
