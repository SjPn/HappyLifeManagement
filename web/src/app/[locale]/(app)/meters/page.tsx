import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card } from "@/components/Ui";
import { MeterForm } from "@/components/MeterForm";
import { getLocale, getTranslations } from "next-intl/server";
import { formatUah } from "@/lib/money";
import { dateLocaleForUi } from "@/lib/dateLocale";
import { redirect } from "next/navigation";

export default async function MetersPage() {
  const session = await auth();
  if (session!.user!.role === "MODERATOR") {
    const locale = await getLocale();
    redirect(`/${locale}/chair`);
  }
  const userId = session!.user!.id;
  const locale = await getLocale();
  const t = await getTranslations("meters");
  const dateLocale = dateLocaleForUi(locale);

  const readings = await prisma.meterReading.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balanceUah: true },
  });

  return (
    <>
      <PageTitle title={t("title")} subtitle={t("subtitle")} />

      <Card className="mb-4 border-emerald-100 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30">
        <p className="text-sm">
          {t("balance")}{" "}
          <strong>{formatUah(user?.balanceUah ?? 0, locale)}</strong>
        </p>
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
          {t("balanceNote")}
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="text-sm font-semibold">{t("submitReading")}</h2>
        <div className="mt-4">
          <MeterForm />
        </div>
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {t("history")}
      </h2>
      <div className="flex flex-col gap-2">
        {readings.map((r) => (
          <Card key={r.id}>
            <div className="flex justify-between text-sm">
              <span className="font-medium">{r.value}</span>
              <span className="text-xs text-zinc-500">
                {r.createdAt.toLocaleDateString(dateLocale)}
              </span>
            </div>
            {r.note && (
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                {r.note}
              </p>
            )}
          </Card>
        ))}
        {readings.length === 0 && (
          <Card>
            <p className="text-sm text-zinc-600">{t("emptyHistory")}</p>
          </Card>
        )}
      </div>
    </>
  );
}
