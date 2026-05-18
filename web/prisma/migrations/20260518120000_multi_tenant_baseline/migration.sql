-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "defaultLocale" TEXT NOT NULL DEFAULT 'uk',
    "memorandumBody" TEXT,
    "memorandumVersion" TEXT NOT NULL DEFAULT 'MVP-2026-05-05',
    "tariffsBody" TEXT,
    "blockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Community" ("id", "slug", "name", "inviteCode", "defaultLocale", "updatedAt")
VALUES (
    'cm_shchaslyve_zhyttya',
    'shchaslyve-zhyttya',
    'Щасливе Життя',
    'HAPPY2026',
    'uk',
    CURRENT_TIMESTAMP
);

-- Community: users
ALTER TABLE "User" ADD COLUMN "communityId" TEXT;
UPDATE "User" SET "communityId" = 'cm_shchaslyve_zhyttya' WHERE "role" <> 'PLATFORM_ADMIN';
ALTER TABLE "User" ADD CONSTRAINT "User_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- UserSeenState: messagesAt
ALTER TABLE "UserSeenState" ADD COLUMN IF NOT EXISTS "messagesAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CommunityAddress
ALTER TABLE "CommunityAddress" ADD COLUMN "communityId" TEXT;
UPDATE "CommunityAddress" SET "communityId" = 'cm_shchaslyve_zhyttya';
ALTER TABLE "CommunityAddress" ALTER COLUMN "communityId" SET NOT NULL;
ALTER TABLE "CommunityAddress" DROP CONSTRAINT IF EXISTS "CommunityAddress_street_houseNumber_key";
ALTER TABLE "CommunityAddress" ADD CONSTRAINT "CommunityAddress_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "CommunityAddress_communityId_street_houseNumber_key" ON "CommunityAddress"("communityId", "street", "houseNumber");

-- NewsPost
ALTER TABLE "NewsPost" ADD COLUMN "communityId" TEXT;
UPDATE "NewsPost" SET "communityId" = 'cm_shchaslyve_zhyttya';
ALTER TABLE "NewsPost" ALTER COLUMN "communityId" SET NOT NULL;
ALTER TABLE "NewsPost" ADD CONSTRAINT "NewsPost_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Ticket
ALTER TABLE "Ticket" ADD COLUMN "communityId" TEXT;
UPDATE "Ticket" SET "communityId" = 'cm_shchaslyve_zhyttya';
ALTER TABLE "Ticket" ALTER COLUMN "communityId" SET NOT NULL;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Vote
ALTER TABLE "Vote" ADD COLUMN "communityId" TEXT;
UPDATE "Vote" SET "communityId" = 'cm_shchaslyve_zhyttya';
ALTER TABLE "Vote" ALTER COLUMN "communityId" SET NOT NULL;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- BoardPost
ALTER TABLE "BoardPost" ADD COLUMN "communityId" TEXT;
UPDATE "BoardPost" SET "communityId" = 'cm_shchaslyve_zhyttya';
ALTER TABLE "BoardPost" ALTER COLUMN "communityId" SET NOT NULL;
ALTER TABLE "BoardPost" ADD CONSTRAINT "BoardPost_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ForumTopic
ALTER TABLE "ForumTopic" ADD COLUMN "communityId" TEXT;
UPDATE "ForumTopic" SET "communityId" = 'cm_shchaslyve_zhyttya';
ALTER TABLE "ForumTopic" ALTER COLUMN "communityId" SET NOT NULL;
ALTER TABLE "ForumTopic" ADD CONSTRAINT "ForumTopic_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ForumPost
ALTER TABLE "ForumPost" ADD COLUMN "communityId" TEXT;
UPDATE "ForumPost" fp SET "communityId" = t."communityId" FROM "ForumTopic" t WHERE fp."topicId" = t."id";
UPDATE "ForumPost" SET "communityId" = 'cm_shchaslyve_zhyttya' WHERE "communityId" IS NULL;
ALTER TABLE "ForumPost" ALTER COLUMN "communityId" SET NOT NULL;
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ConfidentialReport
ALTER TABLE "ConfidentialReport" ADD COLUMN "communityId" TEXT;
UPDATE "ConfidentialReport" SET "communityId" = 'cm_shchaslyve_zhyttya';
ALTER TABLE "ConfidentialReport" ALTER COLUMN "communityId" SET NOT NULL;
ALTER TABLE "ConfidentialReport" ADD CONSTRAINT "ConfidentialReport_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- HouseholdBilling
ALTER TABLE "HouseholdBilling" ADD COLUMN "communityId" TEXT;
UPDATE "HouseholdBilling" SET "communityId" = 'cm_shchaslyve_zhyttya';
ALTER TABLE "HouseholdBilling" ALTER COLUMN "communityId" SET NOT NULL;
ALTER TABLE "HouseholdBilling" DROP CONSTRAINT IF EXISTS "HouseholdBilling_street_houseNumber_periodYear_periodMonth_key";
ALTER TABLE "HouseholdBilling" ADD CONSTRAINT "HouseholdBilling_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "HouseholdBilling_communityId_street_houseNumber_periodYear_periodMonth_key" ON "HouseholdBilling"("communityId", "street", "houseNumber", "periodYear", "periodMonth");

-- DirectMessage
CREATE TABLE "DirectMessage" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DirectMessage_communityId_recipientId_createdAt_idx" ON "DirectMessage"("communityId", "recipientId", "createdAt");
CREATE INDEX "DirectMessage_communityId_senderId_createdAt_idx" ON "DirectMessage"("communityId", "senderId", "createdAt");

ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Community indexes
CREATE UNIQUE INDEX "Community_slug_key" ON "Community"("slug");
CREATE UNIQUE INDEX "Community_inviteCode_key" ON "Community"("inviteCode");
