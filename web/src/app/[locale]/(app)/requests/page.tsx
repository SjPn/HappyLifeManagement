import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card, ButtonLink } from "@/components/Ui";
import { TicketStatusForm } from "@/components/TicketStatusForm";
import { getLocale, getTranslations } from "next-intl/server";
import { dateLocaleForUi } from "@/lib/dateLocale";

export default async function RequestsPage() {
  const session = await auth();
  const role = session!.user!.role;
  const staff = role === "CHAIR" || role === "MODERATOR";
  const locale = await getLocale();
  const t = await getTranslations("requests");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("categories.ticket");
  const tst = await getTranslations("categories.ticketStatus");
  const dateLocale = dateLocaleForUi(locale);

  const tickets = await prisma.ticket.findMany({
    where: staff ? {} : { userId: session!.user!.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true, street: true, houseNumber: true } },
    },
  });

  return (
    <>
      <PageTitle title={t("title")} subtitle={t("subtitle")} />
      <div className="mb-4 flex gap-2">
        <ButtonLink href="/requests/new">{t("new")}</ButtonLink>
      </div>
      <div className="flex flex-col gap-3">
        {tickets.length === 0 && (
          <Card>
            <p className="text-sm text-zinc-600">{t("empty")}</p>
          </Card>
        )}
        {tickets.map((tk) => (
          <Card key={tk.id}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase text-emerald-700">
                  {tc(tk.category)}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{tk.description}</p>
                {tk.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tk.photoUrl}
                    alt=""
                    className="mt-3 max-h-64 w-full rounded-xl object-cover ring-1 ring-black/5"
                  />
                )}
                {tk.locationNote && (
                  <p className="mt-2 text-xs text-zinc-500">
                    {t("locationHint")}: {tk.locationNote}
                  </p>
                )}
                <p className="mt-3 text-xs text-zinc-500">
                  {staff ? (
                    <>
                      {tk.user.name}, {tk.user.street} {tk.user.houseNumber} ·{" "}
                    </>
                  ) : null}
                  {tk.createdAt.toLocaleString(dateLocale)}
                </p>
              </div>
              <div className="text-right text-sm">
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium dark:bg-zinc-800">
                  {tst(tk.status as "NEW" | "IN_PROGRESS" | "RESOLVED")}
                </span>
              </div>
            </div>
            {staff && (
              <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <p className="mb-2 text-xs text-zinc-500">{t("status")}</p>
                <TicketStatusForm ticketId={tk.id} current={tk.status} />
              </div>
            )}
          </Card>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/dashboard" className="text-emerald-700 hover:underline">
          ← {tn("home")}
        </Link>
      </p>
    </>
  );
}
