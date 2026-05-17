import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  BoardCategory,
  ReportKind,
  Role,
  TicketCategory,
  UserStatus,
  VoteType,
} from "../src/lib/enums";
import { AudienceScope, TenancyType } from "../src/lib/audience";
import { normalizeHouseNumber, normalizeStreet } from "../src/lib/household";

const prisma = new PrismaClient();

async function ensureAddress(street: string, houseNumber: string) {
  const s = normalizeStreet(street);
  const h = normalizeHouseNumber(houseNumber);
  return prisma.communityAddress.upsert({
    where: { street_houseNumber: { street: s, houseNumber: h } },
    create: { street: s, houseNumber: h },
    update: {},
  });
}

async function linkUserAddress(
  userId: string,
  street: string,
  houseNumber: string,
) {
  const addr = await ensureAddress(street, houseNumber);
  await prisma.user.update({
    where: { id: userId },
    data: {
      communityAddressId: addr.id,
      street: addr.street,
      houseNumber: addr.houseNumber,
    },
  });
  return addr;
}

async function main() {
  const hash = (p: string) => bcrypt.hashSync(p, 10);

  const chair = await prisma.user.upsert({
    where: { email: "chair@hlm.kiev.ua" },
    update: { tenancyType: TenancyType.OWNER },
    create: {
      email: "chair@hlm.kiev.ua",
      passwordHash: hash("H@ppYL!fe"),
      name: "Иван Председателев",
      street: "Лесная",
      houseNumber: "1",
      role: Role.CHAIR,
      status: UserStatus.APPROVED,
      tenancyType: TenancyType.OWNER,
      balanceUah: 0,
    },
  });

  const mod = await prisma.user.upsert({
    where: { email: "mod@hlm.kiev.ua" },
    update: { tenancyType: TenancyType.OWNER },
    create: {
      email: "mod@hlm.kiev.ua",
      passwordHash: hash("M0deR@toR$"),
      name: "Мария Модераторова",
      street: "Лесная",
      houseNumber: "2",
      role: Role.MODERATOR,
      status: UserStatus.APPROVED,
      tenancyType: TenancyType.OWNER,
      balanceUah: 0,
    },
  });

  const resident = await prisma.user.upsert({
    where: { email: "neighbor@happylife.demo" },
    update: { tenancyType: TenancyType.TENANT },
    create: {
      email: "neighbor@happylife.demo",
      passwordHash: hash("demo123"),
      name: "Пётр Соседкин",
      street: "Берёзовая",
      houseNumber: "15",
      role: Role.RESIDENT,
      status: UserStatus.APPROVED,
      tenancyType: TenancyType.TENANT,
      balanceUah: 3500,
    },
  });

  await linkUserAddress(chair.id, chair.street, chair.houseNumber);
  await linkUserAddress(mod.id, mod.street, mod.houseNumber);
  const residentAddr = await linkUserAddress(
    resident.id,
    resident.street,
    resident.houseNumber,
  );

  const vote = await prisma.vote.create({
    data: {
      title: "Провести ямочный ремонт главной дороги в июне?",
      description: "Работы планируются за счёт целевого взноса.",
      type: VoteType.YES_NO,
      audience: AudienceScope.ALL,
      endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      options: {
        create: [
          { text: "Так", sortOrder: 0 },
          { text: "Ні", sortOrder: 1 },
        ],
      },
    },
  });

  await prisma.boardPost.create({
    data: {
      category: BoardCategory.SELL_GIVE,
      title: "Отдам саженцы смородины",
      body: "Самовывоз, участок 15. Написать в комментарии темы на форуме.",
      userId: resident.id,
    },
  });

  const topic = await prisma.forumTopic.create({
    data: {
      title: "Организация дежурств по уборке",
      audience: AudienceScope.ALL,
      userId: resident.id,
      posts: {
        create: {
          body: "Предлагаю составить график на лето — кто готов координировать?",
          userId: resident.id,
        },
      },
    },
  });

  await prisma.confidentialReport.create({
    data: {
      kind: ReportKind.SUGGESTION,
      category: "Благоустройство",
      body: "Просьба рассмотреть установку лавочки у пруда.",
      authorId: resident.id,
      published: true,
      status: "REVIEWING",
    },
  });

  const now = new Date();
  await prisma.householdBilling.upsert({
    where: {
      street_houseNumber_periodYear_periodMonth: {
        street: residentAddr.street,
        houseNumber: residentAddr.houseNumber,
        periodYear: now.getFullYear(),
        periodMonth: now.getMonth() + 1,
      },
    },
    create: {
      street: residentAddr.street,
      houseNumber: residentAddr.houseNumber,
      periodYear: now.getFullYear(),
      periodMonth: now.getMonth() + 1,
      subscriptionFeeUah: 850,
      electricityUah: 420.5,
    },
    update: {
      subscriptionFeeUah: 850,
      electricityUah: 420.5,
    },
  });

  await prisma.ticket.create({
    data: {
      category: TicketCategory.ROADS,
      description: "Выбоина на повороте к калитке",
      status: "NEW",
      userId: resident.id,
    },
  });

  console.log("Seed OK:", {
    chair: chair.email,
    mod: mod.email,
    resident: resident.email,
    vote: vote.id,
    topic: topic.id,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
