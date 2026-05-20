import { Link } from "@/i18n/navigation";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card } from "@/components/Ui";
import { VoteForm } from "@/components/VoteForm";
import { getTranslations } from "next-intl/server";
import { userMatchesAudience } from "@/lib/audience";
import { getLocale } from "next-intl/server";
import { communityWhere, requireCommunityId } from "@/lib/tenant";

export default async function VoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (session!.user!.role === "MODERATOR") {
    const locale = await getLocale();
    redirect(`/${locale}/chair`);
  }
  const communityId = requireCommunityId(session!.user!);
  const userId = session!.user!.id;
  const t = await getTranslations("votes");

  const vote = await prisma.vote.findFirst({
    where: { id, ...communityWhere(communityId) },
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      responses: {
        include: { option: true, user: { select: { id: true } } },
      },
    },
  });

  if (!vote) notFound();

  if (
    !userMatchesAudience(
      session!.user!.role,
      session!.user!.tenancyType,
      vote.audience,
    )
  ) {
    notFound();
  }

  const now = new Date();
  const active = !vote.endsAt || vote.endsAt > now;
  const myResponse = vote.responses.find((r) => r.userId === userId);

  const counts = new Map<string, number>();
  vote.options.forEach((o) => counts.set(o.id, 0));
  vote.responses.forEach((r) => {
    counts.set(r.optionId, (counts.get(r.optionId) ?? 0) + 1);
  });
  const total = vote.responses.length;

  return (
    <>
      <PageTitle
        title={vote.title}
        subtitle={vote.description ?? undefined}
        backHref="/votes"
        backLabel={t("title")}
      />
      {!active && (
        <Card className="mb-4">
          <p className="text-sm text-zinc-600">{t("closed")}</p>
        </Card>
      )}
      {active && (
        <Card className="mb-6">
          <h2 className="mb-3 text-sm font-semibold">{t("yourChoice")}</h2>
          <VoteForm
            voteId={vote.id}
            options={vote.options}
            disabled={!active}
          />
          {myResponse && (
            <p className="mt-4 text-xs text-zinc-500">
              {t("voteSaved")} <strong>{myResponse.option.text}</strong>
            </p>
          )}
        </Card>
      )}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {t("results")}
        {total > 0 ? ` ${t("votesCount", { n: total })}` : ""}
      </h2>
      <Card>
        <ul className="space-y-3">
          {vote.options.map((o) => {
            const c = counts.get(o.id) ?? 0;
            const pct = total ? Math.round((c / total) * 100) : 0;
            return (
              <li key={o.id}>
                <div className="flex justify-between text-sm">
                  <span>{o.text}</span>
                  <span className="text-zinc-500">
                    {c} ({pct}%)
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <p className="mt-8 text-center">
        <Link
          href="/votes"
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          {t("detailBack")}
        </Link>
      </p>
    </>
  );
}
