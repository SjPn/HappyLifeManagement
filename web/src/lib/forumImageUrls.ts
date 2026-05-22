import { FORUM_MAX_PHOTOS } from "@/lib/forumUploadLimits";

/** URLs from client-side uploads (`imageUrls` JSON in FormData). */
export function parseUploadedImageUrls(formData: FormData): string[] {
  const raw = String(formData.get("imageUrls") || "").trim();
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (u): u is string =>
        typeof u === "string" &&
        (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("/uploads/")),
    );
  } catch {
    return [];
  }
}

export function validateImageUrlCount(
  newCount: number,
  existingCount = 0,
): string | null {
  if (existingCount + newCount > FORUM_MAX_PHOTOS) return "forumTooManyPhotos";
  return null;
}
