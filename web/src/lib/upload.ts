import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { resolveImageUploadMeta } from "@/lib/imageMime";
import { isR2Configured, publicObjectUrl, putR2Object } from "@/lib/r2";
import { MAX_UPLOAD_BYTES } from "@/lib/uploadLimits";

export { MAX_UPLOAD_BYTES } from "@/lib/uploadLimits";

async function saveLocalUpload(
  name: string,
  buf: Buffer,
): Promise<string> {
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return `/uploads/${name}`;
}

async function saveR2Upload(
  name: string,
  buf: Buffer,
  contentType: string,
): Promise<string> {
  const key = `uploads/${name}`;
  await putR2Object(key, buf, contentType);
  return publicObjectUrl(key);
}

function storageTarget(): "r2" | "local" {
  if (isR2Configured()) return "r2";
  if (process.env.VERCEL) {
    throw new Error("STORAGE_NOT_CONFIGURED");
  }
  return "local";
}

/** JPEG/PNG/WEBP/GIF → URL (R2 на Vercel, локально `public/uploads`). */
export async function savePublicUpload(
  file: File | null | undefined,
): Promise<string | null> {
  if (!file || !(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const meta = resolveImageUploadMeta(file, buf);
  if (!meta) {
    throw new Error("FILE_TYPE");
  }

  const name = randomUUID() + meta.ext;

  if (storageTarget() === "r2") {
    return saveR2Upload(name, buf, meta.contentType);
  }

  return saveLocalUpload(name, buf);
}
