import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PageTitle, Card } from "@/components/Ui";
import { AddressAddForm } from "@/components/AddressAddForm";
import { DeleteAddressButton } from "@/components/DeleteAddressButton";
import { formatAddressLine } from "@/lib/household";
import { getLocale, getTranslations } from "next-intl/server";

export default async function ChairAddressesPage() {
  const session = await auth();
  const locale = await getLocale();
  if (session!.user!.role !== "CHAIR") {
    redirect(`/${locale}/chair`);
  }

  const t = await getTranslations("addresses");

  const addresses = await prisma.communityAddress.findMany({
    orderBy: [{ street: "asc" }, { houseNumber: "asc" }],
    include: {
      _count: { select: { users: true } },
    },
  });

  return (
    <>
      <PageTitle title={t("title")} subtitle={t("subtitle")} />

      <Card className="mb-8">
        <h2 className="mb-3 text-sm font-semibold">{t("addHeading")}</h2>
        <AddressAddForm />
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {t("listHeading")} ({addresses.length})
      </h2>
      <div className="flex flex-col gap-2">
        {addresses.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {formatAddressLine(a.street, a.houseNumber)}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {t("residentsCount", { count: a._count.users })}
                </p>
              </div>
              <DeleteAddressButton addressId={a.id} />
            </div>
          </Card>
        ))}
        {addresses.length === 0 && (
          <Card>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("empty")}
            </p>
          </Card>
        )}
      </div>

      <p className="mt-8 text-center text-sm">
        <Link href="/chair" className="text-emerald-700 hover:underline">
          {t("backPanel")}
        </Link>
      </p>
    </>
  );
}
