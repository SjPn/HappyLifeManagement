import { prisma } from "@/lib/prisma";
import { Role, UserStatus } from "@/lib/enums";
import { countBoardUnread } from "@/lib/boardUnread";
import { countDocumentsUnread } from "@/lib/documentUnread";
import { countForumUnreadTotal } from "@/lib/forumUnread";
import { countNewsUnread } from "@/lib/newsUnread";
import { countPaymentsUnread } from "@/lib/paymentUnread";
import { countTicketsUnread } from "@/lib/ticketUnread";
import { countVotesUnread } from "@/lib/voteUnread";
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
  documents: number;
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
  const tenant = communityWhere(user.communityId);

  const audience = {
    role: user.role,
    tenancyType: user.tenancyType,
  };

  const [news, votes, tickets, payments, board, forum, documents] =
    await Promise.all([
      countNewsUnread(user.id, user.communityId),
      countVotesUnread(user.id, user.communityId, audience),
      countTicketsUnread(user.id, user.communityId, user.role),
      countPaymentsUnread(user.id, user),
      countBoardUnread(user.id, user.communityId),
      countForumUnreadTotal(user.id, user.communityId, audience),
      countDocumentsUnread(user.id, user.communityId),
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
  const community = board + forum + messages + documents;
  const reports = 0;

  return {
    news,
    votes,
    tickets,
    payments,
    board,
    forum,
    documents,
    reports,
    home,
    requests,
    community,
    messages,
    pendingResidents,
  };
}


