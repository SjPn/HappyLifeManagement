-- CreateTable
CREATE TABLE "UserEntitySeen" (
    "userId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserEntitySeen_pkey" PRIMARY KEY ("userId","entityType","entityId")
);

-- CreateIndex
CREATE INDEX "UserEntitySeen_userId_entityType_idx" ON "UserEntitySeen"("userId", "entityType");
