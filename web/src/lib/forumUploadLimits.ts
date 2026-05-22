import { IMAGE_ACCEPT } from "@/lib/uploadLimits";

export const FORUM_MAX_PHOTOS = 25;
export const FORUM_MAX_TOTAL_BYTES = 150 * 1024 * 1024;

export { IMAGE_ACCEPT };

export function parseForumImageFiles(formData: FormData): File[] {
  return formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);
}

/** Returns an `errors` namespace key, or null if OK. */
export function validateForumImages(
  files: File[],
  existingCount = 0,
): string | null {
  const totalCount = existingCount + files.length;
  if (totalCount > FORUM_MAX_PHOTOS) return "forumTooManyPhotos";
  if (files.length === 0) return null;

  let totalBytes = 0;
  for (const file of files) {
    if (file.size > FORUM_MAX_TOTAL_BYTES) return "forumBadFile";
    totalBytes += file.size;
    if (totalBytes > FORUM_MAX_TOTAL_BYTES) return "forumTotalTooLarge";
  }
  return null;
}
