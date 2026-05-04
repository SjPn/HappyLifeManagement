import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

/** Сохраняет файл в `public/uploads`, возвращает публичный URL или null */
export async function savePublicUpload(
  file: File | null | undefined,
): Promise<string | null> {
  if (!file || !(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
  const ext = MIME_TO_EXT[file.type];
  if (!ext) {
    throw new Error("FILE_TYPE");
  }
  const name = randomUUID() + ext;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buf);
  return `/uploads/${name}`;
}
