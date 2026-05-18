const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export function sniffImageMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "image/png";
  }
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x38
  ) {
    return "image/gif";
  }
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

function extFromFilename(name: string): string | null {
  const lower = name.toLowerCase();
  for (const ext of Object.keys(EXT_TO_MIME)) {
    if (lower.endsWith(ext)) return ext;
  }
  return null;
}

/** Server Actions often send File with empty `type` — detect from name and bytes. */
export function resolveImageUploadMeta(
  file: File,
  buf: Buffer,
): { contentType: string; ext: string } | null {
  const fromType = MIME_TO_EXT[file.type];
  if (fromType) {
    return { contentType: file.type, ext: fromType };
  }

  const nameExt = extFromFilename(file.name);
  if (nameExt) {
    return { contentType: EXT_TO_MIME[nameExt], ext: nameExt };
  }

  const sniffed = sniffImageMime(buf);
  if (sniffed) {
    return { contentType: sniffed, ext: MIME_TO_EXT[sniffed] };
  }

  return null;
}
