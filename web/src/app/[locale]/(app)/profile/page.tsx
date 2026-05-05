import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card } from "@/components/Ui";
import { SignOutButton } from "@/components/AppShell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { getTranslations } from "next-intl/server";

export default async function ProfilePage() {
  const session = await auth();
  const t = await getTranslations("profile");
  const tr = await getTranslations("categories.roles");
  const tt = await getTranslations("categories.tenancy");

  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
  });

  const staff =
    user?.role === "CHAIR" ||
    user?.role === "MODERATOR";

  return (
    <>
      <PageTitle title={t("title")} subtitle={t("subtitle")} />

      <Card className="mb-6">
        <p className="text-sm font-medium">{user?.name}</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {user?.email}
        </p>
        <p className="mt-3 text-sm">
          {user?.street} {user?.houseNumber}
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          {t("role")}{" "}
          {user?.role ? tr(user.role as "RESIDENT" | "MODERATOR" | "CHAIR") : "—"}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {t("tenancyTitle")}:{" "}
          {user?.tenancyType
            ? tt(user.tenancyType as "OWNER" | "TENANT")
            : "—"}
        </p>
      </Card>

      {user && (
        <Card className="mb-6">
          <p className="mb-3 text-sm font-semibold">{t("editProfile")}</p>
          <ProfileEditForm
            name={user.name}
            street={user.street}
            houseNumber={user.houseNumber}
            phone={user.phone ?? null}
            tenancyType={user.tenancyType ?? "OWNER"}
          />
        </Card>
      )}

      <div className="mb-6 flex justify-center">
        <LanguageSwitcher />
      </div>

      <nav className="flex flex-col gap-2">
        <Link
          href="/votes"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          {t("votesLink")}
        </Link>
        <Link
          href="/meters"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          {t("metersLink")}
        </Link>
        {staff && (
          <Link
            href="/chair"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100 dark:hover:bg-emerald-900/40"
          >
            {t("chairPanel")}
          </Link>
        )}
      </nav>

      <div className="mt-10">
        <SignOutButton />
      </div>
    </>
  );
}
