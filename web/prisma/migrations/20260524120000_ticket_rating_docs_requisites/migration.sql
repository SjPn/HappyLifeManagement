-- AlterTable
ALTER TABLE "Community" ADD COLUMN "paymentRequisites" TEXT;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN "statusChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Ticket" ADD COLUMN "rating" INTEGER;
ALTER TABLE "Ticket" ADD COLUMN "ratedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CommunityDocument" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunityDocument_communityId_idx" ON "CommunityDocument"("communityId");

-- AddForeignKey
ALTER TABLE "CommunityDocument" ADD CONSTRAINT "CommunityDocument_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityDocument" ADD CONSTRAINT "CommunityDocument_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
