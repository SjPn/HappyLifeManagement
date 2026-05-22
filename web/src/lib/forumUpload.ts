import { prisma } from "@/lib/prisma";
import { savePublicUpload } from "@/lib/upload";
import {
  FORUM_MAX_TOTAL_BYTES,
  parseForumImageFiles,
  validateForumImages,
} from "@/lib/forumUploadLimits";

export {
  FORUM_MAX_PHOTOS,
  FORUM_MAX_TOTAL_BYTES,
  parseForumImageFiles,
  validateForumImages,
} from "@/lib/forumUploadLimits";

export async function saveForumImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const url = await savePublicUpload(file, {
      maxBytes: FORUM_MAX_TOTAL_BYTES,
    });
    if (url) urls.push(url);
  }
  return urls;
}

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
