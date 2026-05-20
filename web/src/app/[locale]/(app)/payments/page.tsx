import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card, ButtonLink } from "@/components/Ui";
import { HubPulseBanner, HubSection } from "@/components/hub/hubUi";
import { ResidentPaymentsHubBar } from "@/components/ResidentPaymentsHubBar";
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
  previousBillingPeriod,
  type BillingPeriod,
} from "@/lib/billing";
import { communityWhere, requireCommunityId } from "@/lib/tenant";
import { MarkNotificationsSeen } from "@/components/MarkNotificationsSeen";
import { PaymentsHubStatsBar } from "@/components/PaymentsHubStats";
import { CopyRequisitesButton } from "@/components/CopyRequisitesButton";
import { ChairPaymentRequisitesForm } from "@/components/ChairPaymentRequisitesForm";
import { CopyBillingFromPrevMonth } from "@/components/CopyBillingFromPrevMonth";
import { ElectricityTariffForm } from "@/components/ElectricityTariffForm";
import { HouseholdPaymentEditor } from "@/components/HouseholdPaymentEditor";
import { computeElectricityCharge } from "@/lib/electricity";
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
  paymentRequisites,
}: {
  communityId: string;
  userId: string;
  locale: string;
  period: BillingPeriod;
  paymentRequisites: string | null;
}) {
  const t = await getTranslations("payments");
  const te = await getTranslations("payments.electricityMeter");
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

  const prevPeriod = previousBillingPeriod(period);

  const [billing, history, meterReading, prevMeter, tariff] = user
    ? await Promise.all([
        getBillingForAddress(communityId, user.street, user.houseNumber, period),
        prisma.householdBilling.findMany({
          where: { ...communityWhere(communityId), street, houseNumber },
          orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
          take: 24,
        }),
        prisma.householdMeterReading.findUnique({
          where: billingUniqueWhere(
            communityId,
            user.street,
            user.houseNumber,
            period,
          ),
        }),
        prisma.householdMeterReading.findUnique({
          where: billingUniqueWhere(
            communityId,
            user.street,
            user.houseNumber,
            prevPeriod,
          ),
        }),
        prisma.communityElectricityTariff.findUnique({
          where: {
            communityId_periodYear_periodMonth: {
              communityId,
              periodYear: period.year,
              periodMonth: period.month,
            },
          },
        }),
      ])
    : [null, [], null, null, null];

  const historyRows = history.filter(
    (h) => billingPeriodKey({ year: h.periodYear, month: h.periodMonth }) !== billingPeriodKey(period),
  );

  const subscription = billing?.subscriptionFeeUah ?? 0;
  const electricity = billing?.electricityUah ?? 0;
  const total = subscription + electricity;

  const meterBreakdown =
    meterReading?.dayReading != null &&
    meterReading?.nightReading != null &&
    tariff &&
    (tariff.dayRateUah > 0 || tariff.nightRateUah > 0)
      ? computeElectricityCharge(
          {
            day: meterReading.dayReading,
            night: meterReading.nightReading,
          },
          prevMeter?.dayReading != null && prevMeter?.nightReading != null
            ? { day: prevMeter.dayReading, night: prevMeter.nightReading }
            : null,
          {
            dayRateUah: tariff.dayRateUah,
            nightRateUah: tariff.nightRateUah,
          },
        )
      : null;
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
        <HubPulseBanner
          title={t("paidBadge")}
          message={
            billing?.paidAt
              ? `${t("paidStatus", { period: periodLabel })} · ${t("historyPaid", {
                  date: billing.paidAt.toLocaleDateString(dateLocaleForUi(locale), {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }),
                })}`
              : t("paidStatus", { period: periodLabel })
          }
        />
      ) : (
        <div className="mb-4">
          <ResidentPaymentsHubBar
            subscriptionLabel={formatUah(subscription, locale)}
            electricityLabel={formatUah(electricity, locale)}
            totalLabel={formatUah(total, locale)}
            highlightTotal={total > 0}
          />
          {meterBreakdown &&
            meterReading?.dayReading != null &&
            meterReading?.nightReading != null && (
            <Card className="mt-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {te("residentBreakdownTitle")}
              </p>
              <ul className="mt-2 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                <li>
                  {te("residentDay", {
                    reading: meterReading.dayReading,
                    kwh: meterBreakdown.deltaDay,
                  })}
                </li>
                <li>
                  {te("residentNight", {
                    reading: meterReading.nightReading,
                    kwh: meterBreakdown.deltaNight,
                  })}
                </li>
              </ul>
            </Card>
          )}
        </div>
      )}

      {!isPaid && total > 0 && paymentRequisites && (
        <Card className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("requisitesLabel")}
          </p>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-zinc-800 dark:text-zinc-200">
            {paymentRequisites}
          </pre>
          <div className="mt-3">
            <CopyRequisitesButton text={paymentRequisites} />
          </div>
        </Card>
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
        <HubSection title={t("historyTitle")} className="!mt-8">
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
        </HubSection>
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
  paymentSentAt: Date | null;
};

