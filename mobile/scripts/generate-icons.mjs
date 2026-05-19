/**
 * Generate Android mipmap icons from mobile/icon/icon-1024.png
 * Usage: node scripts/generate-icons.mjs
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "icon", "icon-1024.png");
const res = path.join(root, "android", "app", "src", "main", "res");

const densities = {
  mdpi: { launcher: 48, foreground: 108 },
  hdpi: { launcher: 72, foreground: 162 },
  xhdpi: { launcher: 96, foreground: 216 },
  xxhdpi: { launcher: 144, foreground: 324 },
  xxxhdpi: { launcher: 192, foreground: 432 },
};

const input = await readFile(src);

for (const [density, sizes] of Object.entries(densities)) {
  const dir = path.join(res, `mipmap-${density}`);
  await mkdir(dir, { recursive: true });

  for (const name of ["ic_launcher", "ic_launcher_round"]) {
    const buf = await sharp(input)
      .resize(sizes.launcher, sizes.launcher, { fit: "cover" })
      .png()
      .toBuffer();
    await writeFile(path.join(dir, `${name}.png`), buf);
  }

  const fg = await sharp(input)
    .resize(sizes.foreground, sizes.foreground, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await writeFile(path.join(dir, "ic_launcher_foreground.png"), fg);
}

console.log("Android launcher icons updated from", src);
