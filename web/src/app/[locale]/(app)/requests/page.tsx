import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/Ui";
import { HubActionCard } from "@/components/hub/hubUi";
import { RequestsHubStatsBar } from "@/components/RequestsHubStats";
import { RequestsPanel, type TicketRow } from "@/components/RequestsPanel";
import { getRequestsHubStats } from "@/lib/hubStats";
import { Plus } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { MarkNotificationsSeen } from "@/components/MarkNotificationsSeen";
import { communityWhere, requireCommunityId } from "@/lib/tenant";

function toTicketRows(
  tickets: {
    id: string;
    category: string;
    description: string;
    photoUrl: string | null;
    locationNote: string | null;
    status: string;
    createdAt: Date;
    user: { name: string; street: string; houseNumber: string };
  }[],
): TicketRow[] {
  return tickets.map((tk) => ({
    id: tk.id,
    category: tk.category,
    description: tk.description,
    photoUrl: tk.photoUrl,
    locationNote: tk.locationNote,
    status: tk.status,
    createdAt: tk.createdAt.toISOString(),
    userName: tk.user.name,
    userStreet: tk.user.street,
    userHouseNumber: tk.user.houseNumber,
  }));
}

export default async function RequestsPage() {
  const session = await auth();
  if (session!.user!.role === "MODERATOR") {
    const locale = await getLocale();
    redirect(`/${locale}/chair`);
  }
  const role = session!.user!.role;
  const staff = role === "CHAIR" || role === "MODERATOR";
  const t = await getTranslations("requests");

  const communityId = requireCommunityId(session!.user!);
  const baseWhere = staff
    ? communityWhere(communityId)
    : { ...communityWhere(communityId), userId: session!.user!.id };

  const [activeTickets, archiveCount, hubStats] = await Promise.all([
    prisma.ticket.findMany({
      where: { ...baseWhere, status: { not: "RESOLVED" } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { name: true, street: true, houseNumber: true } },
      },
    }),
    prisma.ticket.count({
      where: { ...baseWhere, status: "RESOLVED" },
    }),
    getRequestsHubStats(communityId, staff, session!.user!.id),
  ]);

  return (
    <>
      <MarkNotificationsSeen scopes={["tickets"]} />
      <PageTitle title={t("title")} subtitle={t("subtitle")} />
      <RequestsHubStatsBar stats={hubStats} />
      <div className="mb-5 mt-2">
        <HubActionCard
          href="/requests/new"
          icon={Plus}
          title={t("new")}
          description={t("newDesc")}
          tone="blue"
        />
      </div>
      <RequestsPanel
        tickets={toTicketRows(activeTickets)}
        staff={staff}
        emptyMessage={t("activeEmpty")}
        archiveHref="/requests/archive"
        archiveCount={archiveCount}
      />
    </>
  );
}
