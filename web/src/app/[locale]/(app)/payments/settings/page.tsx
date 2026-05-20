import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card, ButtonLink } from "@/components/Ui";
import { PaymentPeriodNav } from "@/components/PaymentPeriodNav";
import { ElectricityTariffForm } from "@/components/ElectricityTariffForm";
import { ChairPaymentRequisitesForm } from "@/components/ChairPaymentRequisitesForm";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { formatBillingPeriodLabel, parseBillingPeriod } from "@/lib/billing";
import { requireCommunityId } from "@/lib/tenant";

export default async function PaymentsSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const session = await auth();
  const locale = await getLocale();

  if (session?.user?.role !== "CHAIR") {
    redirect(`/${locale}/payments`);
  }

  const communityId = requireCommunityId(session.user);
  const sp = await searchParams;
  const period = parseBillingPeriod(sp.y, sp.m);
  const t = await getTranslations("payments");
  const periodLabel = formatBillingPeriodLabel(locale, period);
  const periodQuery = `?y=${period.year}&m=${period.month}`;

  const [community, tariff] = await Promise.all([
    prisma.community.findUnique({
      where: { id: communityId },
      select: { paymentRequisites: true },
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
  ]);

  const paymentRequisites = community?.paymentRequisites ?? null;
  const dayRateUah = tariff?.dayRateUah ?? 0;
  const nightRateUah = tariff?.nightRateUah ?? 0;

  return (
    <>
      <PageTitle
        title={t("settingsTitle")}
        subtitle={t("settingsSubtitle", { period: periodLabel })}
      />

      <div className="mb-6">
        <ButtonLink href={`/payments${periodQuery}`} variant="secondary">
          {t("backToPayments")}
        </ButtonLink>
      </div>

      <PaymentPeriodNav period={period} />

      <Card className="mb-4">
        <ElectricityTariffForm
          periodYear={period.year}
          periodMonth={period.month}
          dayRateUah={dayRateUah}
          nightRateUah={nightRateUah}
        />
      </Card>

      <Card>
        <ChairPaymentRequisitesForm initialRequisites={paymentRequisites} />
      </Card>
    </>
  );
}
