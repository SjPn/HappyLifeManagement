import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/Ui";
import { RequestsHubStatsBar } from "@/components/RequestsHubStats";
import { RequestsNewTicketLink } from "@/components/RequestsNewTicketLink";
import { RequestsPanel } from "@/components/RequestsPanel";
import { getRequestsHubStats } from "@/lib/hubStats";
import { ticketListInclude, toTicketRows } from "@/lib/ticketRows";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { MarkNotificationsSeen } from "@/components/MarkNotificationsSeen";
import { getNotificationSeenAt } from "@/lib/notifications";
import { communityWhere, requireCommunityId } from "@/lib/tenant";

export default async function RequestsPage() {
  const session = await auth();
  if (session!.user!.role === "MODERATOR") {
    const locale = await getLocale();
    redirect(`/${locale}/chair`);
  }
  const role = session!.user!.role;
  const staff = role === "CHAIR" || role === "MODERATOR";
  const t = await getTranslations("requests");
  const userId = session!.user!.id;

  const communityId = requireCommunityId(session!.user!);
  const baseWhere = staff
    ? communityWhere(communityId)
    : { ...communityWhere(communityId), userId };

  const [activeTickets, archiveCount, hubStats, ticketsUnreadSince] =
    await Promise.all([
      prisma.ticket.findMany({
        where: { ...baseWhere, status: { not: "RESOLVED" } },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: ticketListInclude,
      }),
      prisma.ticket.count({
        where: { ...baseWhere, status: "RESOLVED" },
      }),
      getRequestsHubStats(communityId, staff, userId),
      getNotificationSeenAt(userId, "tickets"),
    ]);

  return (
    <>
      <MarkNotificationsSeen scopes={["tickets"]} />
      <PageTitle title={t("title")} subtitle={t("subtitle")} />
      <RequestsHubStatsBar stats={hubStats} />
      <div className="mb-5 mt-2">
        <RequestsNewTicketLink
          title={t("new")}
          description={t("newDesc")}
        />
      </div>
      <RequestsPanel
        tickets={toTicketRows(activeTickets)}
        staff={staff}
        currentUserId={userId}
        ticketsUnreadSince={ticketsUnreadSince.toISOString()}
        emptyMessage={t("activeEmpty")}
        archiveHref="/requests/archive"
        archiveCount={archiveCount}
      />
    </>
  );
}
