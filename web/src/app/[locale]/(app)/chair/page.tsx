import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PageTitle } from "@/components/Ui";
import { getLocale, getTranslations } from "next-intl/server";

export default async function ChairHomePage() {
  const session = await auth();
  const locale = await getLocale();
  if (session!.user!.role !== "CHAIR" && session!.user!.role !== "MODERATOR") {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations("chair");
  const isChair = session!.user!.role === "CHAIR";

  return (
    <>
      <PageTitle
        title={t("title")}
        subtitle={isChair ? t("subtitleChair") : t("subtitleModerator")}
      />

      <div className="mb-8 flex flex-col gap-2">
        {isChair && (
          <Link
            href="/chair/addresses"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            {t("addresses")}
          </Link>
        )}
        <Link
          href="/chair/users"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          {t("users")}
        </Link>
        <Link
          href="/residents"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          {t("residentsDirectory")}
        </Link>
        <Link
          href="/chair/reports"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          {t("reports")}
        </Link>
        <Link
          href="/chair/moderation"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          {t("moderation")}
        </Link>
      </div>

      <p className="text-center text-sm">
        <Link href="/profile" className="text-emerald-700 hover:underline">
          {t("backProfile")}
        </Link>
      </p>
    </>
  );
}
