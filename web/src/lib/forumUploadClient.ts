"use client";

import {
  FORUM_MAX_PHOTOS,
  validateForumImages,
} from "@/lib/forumUploadLimits";

export async function uploadForumPhotos(
  files: File[],
  existingCount = 0,
  onProgress?: (current: number, total: number) => void,
): Promise<{ urls: string[] } | { error: string }> {
  const validation = validateForumImages(files, existingCount);
  if (validation) return { error: validation };

  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    onProgress?.(i + 1, files.length);
    const fd = new FormData();
    fd.append("file", files[i]);
    const res = await fetch("/api/forum/upload-image", {
      method: "POST",
      body: fd,
      credentials: "same-origin",
    });
    let data: { url?: string; error?: string } = {};
    try {
      data = (await res.json()) as { url?: string; error?: string };
    } catch {
      /* proxy HTML / truncated body */
    }
    if (!res.ok || !data.url) {
      if (res.status === 413) return { error: "forumTotalTooLarge" };
      return { error: data.error || "uploadFailed" };
    }
    urls.push(data.url);
    if (urls.length + existingCount > FORUM_MAX_PHOTOS) {
      return { error: "forumTooManyPhotos" };
    }
  }
  return { urls };
}
