import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PageTitle, Card } from "@/components/Ui";
import { UserApproveSelect } from "@/components/UserApproveSelect";
import { BalanceEditForm } from "@/components/BalanceEditForm";
import { UserEditForm } from "@/components/UserEditForm";
import { getLocale, getTranslations } from "next-intl/server";

export default async function ChairUsersPage() {
  const session = await auth();
  const locale = await getLocale();
  if (session!.user!.role !== "CHAIR" && session!.user!.role !== "MODERATOR") {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations("chair");
  const tp = await getTranslations("profile");
  const tr = await getTranslations("categories.roles");
  const tt = await getTranslations("categories.tenancy");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const isChair = session!.user!.role === "CHAIR";

  return (
    <>
      <PageTitle title={t("usersTitle")} subtitle={t("usersSubtitle")} />
      <div className="flex flex-col gap-3">
        {users.map((u) => (
          <Card key={u.id}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {u.email}
                </p>
                <p className="mt-2 text-sm">
                  {u.street} {u.houseNumber}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {tp("role")}{" "}
                  {tr(u.role as "RESIDENT" | "MODERATOR" | "CHAIR")}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {t("tenancyColTitle")}:{" "}
                  {tt(u.tenancyType as "OWNER" | "TENANT")}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-xs text-zinc-500">{t("addressStatus")}</p>
                <div className="mt-1">
                  <UserApproveSelect userId={u.id} current={u.status} />
                </div>
              </div>
            </div>
            {isChair && (
              <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <BalanceEditForm userId={u.id} balanceUah={u.balanceUah} />
              </div>
            )}
            {(session!.user!.role === "CHAIR" ||
              session!.user!.role === "MODERATOR") && (
              <UserEditForm
                userId={u.id}
                name={u.name}
                street={u.street}
                houseNumber={u.houseNumber}
                phone={u.phone ?? null}
                tenancyType={u.tenancyType}
              />
            )}
          </Card>
        ))}
      </div>
      <p className="mt-8 text-center text-sm">
        <Link href="/chair" className="text-emerald-700 hover:underline">
          {t("backPanel")}
        </Link>
      </p>
    </>
  );
}
