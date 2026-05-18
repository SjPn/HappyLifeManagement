import { prisma } from "@/lib/prisma";
import { Role, UserStatus } from "@/lib/enums";
import { communityWhere } from "@/lib/tenant";

export type ChairDashboardStats = {
  pendingResidents: number;
  activeVotes: number;
  openTickets: number;
  newsLikesWeek: number;
  newsPostsTotal: number;
};

export async function getChairDashboardStats(
  communityId: string,
): Promise<ChairDashboardStats> {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const tenant = communityWhere(communityId);

  const [pendingResidents, activeVotes, openTickets, newsLikesWeek, newsPostsTotal] =
    await Promise.all([
      prisma.user.count({
        where: {
          ...tenant,
          role: Role.RESIDENT,
          status: UserStatus.PENDING,
        },
      }),
      prisma.vote.count({
        where: {
          ...tenant,
          OR: [{ endsAt: null }, { endsAt: { gt: now } }],
        },
      }),
      prisma.ticket.count({
        where: {
          ...tenant,
          status: { in: ["NEW", "IN_PROGRESS"] },
        },
      }),
      prisma.newsPostLike.count({
        where: {
          createdAt: { gte: weekAgo },
          newsPost: tenant,
        },
      }),
      prisma.newsPost.count({ where: tenant }),
    ]);

  return {
    pendingResidents,
    activeVotes,
    openTickets,
    newsLikesWeek,
    newsPostsTotal,
  };
}
