import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/Ui";
import { RequestsPanel, type TicketRow } from "@/components/RequestsPanel";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

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

export default async function RequestsArchivePage() {
  const session = await auth();
  if (session!.user!.role === "MODERATOR") {
    const locale = await getLocale();
    redirect(`/${locale}/chair`);
  }
  const role = session!.user!.role;
  const staff = role === "CHAIR" || role === "MODERATOR";
  const t = await getTranslations("requests");

  const baseWhere = staff ? {} : { userId: session!.user!.id };

  const archiveTickets = await prisma.ticket.findMany({
    where: { ...baseWhere, status: "RESOLVED" },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, street: true, houseNumber: true } },
    },
  });

  return (
    <>
      <PageTitle title={t("archiveTitle")} subtitle={t("archiveSubtitle")} />
      <RequestsPanel
        tickets={toTicketRows(archiveTickets)}
        staff={staff}
        emptyMessage={t("archiveEmpty")}
        backHref="/requests"
        backLabel={t("backToActive")}
      />
    </>
  );
}
