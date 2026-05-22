-- CreateTable
CREATE TABLE "ForumPostImage" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumPostImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ForumPostImage_postId_idx" ON "ForumPostImage"("postId");

-- AddForeignKey
ALTER TABLE "ForumPostImage" ADD CONSTRAINT "ForumPostImage_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate legacy single imageUrl
INSERT INTO "ForumPostImage" ("id", "postId", "imageUrl", "sortOrder", "createdAt")
SELECT
    'fpi_' || "id",
    "id",
    "imageUrl",
    0,
    COALESCE("createdAt", CURRENT_TIMESTAMP)
FROM "ForumPost"
WHERE "imageUrl" IS NOT NULL AND TRIM("imageUrl") <> '';
