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
import { generateInviteCode } from "../src/lib/tenant";

const prisma = new PrismaClient();

async function ensureAddress(
  communityId: string,
  street: string,
  houseNumber: string,
) {
  const s = normalizeStreet(street);
  const h = normalizeHouseNumber(houseNumber);
  return prisma.communityAddress.upsert({
    where: {
      communityId_street_houseNumber: {
        communityId,
        street: s,
        houseNumber: h,
      },
    },
    create: { communityId, street: s, houseNumber: h },
    update: {},
  });
}

async function linkUserAddress(
  userId: string,
  communityId: string,
  street: string,
  houseNumber: string,
) {
  const addr = await ensureAddress(communityId, street, houseNumber);
  await prisma.user.update({
    where: { id: userId },
    data: {
      communityId,
      communityAddressId: addr.id,
      street: addr.street,
      houseNumber: addr.houseNumber,
    },
  });
  return addr;
}

async function main() {
  const hash = (p: string) => bcrypt.hashSync(p, 10);

  const community = await prisma.community.upsert({
    where: { id: "cm_shchaslyve_zhyttya" },
    update: {
      name: "Щасливе Життя",
      slug: "shchaslyve-zhyttya",
      inviteCode: process.env.INVITE_CODE?.trim() || "HAPPY2026",
    },
    create: {
      id: "cm_shchaslyve_zhyttya",
      slug: "shchaslyve-zhyttya",
      name: "Щасливе Життя",
      inviteCode: process.env.INVITE_CODE?.trim() || "HAPPY2026",
      defaultLocale: "uk",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@happylife.demo" },
    update: { role: Role.PLATFORM_ADMIN, communityId: null },
    create: {
      email: "admin@happylife.demo",
      passwordHash: hash("Pl@tf0rmAdm1n"),
      name: "Platform Admin",
      street: "—",
      houseNumber: "—",
      role: Role.PLATFORM_ADMIN,
      status: UserStatus.APPROVED,
      tenancyType: TenancyType.OWNER,
      balanceUah: 0,
      communityId: null,
    },
  });

  const chair = await prisma.user.upsert({
    where: { email: "chair@hlm.kiev.ua" },
    update: { tenancyType: TenancyType.OWNER, communityId: community.id },
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
      communityId: community.id,
    },
  });

  const mod = await prisma.user.upsert({
    where: { email: "mod@hlm.kiev.ua" },
    update: { tenancyType: TenancyType.OWNER, communityId: community.id },
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
      communityId: community.id,
    },
  });

  const resident = await prisma.user.upsert({
    where: { email: "neighbor@happylife.demo" },
    update: { tenancyType: TenancyType.TENANT, communityId: community.id },
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
      communityId: community.id,
    },
  });

  await linkUserAddress(chair.id, community.id, chair.street, chair.houseNumber);
  await linkUserAddress(mod.id, community.id, mod.street, mod.houseNumber);
  const residentAddr = await linkUserAddress(
    resident.id,
    community.id,
    resident.street,
    resident.houseNumber,
  );

  const vote = await prisma.vote.create({
    data: {
      communityId: community.id,
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
      communityId: community.id,
      category: BoardCategory.SELL_GIVE,
      title: "Отдам саженцы смородины",
      body: "Самовывоз, участок 15. Написать в комментарии темы на форуме.",
      userId: resident.id,
    },
  });

  const topic = await prisma.forumTopic.create({
    data: {
      communityId: community.id,
      title: "Организация дежурств по уборке",
      audience: AudienceScope.ALL,
      userId: resident.id,
      posts: {
        create: {
          communityId: community.id,
          body: "Предлагаю составить график на лето — кто готов координировать?",
          userId: resident.id,
        },
      },
    },
  });

  await prisma.confidentialReport.create({
    data: {
      communityId: community.id,
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
      communityId_street_houseNumber_periodYear_periodMonth: {
        communityId: community.id,
        street: residentAddr.street,
        houseNumber: residentAddr.houseNumber,
        periodYear: now.getFullYear(),
        periodMonth: now.getMonth() + 1,
      },
    },
    create: {
      communityId: community.id,
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
      communityId: community.id,
      category: TicketCategory.ROADS,
      description: "Выбоина на повороте к калитке",
      status: "NEW",
      userId: resident.id,
    },
  });

  console.log("Seed OK:", {
    community: community.slug,
    inviteCode: community.inviteCode,
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
