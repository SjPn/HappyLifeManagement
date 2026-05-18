-- AlterTable
ALTER TABLE "Community" ADD COLUMN "approvedAt" TIMESTAMP(3);

-- Existing communities are treated as already approved
UPDATE "Community" SET "approvedAt" = "createdAt" WHERE "approvedAt" IS NULL;
