import { prisma } from "@/lib/prisma";

export {
  FORUM_MAX_PHOTOS,
  FORUM_MAX_TOTAL_BYTES,
  validateForumImages,
} from "@/lib/forumUploadLimits";

export async function createForumPostImages(
  postId: string,
  urls: string[],
  startOrder = 0,
): Promise<void> {
  if (urls.length === 0) return;
  await prisma.forumPostImage.createMany({
    data: urls.map((imageUrl, i) => ({
      postId,
      imageUrl,
      sortOrder: startOrder + i,
    })),
  });
}
