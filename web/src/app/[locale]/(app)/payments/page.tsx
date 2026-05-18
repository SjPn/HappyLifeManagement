import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card, ButtonLink } from "@/components/Ui";
import { PaymentEditForm } from "@/components/PaymentEditForm";
import { PaymentPaidToggle } from "@/components/PaymentPaidToggle";
import { PaymentPeriodNav } from "@/components/PaymentPeriodNav";
import { getLocale, getTranslations } from "next-intl/server";
import { formatUah } from "@/lib/money";
import { dateLocaleForUi } from "@/lib/dateLocale";
import { redirect } from "next/navigation";
import { Role } from "@/lib/enums";
import {
  billingPeriodKey,
  billingPeriodWhere,
  billingUniqueWhere,
  formatBillingPeriodLabel,
  parseBillingPeriod,
  type BillingPeriod,
} from "@/lib/billing";
import { communityWhere, requireCommunityId } from "@/lib/tenant";
import { MarkNotificationsSeen } from "@/components/MarkNotificationsSeen";
import { PaymentsHubStatsBar } from "@/components/PaymentsHubStats";
import { getPaymentsHubStats } from "@/lib/hubStats";
import {
  formatAddressLine,
  householdAddressKey,
  normalizeHouseNumber,
  normalizeStreet,
} from "@/lib/household";

async function getBillingForAddress(
  communityId: string,
  street: string,
  houseNumber: string,
  period: BillingPeriod,
) {
  return prisma.householdBilling.findUnique({
    where: billingUniqueWhere(communityId, street, houseNumber, period),
  });
}

