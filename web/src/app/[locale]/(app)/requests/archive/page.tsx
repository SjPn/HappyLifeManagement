import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/Ui";
import { RequestsPanel } from "@/components/RequestsPanel";
import { ticketListInclude, toTicketRows } from "@/lib/ticketRows";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { communityWhere, requireCommunityId } from "@/lib/tenant";

export default async function RequestsArchivePage() {
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

  const archiveTickets = await prisma.ticket.findMany({
    where: { ...baseWhere, status: "RESOLVED" },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: ticketListInclude,
  });

  return (
    <>
      <PageTitle title={t("archiveTitle")} subtitle={t("archiveSubtitle")} />
      <RequestsPanel
        tickets={toTicketRows(archiveTickets)}
        staff={staff}
        currentUserId={session!.user!.id}
        emptyMessage={t("archiveEmpty")}
        backHref="/requests"
        backLabel={t("backToActive")}
      />
    </>
  );
}
