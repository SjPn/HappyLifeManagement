import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  BoardCategory,
  TicketCategory,
  UserStatus,
  VoteType,
} from "../src/lib/enums";
import { AudienceScope, TenancyType } from "../src/lib/audience";
import {
  DEMO_COMMUNITY_ID,
  demoAutoLoginPassword,
  demoUserSpecs,
} from "../src/lib/demo";
import { normalizeHouseNumber, normalizeStreet } from "../src/lib/household";

async function ensureAddress(
  prisma: PrismaClient,
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

export async function seedDemoCommunity(prisma: PrismaClient) {
  const hash = bcrypt.hashSync(demoAutoLoginPassword(), 10);

  const community = await prisma.community.upsert({
    where: { id: DEMO_COMMUNITY_ID },
    update: {
      name: "Демо · Котеджний городок",
      slug: "demo-preview",
      approvedAt: new Date(),
      blockedAt: null,
      inviteCode: "DEMO-PREVIEW-NOT-USED",
    },
    create: {
      id: DEMO_COMMUNITY_ID,
      slug: "demo-preview",
      name: "Демо · Котеджний городок",
      inviteCode: "DEMO-PREVIEW-NOT-USED",
      defaultLocale: "uk",
      approvedAt: new Date(),
      electricityDayRateUah: 4.32,
      electricityNightRateUah: 2.16,
      paymentRequisites: "Демо-реквізити (не для реальних платежів)",
      memorandumBody:
        "Демонстраційний меморандум. У реальному котеджному містечку тут правила вашого КГ.",
    },
  });

  const userIds: Record<string, string> = {};

  for (const spec of demoUserSpecs) {
    const user = await prisma.user.upsert({
      where: { email: spec.email },
      update: {
        name: spec.name,
        role: spec.role,
        status: UserStatus.APPROVED,
        tenancyType: spec.tenancyType,
        communityId: community.id,
        passwordHash: hash,
      },
      create: {
        email: spec.email,
        passwordHash: hash,
        name: spec.name,
        street: spec.street,
        houseNumber: spec.houseNumber,
        role: spec.role,
        status: UserStatus.APPROVED,
        tenancyType: spec.tenancyType,
        communityId: community.id,
        balanceUah: spec.key === "tenant" ? 0 : 0,
      },
    });
    const addr = await ensureAddress(
      prisma,
      community.id,
      spec.street,
      spec.houseNumber,
    );
    await prisma.user.update({
      where: { id: user.id },
      data: {
        communityAddressId: addr.id,
        street: addr.street,
        houseNumber: addr.houseNumber,
      },
    });
    userIds[spec.key] = user.id;
  }

  const chairId = userIds.chair;
  const ownerId = userIds.resident;
  const tenantId = userIds.tenant;

  const existingNews = await prisma.newsPost.count({
    where: { communityId: community.id },
  });

  if (existingNews === 0) {
    await prisma.newsPost.create({
      data: {
        communityId: community.id,
        title: "Ласкаво просимо в демо-портал",
        body: "Це демо-котеджне містечко. Спробуйте заявки, новини та платежі — без реєстрації вашого КГ.",
        authorId: chairId,
      },
    });

    await prisma.newsPost.create({
      data: {
        communityId: community.id,
        title: "Нагадування: показання лічильників до 25 числа",
        body: "Внесіть день/ніч у розділі платежів. У демо суми вже надіслані для будинку №12.",
        authorId: chairId,
      },
    });

    const vote = await prisma.vote.create({
      data: {
        communityId: community.id,
        title: "Ремонт головної дороги в червні?",
        description: "Приклад голосування з терміном і підсумком.",
        type: VoteType.YES_NO,
        audience: AudienceScope.ALL,
        endsAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        options: {
          create: [
            { text: "Так", sortOrder: 0 },
            { text: "Ні", sortOrder: 1 },
          ],
        },
      },
    });

    await prisma.voteResponse.create({
      data: {
        userId: ownerId,
        voteId: vote.id,
        optionId: (
          await prisma.voteOption.findFirstOrThrow({
            where: { voteId: vote.id, sortOrder: 0 },
          })
        ).id,
      },
    });

    await prisma.ticket.create({
      data: {
        communityId: community.id,
        category: TicketCategory.ROADS,
        description: "Яма біля повороту на вул. Березова",
        status: "IN_PROGRESS",
        userId: tenantId,
        comments: {
          create: {
            authorId: chairId,
            body: "Передали підряднику, очікуємо на наступному тижні.",
          },
        },
      },
    });

    await prisma.ticket.create({
      data: {
        communityId: community.id,
        category: TicketCategory.LIGHTING,
        description: "Не працює ліхтар біля воріт №8",
        status: "NEW",
        userId: ownerId,
      },
    });

    await prisma.boardPost.create({
      data: {
        communityId: community.id,
        category: BoardCategory.SELL_GIVE,
        title: "Віддам дитячий велосипед",
        body: "Після 8 років, самовивіз з Лісової 8.",
        userId: ownerId,
      },
    });

    const topic = await prisma.forumTopic.create({
      data: {
        communityId: community.id,
        title: "Графік прибирання території",
        audience: AudienceScope.ALL,
        userId: ownerId,
        posts: {
          create: [
            {
              communityId: community.id,
              body: "Пропоную складати список дежурних на липень.",
              userId: ownerId,
            },
            {
              communityId: community.id,
              body: "Підтримую, можу координувати.",
              userId: tenantId,
            },
          ],
        },
      },
    });

    await prisma.communityDocument.create({
      data: {
        communityId: community.id,
        title: "Статут КГ (демо PDF)",
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        authorId: chairId,
      },
    });

    const tenantAddr = await ensureAddress(
      prisma,
      community.id,
      "Березова",
      "12",
    );
    const now = new Date();
    await prisma.householdBilling.upsert({
      where: {
        communityId_street_houseNumber_periodYear_periodMonth: {
          communityId: community.id,
          street: tenantAddr.street,
          houseNumber: tenantAddr.houseNumber,
          periodYear: now.getFullYear(),
          periodMonth: now.getMonth() + 1,
        },
      },
      create: {
        communityId: community.id,
        street: tenantAddr.street,
        houseNumber: tenantAddr.houseNumber,
        periodYear: now.getFullYear(),
        periodMonth: now.getMonth() + 1,
        subscriptionFeeUah: 920,
        electricityUah: 385,
        paymentSentAt: new Date(),
      },
      update: {
        subscriptionFeeUah: 920,
        electricityUah: 385,
        paymentSentAt: new Date(),
        paidAt: null,
      },
    });

    await prisma.directMessage.create({
      data: {
        communityId: community.id,
        senderId: chairId,
        recipientId: tenantId,
        body: "Доброго дня! У демо можна перевірити повідомлення між мешканцями.",
      },
    });

    console.log("Demo seed OK:", { community: community.slug, topic: topic.id });
  }

  return community;
}
