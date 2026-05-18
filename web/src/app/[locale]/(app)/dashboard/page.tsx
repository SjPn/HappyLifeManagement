import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card, DashboardGreeting } from "@/components/Ui";
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
import { PaymentsReminderCard } from "@/components/PaymentsReminderCard";
import { ChairDashboardActions } from "@/components/ChairDashboardActions";
import { ResidentDashboardHub } from "@/components/ResidentDashboardHub";
import { getChairDashboardStats } from "@/lib/chairDashboard";
import { getResidentDashboardStats } from "@/lib/hubStats";
import { NewsPostCard } from "@/components/NewsPostCard";
import { newsPostCardProps, newsPostListInclude } from "@/lib/newsPosts";
import { HubActionCard, HubContentCard, HubSection } from "@/components/hub/hubUi";
import { Shield, Vote } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const communityId = await requireCommunityIdFromSession(session!.user!);
  const userId = session!.user!.id;
  const isChair = session!.user!.role === "CHAIR";
  const isModerator = session!.user!.role === "MODERATOR";
  const canLikeNews =
    !isChair &&
    session!.user!.status === "APPROVED" &&
    !isModerator;
  const locale = await getLocale();
  const t = await getTranslations("dashboard");
  const tLikes = await getTranslations("newsLikes");
  const tMod = await getTranslations("dashboard.residentHub");
  const tn = await getTranslations("nav");
  const dateLocale = dateLocaleForUi(locale);

  if (isModerator) {
    return (
      <>
        <PageTitle
          title={t("greeting", { name: "MODERATOR" })}
          subtitle={t("addressLine", { street: "", house: "" })}
        />
        <HubSection title={tMod("sectionQuick")} className="mt-4">
          <HubActionCard
            href="/chair/moderation"
            icon={Shield}
            title={tn("community")}
            description={t("quickReport")}
            tone="rose"
          />
        </HubSection>
      </>
    );
  }

  const chairStatsPromise = isChair
    ? getChairDashboardStats(communityId)
    : Promise.resolve(null);
  const residentStatsPromise = !isChair
    ? getResidentDashboardStats(communityId, userId, {
        role: session!.user!.role,
        tenancyType: session!.user!.tenancyType,
      })
    : Promise.resolve(null);

  const [news, votes, user, chairStats, residentStats] = await Promise.all([
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
    residentStatsPromise,
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
  const showPaymentsPulse =
    showResidentPaymentsCard && !paymentPaid && paymentTotal > 0;

  const displayName = user?.name?.trim() || t("neighbor");

  return (
    <>
      {!isChair && <MarkNotificationsSeen scopes={["news"]} />}
      <PageTitle
        eyebrow={t("eyebrow")}
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

      {isChair && chairStats && (
        <ChairDashboardActions
          stats={chairStats}
          paymentsLabel={t("chairPaymentsButton")}
        />
      )}

      {!isChair && residentStats && (
        <ResidentDashboardHub
          stats={residentStats}
          showPaymentsPulse={showPaymentsPulse}
          balanceUah={user?.balanceUah ?? 0}
        />
      )}

      {!isChair && (showResidentPaymentsCard || (user?.balanceUah ?? 0) > 0) && (
        <PaymentsReminderCard
          title={t("paymentsReminderTitle")}
          periodLabel={paymentPeriodLabel}
          description={[
            showResidentPaymentsCard
              ? paymentPaid
                ? t("paymentsPaidOnHome")
                : paymentTotal > 0
                  ? t("paymentsReminderText", {
                      amount: formatUah(paymentTotal, locale),
                    })
                  : t("paymentsReminderZero")
              : null,
            (user?.balanceUah ?? 0) > 0
              ? t("duesText", {
                  amount: formatUah(user!.balanceUah, locale),
                })
              : null,
          ]
            .filter(Boolean)
            .join(" ")}
        />
      )}

      {!isChair && (
        <>
          <HubSection title={t("newsSection")} className="!mt-8">
            <div className="flex flex-col gap-2.5">
              {news.length === 0 && (
                <Card>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {t("noNews")}
                  </p>
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
          </HubSection>

          <HubSection title={t("votesSection")}>
            <div className="flex flex-col gap-2.5">
              {votes.length === 0 && (
                <Card>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {t("noVotes")}
                  </p>
                </Card>
              )}
              {votes.map((v) => {
                const voted = v.responses.length > 0;
                return (
                  <HubContentCard key={v.id} href={`/votes/${v.id}`}>
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md">
                        <Vote className="h-5 w-5" strokeWidth={2.25} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {v.title}
                        </p>
                        {v.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                            {v.description}
                          </p>
                        )}
                        <p className="mt-2 text-xs font-medium text-blue-700 dark:text-blue-300">
                          {voted ? t("voteChange") : t("voteAction")}
                          {v.endsAt
                            ? ` · ${t("voteUntil", {
                                date: v.endsAt.toLocaleDateString(dateLocale, {
                                  day: "numeric",
                                  month: "long",
                                }),
                              })}`
                            : ""}
                        </p>
                      </span>
                    </div>
                  </HubContentCard>
                );
              })}
            </div>
          </HubSection>
        </>
      )}
    </>
  );
}
