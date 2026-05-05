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

const prisma = new PrismaClient();

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

  await prisma.newsPost.create({
    data: {
      title: "Добро пожаловать в Happy Life",
      body: "Это демо-посёлок. Новости, заявки и голосования доступны после входа. Тестовые учётки: chair@hlm.kiev.ua / mod@hlm.kiev.ua / neighbor@happylife.demo.",
      authorId: chair.id,
    },
  });

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

  await prisma.meterReading.create({
    data: {
      userId: resident.id,
      value: 42.5,
      note: "Холодная вода, апрель",
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

  console.log("Seed OK:", { chair: chair.email, mod: mod.email, resident: resident.email, vote: vote.id, topic: topic.id });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
