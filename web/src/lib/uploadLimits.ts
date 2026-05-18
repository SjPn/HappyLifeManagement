/** Client-safe upload limits (no Node fs). */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif";

/** Returns an `errors` namespace key, or null if OK / no file. */
export function validateImageFile(file: File | null | undefined): string | null {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_UPLOAD_BYTES) return "badFile";
  return null;
}
