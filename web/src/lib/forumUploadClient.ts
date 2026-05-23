"use client";

import {
  FORUM_MAX_PHOTOS,
  validateForumImages,
} from "@/lib/forumUploadLimits";

/** 5 minutes per file (large phone photos). */
const UPLOAD_TIMEOUT_MS = 5 * 60 * 1000;

function uploadApiUrl(): string {
  if (typeof window !== "undefined") {
    return new URL("/api/forum/upload-image", window.location.origin).href;
  }
  return "/api/forum/upload-image";
}

async function postOneFile(file: File): Promise<
  | { ok: true; url: string }
  | { ok: false; error: string }
> {
  const fd = new FormData();
  fd.append("file", file);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const res = await fetch(uploadApiUrl(), {
      method: "POST",
      body: fd,
      credentials: "same-origin",
      signal: controller.signal,
    });
    let data: { url?: string; error?: string } = {};
    try {
      data = (await res.json()) as { url?: string; error?: string };
    } catch {
      /* non-JSON */
    }
    if (!res.ok || !data.url) {
      if (res.status === 413) return { ok: false, error: "forumTotalTooLarge" };
      return { ok: false, error: data.error || "uploadFailed" };
    }
    return { ok: true, url: data.url };
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      return { ok: false, error: "uploadTimeout" };
    }
    return { ok: false, error: "networkError" };
  } finally {
    clearTimeout(timer);
  }
}

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
    const result = await postOneFile(files[i]);
    if (!result.ok) return { error: result.error };
    urls.push(result.url);
    if (urls.length + existingCount > FORUM_MAX_PHOTOS) {
      return { error: "forumTooManyPhotos" };
    }
  }
  return { urls };
}
