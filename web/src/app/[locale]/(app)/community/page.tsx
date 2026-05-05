import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { PageTitle, Card } from "@/components/Ui";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function CommunityHubPage() {
  const session = await auth();
  if (session!.user!.role === "MODERATOR") {
    const locale = await getLocale();
    redirect(`/${locale}/chair`);
  }
  const t = await getTranslations("community");
  const links = [
    {
      href: "/community/board" as const,
      title: t("boardTitle"),
      desc: t("boardDesc"),
    },
    {
      href: "/community/forum" as const,
      title: t("forumTitle"),
      desc: t("forumDesc"),
    },
    {
      href: "/community/reports" as const,
      title: t("reportsTitle"),
      desc: t("reportsDesc"),
    },
  ];

  return (
    <>
      <PageTitle title={t("title")} subtitle={t("subtitle")} />
      <div className="flex flex-col gap-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="transition hover:border-emerald-300">
              <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                {l.title}
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {l.desc}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
