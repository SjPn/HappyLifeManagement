-- CreateTable
CREATE TABLE "NewsPostLike" (
    "id" TEXT NOT NULL,
    "newsPostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsPostLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsPostLike_userId_newsPostId_key" ON "NewsPostLike"("userId", "newsPostId");

-- CreateIndex
CREATE INDEX "NewsPostLike_newsPostId_idx" ON "NewsPostLike"("newsPostId");

-- AddForeignKey
ALTER TABLE "NewsPostLike" ADD CONSTRAINT "NewsPostLike_newsPostId_fkey" FOREIGN KEY ("newsPostId") REFERENCES "NewsPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsPostLike" ADD CONSTRAINT "NewsPostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
