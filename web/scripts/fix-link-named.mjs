import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const srcDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src");

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p);
    else if (/\.(tsx|ts)$/.test(p)) {
      let c = fs.readFileSync(p, "utf8");
      if (c.includes('import Link from "@/i18n/navigation"')) {
        c = c.replace(
          'import Link from "@/i18n/navigation"',
          'import { Link } from "@/i18n/navigation"',
        );
        fs.writeFileSync(p, c);
      }
    }
  }
}

walk(srcDir);
