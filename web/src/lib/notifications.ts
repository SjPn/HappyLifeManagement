import { prisma } from "@/lib/prisma";
import { voteAudienceWhere } from "@/lib/audience";
import { Role, UserStatus } from "@/lib/enums";
import { countForumUnreadTotal } from "@/lib/forumUnread";
import { normalizeHouseNumber, normalizeStreet } from "@/lib/household";
import { countTicketsUnread } from "@/lib/ticketUnread";
import { communityWhere } from "@/lib/tenant";

export const NotificationScope = {
  news: "news",
  votes: "votes",
  tickets: "tickets",
  payments: "payments",
  board: "board",
  forum: "forum",
  reports: "reports",
} as const;

export type NotificationScope =
  (typeof NotificationScope)[keyof typeof NotificationScope];

export type NotificationCounts = {
  news: number;
  votes: number;
  tickets: number;
  payments: number;
  board: number;
  forum: number;
  reports: number;
  home: number;
  requests: number;
  community: number;
  /** Unread direct messages (recipient, readAt is null). */
  messages: number;
  /** Residents awaiting chair approval (staff only). */
  pendingResidents: number;
};

type SessionUser = {
  id: string;
  role: string;
  communityId: string;
  tenancyType?: string | null;
  street?: string;
  houseNumber?: string;
};

async function getSeenState(userId: string) {
  return prisma.userSeenState.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function markNotificationSeen(
  userId: string,
  scope: NotificationScope,
) {
  const now = new Date();
  const patch = {
    newsAt: scope === "news" ? now : undefined,
    votesAt: scope === "votes" ? now : undefined,
    ticketsAt: scope === "tickets" ? now : undefined,
    paymentsAt: scope === "payments" ? now : undefined,
    boardAt: scope === "board" ? now : undefined,
    forumAt: scope === "forum" ? now : undefined,
    reportsAt: scope === "reports" ? now : undefined,
  };
  const update = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined),
  );
  await prisma.userSeenState.upsert({
    where: { userId },
    create: { userId, ...update },
    update,
  });
}

export async function getNotificationCounts(
  user: SessionUser,
): Promise<NotificationCounts> {
  const seen = await getSeenState(user.id);
  const now = new Date();
  const tenant = communityWhere(user.communityId);

  const [news, votes, tickets, payments, board, forum] = await Promise.all([
    prisma.newsPost.count({
      where: { ...tenant, createdAt: { gt: seen.newsAt } },
    }),
    prisma.vote.count({
      where: {
        ...tenant,
        createdAt: { gt: seen.votesAt },
        AND: [
          { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
          voteAudienceWhere({
            role: user.role,
            tenancyType: user.tenancyType,
          }),
        ],
      },
    }),
    countTicketsUnread(user.id, user.communityId, user.role),
    countPayments(user, seen.paymentsAt),
    prisma.boardPost.count({
      where: { ...tenant, createdAt: { gt: seen.boardAt } },
    }),
    countForumUnreadTotal(user.id, user.communityId, {
      role: user.role,
      tenancyType: user.tenancyType,
    }),
  ]);

  const requests = tickets;

  const messages = await prisma.directMessage.count({
    where: {
      ...tenant,
      recipientId: user.id,
      readAt: null,
    },
  });

  let pendingResidents = 0;
  if (user.role === Role.CHAIR || user.role === Role.MODERATOR) {
    pendingResidents = await prisma.user.count({
      where: {
        ...tenant,
        role: Role.RESIDENT,
        status: UserStatus.PENDING,
      },
    });
  }

  const home = news + votes + tickets + payments + pendingResidents;
  const community = board + forum + messages;
  const reports = 0;

  return {
    news,
    votes,
    tickets,
    payments,
    board,
    forum,
    reports,
    home,
    requests,
    community,
    messages,
    pendingResidents,
  };
}

async function countPayments(user: SessionUser, since: Date) {
  if (user.role === Role.CHAIR) {
    return 0;
  }
  const tenant = communityWhere(user.communityId);
  if (!user.street || !user.houseNumber) return 0;
  return prisma.householdBilling.count({
    where: {
      ...tenant,
      street: normalizeStreet(user.street),
      houseNumber: normalizeHouseNumber(user.houseNumber),
      paymentSentAt: { gt: since },
      paidAt: null,
    },
  });
}

/** Snapshot «прочитано до» для подсветки элементов на странице до markNotificationSeen. */
export async function getNotificationSeenAt(
  userId: string,
  scope: "tickets" | "payments",
): Promise<Date> {
  const seen = await getSeenState(userId);
  return scope === "tickets" ? seen.ticketsAt : seen.paymentsAt;
}

