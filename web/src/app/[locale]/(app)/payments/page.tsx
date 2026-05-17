import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card } from "@/components/Ui";
import { PaymentEditForm } from "@/components/PaymentEditForm";
import { getLocale, getTranslations } from "next-intl/server";
import { formatUah } from "@/lib/money";
import { redirect } from "next/navigation";
import { Role } from "@/lib/enums";

async function ResidentPaymentsView({
  userId,
  locale,
}: {
  userId: string;
  locale: string;
}) {
  const t = await getTranslations("payments");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionFeeUah: true,
      electricityUah: true,
      balanceUah: true,
      street: true,
      houseNumber: true,
    },
  });

  const subscription = user?.subscriptionFeeUah ?? 0;
  const electricity = user?.electricityUah ?? 0;
  const total = subscription + electricity;

  return (
    <>
      <PageTitle title={t("title")} subtitle={t("subtitle")} />

      <Card className="mb-4 border-emerald-100 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">{t("address")}</p>
        <p className="mt-1 text-sm font-medium">
          {user?.street} {user?.houseNumber}
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

      <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
        {t("disclaimer")}
      </p>
    </>
  );
}

async function ChairPaymentsManageView() {
  const locale = await getLocale();
  const t = await getTranslations("payments");
  const tc = await getTranslations("chair");
  const tt = await getTranslations("categories.tenancy");

  const residents = await prisma.user.findMany({
    where: { role: Role.RESIDENT },
    orderBy: [{ street: "asc" }, { houseNumber: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      street: true,
      houseNumber: true,
      tenancyType: true,
      status: true,
      subscriptionFeeUah: true,
      electricityUah: true,
    },
  });

  return (
    <>
      <PageTitle title={t("chairTitle")} subtitle={t("chairSubtitle")} />

      <div className="flex flex-col gap-3">
        {residents.map((u) => {
          const total = u.subscriptionFeeUah + u.electricityUah;
          return (
            <Card key={u.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {u.street} {u.houseNumber}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {tt(u.tenancyType as "OWNER" | "TENANT")}
                    {u.status !== "APPROVED" && (
                      <span className="ml-2 text-amber-700 dark:text-amber-300">
                        · {tc("addressStatus")}: {u.status}
                      </span>
                    )}
                  </p>
                </div>
                <p className="text-right text-sm font-semibold tabular-nums">
                  {formatUah(total, locale)}
                </p>
              </div>
              <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <PaymentEditForm
                  userId={u.id}
                  subscriptionFeeUah={u.subscriptionFeeUah}
                  electricityUah={u.electricityUah}
                />
              </div>
            </Card>
          );
        })}
        {residents.length === 0 && (
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
