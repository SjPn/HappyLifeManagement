/**
 * Создаёт или обновляет супер-админа платформы (для прод/локальной БД).
 * npx tsx scripts/ensure_platform_admin.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Role, UserStatus } from "../src/lib/enums";
import { TenancyType } from "../src/lib/audience";

const EMAIL = (process.env.PLATFORM_ADMIN_EMAIL ?? "admin@happylife.demo")
  .trim()
  .toLowerCase();
const PASSWORD = process.env.PLATFORM_ADMIN_PASSWORD ?? "Pl@tf0rmAdm1n";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: {
      passwordHash,
      role: Role.PLATFORM_ADMIN,
      status: UserStatus.APPROVED,
      communityId: null,
      name: "Platform Admin",
    },
    create: {
      email: EMAIL,
      passwordHash,
      name: "Platform Admin",
      street: "—",
      houseNumber: "—",
      role: Role.PLATFORM_ADMIN,
      status: UserStatus.APPROVED,
      tenancyType: TenancyType.OWNER,
      communityId: null,
    },
  });

  console.log("Platform admin ready:");
  console.log("  email:", user.email);
  console.log("  role:", user.role);
  console.log("  id:", user.id);
  console.log("  password: (as in PLATFORM_ADMIN_PASSWORD or default seed)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
