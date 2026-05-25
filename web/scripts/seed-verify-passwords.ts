/**
 * Проверка: пароли из .env совпадают с хешами в БД (после npm run db:seed).
 */
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { seedPasswords } from "../prisma/seedConfig";

config({ path: ".env" });

const prisma = new PrismaClient();

const accounts = [
  { email: "admin@happylife.demo", key: "admin" as const },
  { email: "chair@happylife.demo", key: "chair" as const },
  { email: "mod@happylife.demo", key: "mod" as const },
  { email: "neighbor@happylife.demo", key: "resident" as const },
];

async function main() {
  const passwords = seedPasswords();
  let failed = false;

  for (const { email, key } of accounts) {
    const pwd = passwords[key];
    const user = await prisma.user.findUnique({
      where: { email },
      select: { passwordHash: true },
    });
    if (!user) {
      console.error(`FAIL ${email}: user not found — run npm run db:seed`);
      failed = true;
      continue;
    }
    const ok = await bcrypt.compare(pwd, user.passwordHash);
    const fp = `${pwd.slice(0, 2)}…${pwd.slice(-2)}`;
    console.log(`${email}: len=${pwd.length} ${fp} bcrypt=${ok ? "OK" : "MISMATCH"}`);
    if (!ok) failed = true;
  }

  if (failed) {
    console.error("\nRe-run: npm run db:seed");
    process.exit(1);
  }
  console.log("\nAll seed passwords match DB.");
}

main().finally(() => prisma.$disconnect());
