import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card, ButtonLink } from "@/components/Ui";
import { PaymentEditForm } from "@/components/PaymentEditForm";
import { getLocale, getTranslations } from "next-intl/server";
import { formatUah } from "@/lib/money";
import { redirect } from "next/navigation";
import { Role } from "@/lib/enums";
import {
  formatAddressLine,
  householdAddressKey,
  normalizeHouseNumber,
  normalizeStreet,
} from "@/lib/household";

async function getPaymentForAddress(street: string, houseNumber: string) {
  const s = normalizeStreet(street);
  const h = normalizeHouseNumber(houseNumber);
  return prisma.householdPayment.findUnique({
    where: { street_houseNumber: { street: s, houseNumber: h } },
  });
}

async function ResidentPaymentsView({
  userId,
  locale,
}: {
  userId: string;
  locale: string;
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

  const payment = user
    ? await getPaymentForAddress(user.street, user.houseNumber)
    : null;

  const subscription = payment?.subscriptionFeeUah ?? 0;
  const electricity = payment?.electricityUah ?? 0;
  const total = subscription + electricity;

  return (
    <>
      <PageTitle title={t("title")} subtitle={t("subtitle")} />

      <Card className="mb-4 border-emerald-100 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">{t("address")}</p>
        <p className="mt-1 text-sm font-medium">
          {user
            ? formatAddressLine(user.street, user.houseNumber)
            : "—"}
        </p>
      </Card>

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

        <Card className="border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
            {t("total")}
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-900 dark:text-emerald-100">
            {formatUah(total, locale)}
          </p>
        </Card>
      </div>

      {total === 0 && (
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

      <div className="mt-6">
        <ButtonLink href="/info/tariffs" variant="secondary">
          {tp("tariffsLink")}
        </ButtonLink>
      </div>

      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        {t("disclaimer")}
      </p>
    </>
  );
}

type HouseholdRow = {
  street: string;
  houseNumber: string;
  residents: { name: string; tenancyType: string; status: string }[];
  subscriptionFeeUah: number;
  electricityUah: number;
};

async function ChairPaymentsManageView() {
  const locale = await getLocale();
  const t = await getTranslations("payments");

  const [residents, payments] = await Promise.all([
    prisma.user.findMany({
      where: { role: Role.RESIDENT },
      orderBy: [{ street: "asc" }, { houseNumber: "asc" }, { name: "asc" }],
      select: {
        name: true,
        street: true,
        houseNumber: true,
        tenancyType: true,
        status: true,
      },
    }),
    prisma.householdPayment.findMany(),
  ]);

  const paymentByKey = new Map(
    payments.map((p) => [
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
    const pay = paymentByKey.get(key);

    if (!existing) {
      households.set(key, {
        street,
        houseNumber,
        residents: [
          { name: u.name, tenancyType: u.tenancyType, status: u.status },
        ],
        subscriptionFeeUah: pay?.subscriptionFeeUah ?? 0,
        electricityUah: pay?.electricityUah ?? 0,
      });
    } else {
      existing.residents.push({
        name: u.name,
        tenancyType: u.tenancyType,
        status: u.status,
      });
    }
  }

  for (const p of payments) {
    const key = householdAddressKey(p.street, p.houseNumber);
    if (!households.has(key)) {
      households.set(key, {
        street: normalizeStreet(p.street),
        houseNumber: normalizeHouseNumber(p.houseNumber),
        residents: [],
        subscriptionFeeUah: p.subscriptionFeeUah,
        electricityUah: p.electricityUah,
      });
    }
  }

  const list = [...households.values()].sort((a, b) =>
    formatAddressLine(a.street, a.houseNumber).localeCompare(
      formatAddressLine(b.street, b.houseNumber),
      locale,
    ),
  );

  return (
    <>
      <PageTitle title={t("chairTitle")} subtitle={t("chairSubtitle")} />

      <div className="flex flex-col gap-3">
        {list.map((h) => {
          const total = h.subscriptionFeeUah + h.electricityUah;
          const residentNames = h.residents.map((r) => r.name).join(", ");
          return (
            <Card key={householdAddressKey(h.street, h.houseNumber)}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold">
                    {formatAddressLine(h.street, h.houseNumber)}
                  </p>
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {t("registeredResidents")}: {residentNames}
                  </p>
                </div>
                <p className="text-right text-sm font-semibold tabular-nums">
                  {formatUah(total, locale)}
                </p>
              </div>
              <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <PaymentEditForm
                  street={h.street}
                  houseNumber={h.houseNumber}
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

export default async function PaymentsPage() {
  const session = await auth();
  if (session!.user!.role === "MODERATOR") {
    const locale = await getLocale();
    redirect(`/${locale}/chair`);
  }

  const locale = await getLocale();
  const userId = session!.user!.id;
  const isChair = session!.user!.role === "CHAIR";

  if (isChair) {
    return <ChairPaymentsManageView />;
  }

  return <ResidentPaymentsView userId={userId} locale={locale} />;
}
