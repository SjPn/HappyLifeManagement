import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card } from "@/components/Ui";
import { getTranslations } from "next-intl/server";
import { TenancyType } from "@/lib/audience";

export default async function ResidentsPage() {
  const session = await auth();
  const t = await getTranslations("residents");
  const tt = await getTranslations("categories.tenancy");
  const isStaff =
    session?.user?.role === "MODERATOR" || session?.user?.role === "CHAIR";
  const backHref = "/community";
  const backLabel = (await getTranslations("board"))("back");

  const users = await prisma.user.findMany({
    where: { status: "APPROVED", role: "RESIDENT" },
    orderBy: [{ street: "asc" }, { houseNumber: "asc" }, { name: "asc" }],
    select: { id: true, name: true, street: true, houseNumber: true, tenancyType: true },
  });

  const owners = users.filter((u) => u.tenancyType === TenancyType.OWNER);
  const tenants = users.filter((u) => u.tenancyType === TenancyType.TENANT);

  return (
    <>
      <PageTitle title={t("title")} subtitle={t("subtitle")} />

      <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {t("owners")}
      </h2>
      <div className="flex flex-col gap-2">
        {owners.map((u) => (
          <Card key={u.id}>
            <p className="font-medium">{u.name}</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {u.street} {u.houseNumber} · {tt("OWNER")}
            </p>
          </Card>
        ))}
        {owners.length === 0 && (
          <Card>
            <p className="text-sm text-zinc-600">{t("emptyOwners")}</p>
          </Card>
        )}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {t("tenants")}
      </h2>
      <div className="flex flex-col gap-2">
        {tenants.map((u) => (
          <Card key={u.id}>
            <p className="font-medium">{u.name}</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {u.street} {u.houseNumber} · {tt("TENANT")}
            </p>
          </Card>
        ))}
        {tenants.length === 0 && (
          <Card>
            <p className="text-sm text-zinc-600">{t("emptyTenants")}</p>
          </Card>
        )}
      </div>

      {session?.user?.role === "MODERATOR" && (
        <Card className="mt-8 border-blue-200 bg-blue-50/60 dark:border-blue-900 dark:bg-blue-950/30">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            {t("moderatorHint")}
          </p>
        </Card>
      )}

      <p className="mt-6 text-center text-sm">
        <Link href={backHref} className="text-blue-700 hover:underline">
          {backLabel}
        </Link>
      </p>
    </>
  );
}