async function ResidentPaymentsView({
  communityId,
  userId,
  locale,
  period,
}: {
  communityId: string;
  userId: string;
  locale: string;
  period: BillingPeriod;
}) {
  const t = await getTranslations("payments");
  const tp = await getTranslations("profile");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      balanceUah: true,
      street: true,
      houseNumber: true,
    },
  });

  const street = user ? normalizeStreet(user.street) : "";
  const houseNumber = user ? normalizeHouseNumber(user.houseNumber) : "";

  const [billing, history] = user
    ? await Promise.all([
        getBillingForAddress(communityId, user.street, user.houseNumber, period),
        prisma.householdBilling.findMany({
          where: { ...communityWhere(communityId), street, houseNumber },
          orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
          take: 24,
        }),
      ])
    : [null, []];

  const historyRows = history.filter(
    (h) => billingPeriodKey({ year: h.periodYear, month: h.periodMonth }) !== billingPeriodKey(period),
  );

  const subscription = billing?.subscriptionFeeUah ?? 0;
  const electricity = billing?.electricityUah ?? 0;
  const total = subscription + electricity;
  const isPaid = billing?.paidAt != null;
  const periodLabel = formatBillingPeriodLabel(locale, period);

  return (
    <>
      <MarkNotificationsSeen scopes={["payments"]} />
      <PageTitle title={t("title")} subtitle={t("subtitle")} />

      <PaymentPeriodNav period={period} />

      <Card className="mb-4 border-blue-100 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">{t("address")}</p>
        <p className="mt-1 text-sm font-medium">
          {user ? formatAddressLine(user.street, user.houseNumber) : "—"}
        </p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-blue-800 dark:text-blue-200">
          {t("periodCharges", { period: periodLabel })}
        </p>
      </Card>

      {isPaid ? (
        <Card className="mb-4 border-blue-300 bg-blue-100/80 dark:border-blue-700 dark:bg-blue-950/50">
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {t("paidBadge")}
          </p>
          <p className="mt-2 text-sm text-blue-800 dark:text-blue-200">
            {t("paidStatus", { period: periodLabel })}
          </p>
          {billing?.paidAt && (
            <p className="mt-1 text-xs text-blue-700/90 dark:text-blue-300/90">
              {t("historyPaid", {
                date: billing.paidAt.toLocaleDateString(dateLocaleForUi(locale), {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
              })}
            </p>
          )}
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("subscription")}
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums">
            {formatUah(subscription, locale)}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("electricity")}
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums">
            {formatUah(electricity, locale)}
          </p>
        </Card>

        <Card className="border-blue-200 bg-blue-50/40 dark:border-blue-900 dark:bg-blue-950/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-800 dark:text-blue-200">
            {t("total")}
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-blue-900 dark:text-blue-100">
            {formatUah(total, locale)}
          </p>
        </Card>
        </div>
      )}

      {total === 0 && !isPaid && (
        <Card className="mt-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("empty")}
          </p>
        </Card>
      )}

      {(user?.balanceUah ?? 0) > 0 && (
        <Card className="mt-4 border-amber-200 bg-amber-50/80 dark:border-amber-900 dark:bg-amber-950/40">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            {t("balanceNote", {
              amount: formatUah(user!.balanceUah, locale),
            })}
          </p>
        </Card>
      )}

      {historyRows.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {t("historyTitle")}
          </h2>
          <div className="flex flex-col gap-2">
            {historyRows.map((row) => {
              const rowTotal =
                row.subscriptionFeeUah + row.electricityUah;
              const rowPeriod = {
                year: row.periodYear,
                month: row.periodMonth,
              };
              return (
                <Card key={row.id} className="text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium capitalize">
                      {formatBillingPeriodLabel(locale, rowPeriod)}
                    </p>
                    <p className="font-semibold tabular-nums">
                      {formatUah(rowTotal, locale)}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {row.paidAt
                      ? t("historyPaid", {
                          date: row.paidAt.toLocaleDateString(dateLocaleForUi(locale), {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }),
                        })
                      : t("historyUnpaid")}
                  </p>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-6">
        <ButtonLink href="/info/tariffs" variant="secondary">
          {tp("tariffsLink")}
        </ButtonLink>
      </div>

    </>
  );
}

type HouseholdRow = {
  street: string;
  houseNumber: string;
  residents: { name: string; tenancyType: string; status: string }[];
  subscriptionFeeUah: number;
  electricityUah: number;
  paidAt: Date | null;
};

async function ChairPaymentsManageView({
  communityId,
  period,
}: {
  communityId: string;
  period: BillingPeriod;
}) {
  const locale = await getLocale();
  const t = await getTranslations("payments");
  const periodLabel = formatBillingPeriodLabel(locale, period);

  const [residents, billings] = await Promise.all([
    prisma.user.findMany({
      where: { ...communityWhere(communityId), role: Role.RESIDENT },
      orderBy: [{ street: "asc" }, { houseNumber: "asc" }, { name: "asc" }],
      select: {
        name: true,
        street: true,
        houseNumber: true,
        tenancyType: true,
        status: true,
      },
    }),
    prisma.householdBilling.findMany({
      where: billingPeriodWhere(communityId, period),
    }),
  ]);

  const billingByKey = new Map(
    billings.map((p) => [
      householdAddressKey(p.street, p.houseNumber),
      p,
    ]),
  );

  const households = new Map<string, HouseholdRow>();

  for (const u of residents) {
    const street = normalizeStreet(u.street);
    const houseNumber = normalizeHouseNumber(u.houseNumber);
    const key = householdAddressKey(street, houseNumber);
    const existing = households.get(key);
    const bill = billingByKey.get(key);

    if (!existing) {
      households.set(key, {
        street,
        houseNumber,
        residents: [
          { name: u.name, tenancyType: u.tenancyType, status: u.status },
        ],
        subscriptionFeeUah: bill?.subscriptionFeeUah ?? 0,
        electricityUah: bill?.electricityUah ?? 0,
        paidAt: bill?.paidAt ?? null,
      });
    } else {
      existing.residents.push({
        name: u.name,
        tenancyType: u.tenancyType,
        status: u.status,
      });
    }
  }

  for (const b of billings) {
    const key = householdAddressKey(b.street, b.houseNumber);
    if (!households.has(key)) {
      households.set(key, {
        street: normalizeStreet(b.street),
        houseNumber: normalizeHouseNumber(b.houseNumber),
        residents: [],
        subscriptionFeeUah: b.subscriptionFeeUah,
        electricityUah: b.electricityUah,
        paidAt: b.paidAt,
      });
    }
  }

  const list = [...households.values()].sort((a, b) =>
    formatAddressLine(a.street, a.houseNumber).localeCompare(
      formatAddressLine(b.street, b.houseNumber),
      locale,
    ),
  );

  const hubStats = await getPaymentsHubStats(communityId, period);

  return (
    <>
      <MarkNotificationsSeen scopes={["payments"]} />
      <PageTitle
        title={t("chairTitle")}
        subtitle={t("chairSubtitle", { period: periodLabel })}
      />

      <PaymentPeriodNav period={period} />

      <PaymentsHubStatsBar stats={hubStats} />

      <div className="flex flex-col gap-3">
        {list.map((h) => {
          const total = h.subscriptionFeeUah + h.electricityUah;
          const residentNames = h.residents.map((r) => r.name).join(", ");
          return (
            <Card
              key={householdAddressKey(h.street, h.houseNumber)}
              className={
                h.paidAt
                  ? "border-blue-200 dark:border-blue-800"
                  : undefined
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold">
                    {formatAddressLine(h.street, h.houseNumber)}
                  </p>
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {t("registeredResidents")}: {residentNames || "—"}
                  </p>
                  {h.paidAt && (
                    <p className="mt-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                      {t("paidBadge")}
                    </p>
                  )}
                </div>
                <p className="text-right text-sm font-semibold tabular-nums">
                  {formatUah(total, locale)}
                </p>
              </div>
              <div className="mt-4 space-y-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <PaymentPaidToggle
                  street={h.street}
                  houseNumber={h.houseNumber}
                  periodYear={period.year}
                  periodMonth={period.month}
                  paid={h.paidAt != null}
                />
                <PaymentEditForm
                  street={h.street}
                  houseNumber={h.houseNumber}
                  periodYear={period.year}
                  periodMonth={period.month}
                  subscriptionFeeUah={h.subscriptionFeeUah}
                  electricityUah={h.electricityUah}
                />
              </div>
            </Card>
          );
        })}
        {list.length === 0 && (
          <Card>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("chairEmpty")}
            </p>
          </Card>
        )}
      </div>
    </>
  );
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const session = await auth();
  if (session!.user!.role === "MODERATOR") {
    const locale = await getLocale();
    redirect(`/${locale}/chair`);
  }

  const communityId = requireCommunityId(session!.user!);
  const sp = await searchParams;
  const period = parseBillingPeriod(sp.y, sp.m);
  const locale = await getLocale();
  const userId = session!.user!.id;
  const isChair = session!.user!.role === "CHAIR";

  if (isChair) {
    return <ChairPaymentsManageView communityId={communityId} period={period} />;
  }

  return (
    <ResidentPaymentsView
      communityId={communityId}
      userId={userId}
      locale={locale}
      period={period}
    />
  );
}
