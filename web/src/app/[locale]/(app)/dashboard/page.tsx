import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card, ButtonLink, DashboardGreeting } from "@/components/Ui";
import { getLocale, getTranslations } from "next-intl/server";
import { formatUah } from "@/lib/money";
import { dateLocaleForUi } from "@/lib/dateLocale";
import { voteAudienceWhere } from "@/lib/audience";
import {
  billingPeriodWhere,
  currentBillingPeriod,
  formatBillingPeriodLabel,
} from "@/lib/billing";
import { normalizeHouseNumber, normalizeStreet } from "@/lib/household";
import { MarkNotificationsSeen } from "@/components/MarkNotificationsSeen";
import { NewsSectionHeader } from "@/components/NewsSectionHeader";
import { DashboardSectionLink } from "@/components/DashboardSectionLink";
import { PaymentsReminderCard } from "@/components/PaymentsReminderCard";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const locale = await getLocale();
  const t = await getTranslations("dashboard");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("categories.ticketStatus");
  const dateLocale = dateLocaleForUi(locale);

  if (session!.user!.role === "MODERATOR") {
    return (
      <>
        <PageTitle eyebrow={t("eyebrow")} title={t("greeting", { name: "MODERATOR" })} subtitle={t("addressLine", { street: "", house: "" })} />
        <section className="grid gap-3">
          <Card>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("quickReport")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <ButtonLink href="/chair/reports">{tn("community")}</ButtonLink>
              <ButtonLink href="/chair/users" variant="secondary">
                {tn("more")}
              </ButtonLink>
            </div>
          </Card>
        </section>
      </>
    );
  }

  const [news, votes, myTickets, user] = await Promise.all([
    prisma.newsPost.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { author: { select: { name: true } } },
    }),
    prisma.vote.findMany({
      where: {
        AND: [
          { OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] },
          voteAudienceWhere({
            role: session!.user!.role,
            tenancyType: session!.user!.tenancyType,
          }),
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        options: { orderBy: { sortOrder: "asc" } },
        responses: { where: { userId } },
      },
    }),
    prisma.ticket.findMany({
      where: { userId, status: { not: "RESOLVED" } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        balanceUah: true,
        street: true,
        houseNumber: true,
      },
    }),
  ]);

  const billingPeriod = currentBillingPeriod();
  const householdBilling =
    user?.street && user?.houseNumber
      ? await prisma.householdBilling.findUnique({
          where: {
            street_houseNumber_periodYear_periodMonth: {
              street: normalizeStreet(user.street),
              houseNumber: normalizeHouseNumber(user.houseNumber),
              ...billingPeriodWhere(billingPeriod),
            },
          },
        })
      : null;

  const paymentTotal =
    (householdBilling?.subscriptionFeeUah ?? 0) +
    (householdBilling?.electricityUah ?? 0);
  const paymentPaid = householdBilling?.paidAt != null;
  const paymentPeriodLabel = formatBillingPeriodLabel(locale, billingPeriod);
  const showPaymentsCard = Boolean(user?.street && user?.houseNumber);

  const displayName = user?.name?.trim() || t("neighbor");
  const sectionLinkClass =
    "mb-3 mt-8 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 transition hover:text-emerald-700 dark:hover:text-emerald-300";

  return (
    <>
      <MarkNotificationsSeen scopes={["news"]} />
      <PageTitle
        eyebrow={t("eyebrow")}
        title={
          <DashboardGreeting hello={t("greetingHello")} name={displayName} />
        }
        subtitle={t("addressLine", {
          street: user?.street ?? "",
          house: user?.houseNumber ?? "",
        })}
      />

      {(user?.balanceUah ?? 0) > 0 && (
        <Card className="mt-6 border-amber-200 bg-amber-50/80 dark:border-amber-900 dark:bg-amber-950/40">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
            {t("reminderDues")}
          </p>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
            {t("duesText", {
              amount: formatUah(user!.balanceUah, locale),
            })}
          </p>
        </Card>
      )}

      {showPaymentsCard && (
        <PaymentsReminderCard>
          <p className="text-sm font-medium">{t("paymentsReminderTitle")}</p>
          <p className="mt-0.5 text-xs text-zinc-500 capitalize">
            {paymentPeriodLabel}
          </p>
          {paymentPaid ? (
            <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              {t("paymentsPaidOnHome")}
            </p>
          ) : (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {paymentTotal > 0
                ? t("paymentsReminderText", {
                    amount: formatUah(paymentTotal, locale),
                  })
                : t("paymentsReminderZero")}
            </p>
          )}
          <p className="mt-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            {t("paymentsLink")}
          </p>
        </PaymentsReminderCard>
      )}

      <NewsSectionHeader
        title={t("newsSection")}
        className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-500"
      />
      <div className="flex flex-col gap-3">
        {news.length === 0 && (
          <Card>
            <p className="text-sm text-zinc-600">{t("noNews")}</p>
          </Card>
        )}
        {news.map((n) => (
          <Card key={n.id}>
            <p className="font-medium">{n.title}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
              {n.body}
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              {n.author.name} ·{" "}
              {n.createdAt.toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </Card>
        ))}
      </div>

      <DashboardSectionLink
        href="/votes"
        countKey="votes"
        className={sectionLinkClass}
      >
        {t("votesSection")} →
      </DashboardSectionLink>
      <div className="flex flex-col gap-3">
        {votes.length === 0 && (
          <Card>
            <p className="text-sm text-zinc-600">{t("noVotes")}</p>
          </Card>
        )}
        {votes.map((v) => {
          const voted = v.responses.length > 0;
          return (
            <Card key={v.id}>
              <p className="font-medium">{v.title}</p>
              {v.description && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {v.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <ButtonLink href={`/votes/${v.id}`}>
                  {voted ? t("voteChange") : t("voteAction")}
                </ButtonLink>
                {v.endsAt && (
                  <span className="text-xs text-zinc-500">
                    {t("voteUntil", {
                      date: v.endsAt.toLocaleDateString(dateLocale, {
                        day: "numeric",
                        month: "long",
                      }),
                    })}
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <DashboardSectionLink
        href="/requests"
        countKey="tickets"
        className={sectionLinkClass}
      >
        {t("ticketsSection")} →
      </DashboardSectionLink>
      <div className="flex flex-col gap-2">
        {myTickets.length === 0 && (
          <Card>
            <p className="text-sm text-zinc-600">{t("noTickets")}</p>
            <div className="mt-3">
              <ButtonLink href="/requests/new">{t("createTicket")}</ButtonLink>
            </div>
          </Card>
        )}
        {myTickets.map((tk) => (
          <Link key={tk.id} href="/requests">
            <Card className="transition hover:border-emerald-300">
              <p className="text-sm font-medium">
                {tk.description.slice(0, 80)}
                {tk.description.length > 80 ? "…" : ""}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                {tc(tk.status as "NEW" | "IN_PROGRESS" | "RESOLVED")}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