async function ChairPaymentsManageView({
  communityId,
  period,
  paymentRequisites,
}: {
  communityId: string;
  period: BillingPeriod;
  paymentRequisites: string | null;
}) {
  const locale = await getLocale();
  const t = await getTranslations("payments");
  const periodLabel = formatBillingPeriodLabel(locale, period);

  const prevPeriod = previousBillingPeriod(period);

  const [residents, billings, tariff, meterReadings, prevMeters] =
    await Promise.all([
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
      prisma.communityElectricityTariff.findUnique({
        where: {
          communityId_periodYear_periodMonth: {
            communityId,
            periodYear: period.year,
            periodMonth: period.month,
          },
        },
      }),
      prisma.householdMeterReading.findMany({
        where: billingPeriodWhere(communityId, period),
      }),
      prisma.householdMeterReading.findMany({
        where: billingPeriodWhere(communityId, prevPeriod),
      }),
    ]);

  const billingByKey = new Map(
    billings.map((p) => [
      householdAddressKey(p.street, p.houseNumber),
      p,
    ]),
  );

  const meterByKey = new Map(
    meterReadings.map((m) => [
      householdAddressKey(m.street, m.houseNumber),
      m,
    ]),
  );

  const prevMeterByKey = new Map(
    prevMeters.map((m) => [
      householdAddressKey(m.street, m.houseNumber),
      m,
    ]),
  );

  const dayRateUah = tariff?.dayRateUah ?? 0;
  const nightRateUah = tariff?.nightRateUah ?? 0;

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
        paymentSentAt: bill?.paymentSentAt ?? null,
      });
    } else {
      existing.residents.push({
        name: u.name,
        tenancyType: u.tenancyType,
        status: u.status,
      });
      if (bill?.paymentSentAt) {
        existing.paymentSentAt = bill.paymentSentAt;
      }
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
        paymentSentAt: b.paymentSentAt,
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

      <CopyBillingFromPrevMonth
        periodYear={period.year}
        periodMonth={period.month}
      />

      <Card className="mb-4">
        <ElectricityTariffForm
          periodYear={period.year}
          periodMonth={period.month}
          dayRateUah={dayRateUah}
          nightRateUah={nightRateUah}
        />
      </Card>

      <Card className="mb-4">
        <ChairPaymentRequisitesForm initialRequisites={paymentRequisites} />
      </Card>

      <PaymentsHubStatsBar stats={hubStats} />

      <div className="flex flex-col gap-3">
        {list.map((h) => {
          const total = h.subscriptionFeeUah + h.electricityUah;
          const residentNames = h.residents.map((r) => r.name).join(", ");
          const addressLabel = formatAddressLine(h.street, h.houseNumber);
          const key = householdAddressKey(h.street, h.houseNumber);
          const meter = meterByKey.get(key);
          const prevMeter = prevMeterByKey.get(key);
          const sentToResident = h.paymentSentAt != null && h.paidAt == null;
          return (
            <Card
              key={householdAddressKey(h.street, h.houseNumber)}
              className={
                h.paidAt
                  ? "border-blue-200 dark:border-blue-800"
                  : sentToResident
                    ? "border-emerald-200 dark:border-emerald-900/60"
                    : undefined
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold">{addressLabel}</p>
                    {sentToResident && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                        {t("sentToResidentBadge")}
                      </span>
                    )}
                  </div>
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
                <HouseholdPaymentEditor
                  street={h.street}
                  houseNumber={h.houseNumber}
                  periodYear={period.year}
                  periodMonth={period.month}
                  subscriptionFeeUah={h.subscriptionFeeUah}
                  electricityUah={h.electricityUah}
                  paid={h.paidAt != null}
                  paymentSent={sentToResident}
                  addressLabel={addressLabel}
                  residentNames={residentNames}
                  dayReading={meter?.dayReading ?? null}
                  nightReading={meter?.nightReading ?? null}
                  prevDayReading={prevMeter?.dayReading ?? null}
                  prevNightReading={prevMeter?.nightReading ?? null}
                  dayRateUah={dayRateUah}
                  nightRateUah={nightRateUah}
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

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { paymentRequisites: true },
  });
  const paymentRequisites = community?.paymentRequisites ?? null;

  if (isChair) {
    return (
      <ChairPaymentsManageView
        communityId={communityId}
        period={period}
        paymentRequisites={paymentRequisites}
      />
    );
  }

  return (
    <ResidentPaymentsView
      communityId={communityId}
      userId={userId}
      locale={locale}
      period={period}
      paymentRequisites={paymentRequisites}
    />
  );
}
