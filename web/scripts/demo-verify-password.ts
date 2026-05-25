/**
 * Проверка: пароль из .env совпадает с хешем demo-chair в БД (после db:seed).
 * Запуск: cd web && npm run demo:verify
 */
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { demoAutoLoginPassword } from "../src/lib/demo";

config({ path: ".env" });

const prisma = new PrismaClient();
const email = "demo-chair@preview.happylife.estate";

async function main() {
  const pwd = demoAutoLoginPassword();
  const raw = process.env.DEMO_AUTO_LOGIN_PASSWORD?.trim();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { passwordHash: true },
  });
  if (!user) {
    console.error("FAIL: user not found — run npm run db:seed");
    process.exit(1);
  }
  const ok = await bcrypt.compare(pwd, user.passwordHash);
  console.log("DEMO_AUTO_LOGIN_PASSWORD set:", Boolean(raw));
  console.log("password length:", pwd.length);
  console.log("fingerprint:", `${pwd.slice(0, 2)}…${pwd.slice(-2)}`);
  console.log("bcrypt matches DB:", ok);
  if (!ok) {
    console.error("FAIL: re-run npm run db:seed with current .env");
    process.exit(1);
  }
  console.log("OK — use the same value in Coolify (Runtime), then Redeploy.");
}

main()
  .finally(() => prisma.$disconnect());
