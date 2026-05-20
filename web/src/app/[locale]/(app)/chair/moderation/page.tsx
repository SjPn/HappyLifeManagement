import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { PageTitle, Card } from "@/components/Ui";
import { DeleteBoardPostButton, DeleteForumTopicButton, DeleteVoteButton } from "@/components/ModerationDeleteButtons";
import { communityWhere, requireCommunityId } from "@/lib/tenant";

export default async function ChairModerationPage() {
  const session = await auth();
  const communityId = requireCommunityId(session!.user!);
  const locale = await getLocale();
  if (session!.user!.role !== "CHAIR" && session!.user!.role !== "MODERATOR") {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations("moderation");
  const tc = await getTranslations("chair");

  const tenant = communityWhere(communityId);
  const [board, topics, votes] = await Promise.all([
    prisma.boardPost.findMany({
      where: tenant,
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { user: { select: { name: true } } },
    }),
    prisma.forumTopic.findMany({
      where: tenant,
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        user: { select: { name: true } },
        posts: { select: { id: true } },
      },
    }),
    prisma.vote.findMany({
      where: tenant,
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { options: { select: { id: true } } },
    }),
  ]);

  return (
    <>
      <PageTitle
        title={t("title")}
        subtitle={t("subtitle")}
        backHref="/chair"
        backLabel={tc("backPanel")}
      />

      <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {t("board")}
      </h2>
      <div className="flex flex-col gap-2">
        {board.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{p.title}</p>
                <p className="mt-1 text-xs text-zinc-500">{t("by", { name: p.user.name })}</p>
              </div>
              <DeleteBoardPostButton id={p.id} />
            </div>
          </Card>
        ))}
        {board.length === 0 && (
          <Card>
            <p className="text-sm text-zinc-600">{t("empty")}</p>
          </Card>
        )}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {t("forum")}
      </h2>
      <div className="flex flex-col gap-2">
        {topics.map((x) => (
          <Card key={x.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{x.title}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {t("by", { name: x.user.name })}
                  {x.isAnonymous ? ` · ${t("anonymousTopic")}` : ""} ·{" "}
                  {t("posts", { count: x.posts.length })}
                </p>
              </div>
              <DeleteForumTopicButton topicId={x.id} />
            </div>
          </Card>
        ))}
        {topics.length === 0 && (
          <Card>
            <p className="text-sm text-zinc-600">{t("empty")}</p>
          </Card>
        )}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {t("votes")}
      </h2>
      <div className="flex flex-col gap-2">
        {votes.map((v) => (
          <Card key={v.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{v.title}</p>
              </div>
              <DeleteVoteButton voteId={v.id} />
            </div>
          </Card>
        ))}
        {votes.length === 0 && (
          <Card>
            <p className="text-sm text-zinc-600">{t("empty")}</p>
          </Card>
        )}
      </div>
    </>
  );
}

