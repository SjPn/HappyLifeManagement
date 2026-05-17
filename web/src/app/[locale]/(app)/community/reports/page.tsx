import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card } from "@/components/Ui";
import { ConfidentialNewForm } from "@/components/ConfidentialNewForm";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { MarkNotificationsSeen } from "@/components/MarkNotificationsSeen";

export default async function ReportsPage() {
  const session = await auth();
  if (session!.user!.role === "MODERATOR") {
    const locale = await getLocale();
    redirect(`/${locale}/chair`);
  }
  const userId = session!.user!.id;
  const t = await getTranslations("reports");
  const tKind = await getTranslations("categories.reportKind");
  const tStatus = await getTranslations("categories.reportStatus");

  const items = await prisma.confidentialReport.findMany({
    where: {
      OR: [{ published: true }, { authorId: userId }],
    },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <>
      <MarkNotificationsSeen scopes={["reports"]} />
      <PageTitle title={t("title")} subtitle={t("subtitle")} />

      <Card className="mb-6">
        <h2 className="text-sm font-semibold">{t("newFormHeading")}</h2>
        <div className="mt-4">
          <ConfidentialNewForm />
        </div>
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {t("feedTitle")}
      </h2>
      <div className="flex flex-col gap-3">
        {items.map((r) => {
          const mine = r.authorId === userId;
          const showBody = r.published || mine;
          return (
            <Card key={r.id}>
              <p className="text-xs font-medium uppercase text-blue-800 dark:text-blue-200">
                {tKind(r.kind as "COMPLAINT" | "SUGGESTION" | "VIOLATION" | "IDEA")} · {r.category}
              </p>
              {showBody ? (
                <p className="mt-2 whitespace-pre-wrap text-sm">{r.body}</p>
              ) : (
                <p className="mt-2 text-sm text-zinc-500">
                  {t("hiddenFromFeed")}
                </p>
              )}
              <p className="mt-3 text-xs text-zinc-500">
                {tStatus(
                  r.status as "NEW" | "REVIEWING" | "CLOSED"
                )}
                {mine && ` · ${t("youAuthor")}`}
                {!r.published && mine && ` · ${t("notInFeed")}`}
              </p>
            </Card>
          );
        })}
        {items.length === 0 && (
          <Card>
            <p className="text-sm text-zinc-600">{t("empty")}</p>
          </Card>
        )}
      </div>

      <p className="mt-6 text-center text-sm">
        <Link href="/community" className="text-blue-700 hover:underline">
          {t("back")}
        </Link>
      </p>
    </>
  );
}
