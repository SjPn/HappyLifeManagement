import { prisma } from "@/lib/prisma";
import {
  billingPeriodWhere,
  currentBillingPeriod,
  type BillingPeriod,
} from "@/lib/billing";
import { voteAudienceWhere } from "@/lib/audience";
import { countNewsUnread } from "@/lib/newsUnread";
import { countTicketsUnread } from "@/lib/ticketUnread";
import { communityWhere } from "@/lib/tenant";

export type CommunityHubStats = {
  messages: number;
  board: number;
  forumTopics: number;
  newsPosts: number;
};

export type RequestsHubStats = {
  newCount: number;
  inProgressCount: number;
  archiveCount: number;
};

export type PaymentsHubStats = {
  households: number;
  paidCount: number;
  unpaidCount: number;
};

export type ResidentDashboardStats = {
  openTickets: number;
  activeVotes: number;
  unreadMessages: number;
  /** Непрочитані новини (не загальна кількість постів). */
  unreadNews: number;
  /** Заявки з оновленням після останнього перегляду. */
  unreadTickets: number;
};

export async function getCommunityHubStats(
  communityId: string,
  userId: string,
): Promise<CommunityHubStats> {
  const tenant = communityWhere(communityId);
  const [messages, board, forumTopics, newsPosts] = await Promise.all([
    prisma.directMessage.count({
      where: { ...tenant, recipientId: userId, readAt: null },
    }),
    prisma.boardPost.count({ where: tenant }),
    prisma.forumTopic.count({ where: tenant }),
    prisma.newsPost.count({ where: tenant }),
  ]);
  return { messages, board, forumTopics, newsPosts };
}

export async function getRequestsHubStats(
  communityId: string,
  staff: boolean,
  userId: string,
): Promise<RequestsHubStats> {
  const baseWhere = staff
    ? communityWhere(communityId)
    : { ...communityWhere(communityId), userId };

  const [newCount, inProgressCount, archiveCount] = await Promise.all([
    prisma.ticket.count({ where: { ...baseWhere, status: "NEW" } }),
    prisma.ticket.count({ where: { ...baseWhere, status: "IN_PROGRESS" } }),
    prisma.ticket.count({ where: { ...baseWhere, status: "RESOLVED" } }),
  ]);

  return { newCount, inProgressCount, archiveCount };
}

export async function getPaymentsHubStats(
  communityId: string,
  period: BillingPeriod = currentBillingPeriod(),
): Promise<PaymentsHubStats> {
  const billings = await prisma.householdBilling.findMany({
    where: billingPeriodWhere(communityId, period),
    select: { paidAt: true, subscriptionFeeUah: true, electricityUah: true },
  });

  const households = billings.length;
  const paidCount = billings.filter((b) => b.paidAt != null).length;
  const unpaidCount = billings.filter(
    (b) =>
      b.paidAt == null && (b.subscriptionFeeUah > 0 || b.electricityUah > 0),
  ).length;

  return { households, paidCount, unpaidCount };
}

export async function getResidentDashboardStats(
  communityId: string,
  userId: string,
  audience: { role: string; tenancyType?: string | null },
): Promise<ResidentDashboardStats> {
  const tenant = communityWhere(communityId);
  const now = new Date();
  const [openTickets, activeVotes, unreadMessages, unreadNews, unreadTickets] =
    await Promise.all([
      prisma.ticket.count({
        where: { ...tenant, userId, status: { not: "RESOLVED" } },
      }),
      prisma.vote.count({
        where: {
          ...tenant,
          AND: [
            { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
            voteAudienceWhere(audience),
          ],
        },
      }),
      prisma.directMessage.count({
        where: { ...tenant, recipientId: userId, readAt: null },
      }),
      countNewsUnread(userId, communityId),
      countTicketsUnread(userId, communityId, audience.role),
    ]);
  return {
    openTickets,
    activeVotes,
    unreadMessages,
    unreadNews,
    unreadTickets,
  };
}

export async function getPopularNewsId(communityId: string) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const top = await prisma.newsPost.findFirst({
    where: {
      ...communityWhere(communityId),
      createdAt: { gte: weekAgo },
    },
    orderBy: { likes: { _count: "desc" } },
    select: {
      id: true,
      title: true,
      _count: { select: { likes: true } },
    },
  });

  if (!top || top._count.likes < 5) return null;
  return { id: top.id, title: top.title, likeCount: top._count.likes };
}
