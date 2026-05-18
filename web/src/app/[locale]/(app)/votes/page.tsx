import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { VoteCreateForm } from "@/components/VoteCreateForm";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card } from "@/components/Ui";
import { HubContentCard } from "@/components/hub/hubUi";
import { getLocale, getTranslations } from "next-intl/server";
import { dateLocaleForUi } from "@/lib/dateLocale";
import { voteAudienceWhere } from "@/lib/audience";
import { redirect } from "next/navigation";
import { MarkNotificationsSeen } from "@/components/MarkNotificationsSeen";
import { communityWhere, requireCommunityId } from "@/lib/tenant";
import { Vote } from "lucide-react";

export default async function VotesListPage() {
  const session = await auth();
  const communityId = requireCommunityId(session!.user!);
  if (session!.user!.role === "MODERATOR") {
    const locale = await getLocale();
    redirect(`/${locale}/chair`);
  }
  const userId = session!.user!.id;
  const locale = await getLocale();
  const isChair = session!.user!.role === "CHAIR";
  const t = await getTranslations("votes");
  const tChair = await getTranslations("chair");
  const dateLocale = dateLocaleForUi(locale);

  const votes = await prisma.vote.findMany({
    where: {
      ...communityWhere(communityId),
      ...voteAudienceWhere({
        role: session!.user!.role,
        tenancyType: session!.user!.tenancyType,
      }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      responses: { where: { userId } },
      _count: { select: { responses: true } },
    },
  });

  const now = new Date();

  return (
    <>
      <MarkNotificationsSeen scopes={["votes"]} />
      <PageTitle title={t("title")} subtitle={t("subtitle")} />

      {isChair && (
        <Card className="mb-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-blue-600/90 dark:text-blue-400/90">
            {tChair("voteEyebrow")}
          </p>
          <VoteCreateForm />
        </Card>
      )}

      <div className="flex flex-col gap-2.5">
        {votes.map((v) => {
          const active = !v.endsAt || v.endsAt > now;
          const voted = v.responses.length > 0;
          return (
            <HubContentCard key={v.id} href={`/votes/${v.id}`}>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md">
                  <Vote className="h-5 w-5" strokeWidth={2.25} />
                </span>
                <span className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {v.title}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        active
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800"
                      }`}
                    >
                      {active ? t("open") : t("archive")}
                    </span>
                  </div>
                  {v.description && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {v.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    {t("responsesCount", { count: v._count.responses })}
                    {v.endsAt && (
                      <>
                        {" · "}
                        {active ? `${t("until")} ` : ""}
                        {v.endsAt.toLocaleDateString(dateLocale)}
                      </>
                    )}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {active
                      ? voted
                        ? t("change")
                        : t("cast")
                      : t("results")}{" "}
                    →
                  </p>
                </span>
              </div>
            </HubContentCard>
          );
        })}
        {votes.length === 0 && (
          <HubContentCard>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("emptyList")}
            </p>
          </HubContentCard>
        )}
      </div>
    </>
  );
}
