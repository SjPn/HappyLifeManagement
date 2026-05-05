import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card } from "@/components/Ui";
import { getLocale, getTranslations } from "next-intl/server";
import { dateLocaleForUi } from "@/lib/dateLocale";
import { voteAudienceWhere } from "@/lib/audience";

export default async function VotesListPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const locale = await getLocale();
  const t = await getTranslations("votes");
  const dateLocale = dateLocaleForUi(locale);

  const votes = await prisma.vote.findMany({
    where: voteAudienceWhere({
      role: session!.user!.role,
      tenancyType: session!.user!.tenancyType,
    }),
    orderBy: { createdAt: "desc" },
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      responses: { where: { userId } },
    },
  });

  const now = new Date();

  return (
    <>
      <PageTitle title={t("title")} subtitle={t("subtitle")} />
      <div className="flex flex-col gap-3">
        {votes.map((v) => {
          const active = !v.endsAt || v.endsAt > now;
          const voted = v.responses.length > 0;
          return (
            <Card key={v.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{v.title}</p>
                  {v.description && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {v.description}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                    active
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800"
                  }`}
                >
                  {active ? t("open") : t("archive")}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link
                  href={`/votes/${v.id}`}
                  className="inline-flex h-10 items-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {active
                    ? voted
                      ? t("change")
                      : t("cast")
                    : t("results")}
                </Link>
                {v.endsAt && (
                  <span className="text-xs text-zinc-500">
                    {active ? `${t("until")} ` : ""}
                    {v.endsAt.toLocaleDateString(dateLocale)}
                  </span>
                )}
              </div>
            </Card>
          );
        })}
        {votes.length === 0 && (
          <Card>
            <p className="text-sm text-zinc-600">{t("emptyList")}</p>
          </Card>
        )}
      </div>
    </>
  );
}
