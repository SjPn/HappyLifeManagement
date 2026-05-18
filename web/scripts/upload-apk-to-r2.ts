/**
 * Upload APK to Cloudflare R2 and print NEXT_PUBLIC_APK_URL for Vercel.
 *
 * Usage (from web/):
 *   npx tsx scripts/upload-apk-to-r2.ts
 *   npx tsx scripts/upload-apk-to-r2.ts path/to/custom.apk
 */
import "dotenv/config";
import { readFile, stat } from "fs/promises";
import path from "path";
import { isR2Configured, publicObjectUrl, putR2Object } from "../src/lib/r2";

const DEFAULT_APK = path.join(process.cwd(), "public", "downloads", "happylife.apk");
const R2_KEY = "releases/happylife.apk";

async function main() {
  const filePath = path.resolve(process.argv[2] ?? DEFAULT_APK);
  if (!isR2Configured()) {
    console.error("R2 is not configured. Set R2_* env vars in web/.env");
    process.exit(1);
  }

  const info = await stat(filePath);
  if (!info.isFile() || info.size === 0) {
    console.error(`APK not found or empty: ${filePath}`);
    console.error("Build APK (see mobile/README.md), then run this script.");
    process.exit(1);
  }

  const body = await readFile(filePath);
  await putR2Object(R2_KEY, body, "application/vnd.android.package-archive");

  const url = publicObjectUrl(R2_KEY);
  console.log("Uploaded:", url);
  console.log("");
  console.log("Add to Vercel (and web/.env):");
  console.log(`NEXT_PUBLIC_APK_URL=${url}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
