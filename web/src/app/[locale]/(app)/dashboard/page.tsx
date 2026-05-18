import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card, ButtonLink, DashboardGreeting } from "@/components/Ui";
import { getLocale, getTranslations } from "next-intl/server";
import { formatUah } from "@/lib/money";
import { dateLocaleForUi } from "@/lib/dateLocale";
import { voteAudienceWhere } from "@/lib/audience";
import {
  billingUniqueWhere,
  currentBillingPeriod,
  formatBillingPeriodLabel,
} from "@/lib/billing";
import { communityWhere, requireCommunityIdFromSession } from "@/lib/tenant";
import { MarkNotificationsSeen } from "@/components/MarkNotificationsSeen";
import { NewsSectionHeader } from "@/components/NewsSectionHeader";
import { DashboardSectionLink } from "@/components/DashboardSectionLink";
import { PaymentsReminderCard } from "@/components/PaymentsReminderCard";
import { ChairDashboardActions } from "@/components/ChairDashboardActions";
import { getChairDashboardStats } from "@/lib/chairDashboard";
import { getPopularNewsId } from "@/lib/hubStats";
import { Link } from "@/i18n/navigation";
import { NewsPostCard } from "@/components/NewsPostCard";
import { newsPostCardProps, newsPostListInclude } from "@/lib/newsPosts";

export default async function DashboardPage() {
  const session = await auth();
  const communityId = await requireCommunityIdFromSession(session!.user!);
  const userId = session!.user!.id;
  const isChair = session!.user!.role === "CHAIR";
  const canLikeNews =
    !isChair &&
    session!.user!.status === "APPROVED" &&
    session!.user!.role !== "MODERATOR";
  const locale = await getLocale();
  const t = await getTranslations("dashboard");
  const tLikes = await getTranslations("newsLikes");
  const tn = await getTranslations("nav");
  const dateLocale = dateLocaleForUi(locale);

  if (session!.user!.role === "MODERATOR") {
    return (
      <>
        <PageTitle title={t("greeting", { name: "MODERATOR" })} subtitle={t("addressLine", { street: "", house: "" })} />
        <section className="grid gap-3">
          <Card>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("quickReport")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <ButtonLink href="/chair/moderation">{tn("community")}</ButtonLink>
              <ButtonLink href="/chair/users" variant="secondary">
                {tn("more")}
              </ButtonLink>
            </div>
          </Card>
        </section>
      </>
    );
  }

  const chairStatsPromise = isChair
    ? getChairDashboardStats(communityId)
    : Promise.resolve(null);
  const popularNewsPromise = !isChair
    ? getPopularNewsId(communityId)
    : Promise.resolve(null);

  const [news, votes, user, chairStats, popularNews] = await Promise.all([
    isChair
      ? Promise.resolve([])
      : prisma.newsPost.findMany({
          where: communityWhere(communityId),
          orderBy: { createdAt: "desc" },
          take: 4,
          include: newsPostListInclude(userId),
        }),
    isChair
      ? Promise.resolve([])
      : prisma.vote.findMany({
          where: {
            ...communityWhere(communityId),
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
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        balanceUah: true,
        street: true,
        houseNumber: true,
      },
    }),
    chairStatsPromise,
    popularNewsPromise,
  ]);

  const billingPeriod = currentBillingPeriod();
  const householdBilling =
    !isChair && user?.street && user?.houseNumber
      ? await prisma.householdBilling.findUnique({
          where: billingUniqueWhere(
            communityId,
            user.street,
            user.houseNumber,
            billingPeriod,
          ),
        })
      : null;

  const paymentTotal =
    (householdBilling?.subscriptionFeeUah ?? 0) +
    (householdBilling?.electricityUah ?? 0);
  const paymentPaid = householdBilling?.paidAt != null;
  const paymentPeriodLabel = formatBillingPeriodLabel(locale, billingPeriod);
  const showResidentPaymentsCard =
    !isChair && Boolean(user?.street && user?.houseNumber);

  const displayName = user?.name?.trim() || t("neighbor");
  const sectionLinkClass =
    "mb-3 mt-8 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 transition hover:text-blue-700 dark:hover:text-blue-300";

  return (
    <>
      {!isChair && <MarkNotificationsSeen scopes={["news"]} />}
      <PageTitle
        eyebrow={isChair ? t("eyebrow") : undefined}
        title={
          <DashboardGreeting hello={t("greetingHello")} name={displayName} />
        }
        subtitle={
          isChair
            ? t("chairHub.subtitle")
            : t("addressLine", {
                street: user?.street ?? "",
                house: user?.houseNumber ?? "",
              })
        }
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

      {isChair && chairStats && (
        <ChairDashboardActions
          stats={chairStats}
          paymentsLabel={t("chairPaymentsButton")}
        />
      )}

      {!isChair && showResidentPaymentsCard && (
        <PaymentsReminderCard>
          <p className="text-sm font-medium">{t("paymentsReminderTitle")}</p>
          <p className="mt-0.5 text-xs text-zinc-500 capitalize">
            {paymentPeriodLabel}
          </p>
          {paymentPaid ? (
            <p className="mt-1 text-sm font-medium text-blue-700 dark:text-blue-300">
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
          <p className="mt-3 text-sm font-semibold text-blue-700 dark:text-blue-300">
            {t("paymentsLink")}
          </p>
        </PaymentsReminderCard>
      )}

      {!isChair && popularNews && (
        <Link
          href="/community/news"
          className="mb-5 block rounded-2xl border border-rose-200/80 bg-gradient-to-r from-rose-50/90 to-amber-50/80 px-4 py-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-rose-900/50 dark:from-rose-950/40 dark:to-amber-950/30"
        >
          <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">
            🔥 {t("popularNewsTitle")}
          </p>
          <p className="mt-1 text-sm text-rose-800/90 dark:text-rose-200/90">
            {t("popularNewsText", {
              title: popularNews.title,
              count: popularNews.likeCount,
            })}
          </p>
        </Link>
      )}

      {!isChair && (
        <>
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
              <NewsPostCard
                key={n.id}
                {...newsPostCardProps(
                  n,
                  n.createdAt.toLocaleDateString(dateLocale, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }),
                  canLikeNews,
                  tLikes("popular"),
                )}
              />
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
        </>
      )}
    </>
  );
}
