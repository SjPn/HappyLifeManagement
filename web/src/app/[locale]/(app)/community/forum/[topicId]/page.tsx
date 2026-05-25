import { Link } from "@/i18n/navigation";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card } from "@/components/Ui";
import { ForumReplyForm } from "@/components/ForumReplyForm";
import { getLocale, getTranslations } from "next-intl/server";
import { dateLocaleForUi } from "@/lib/dateLocale";
import { auth } from "@/auth";
import { userMatchesAudience } from "@/lib/audience";
import {
  canSeeForumTopicAuthor,
  forumPostAuthorLabel,
  forumTopicAuthorLabel,
} from "@/lib/forumDisplay";
import { communityWhere, requireCommunityId } from "@/lib/tenant";
import { ForumPostGallery } from "@/components/ForumPostGallery";
import { MarkEntitySeen } from "@/components/MarkEntitySeen";

export default async function ForumTopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const session = await auth();
  const locale = await getLocale();
  if (session!.user!.role === "MODERATOR") {
    redirect(`/${locale}/chair`);
  }
  const t = await getTranslations("forum");
  const dateLocale = dateLocaleForUi(locale);

  const communityId = requireCommunityId(session!.user!);
  const topic = await prisma.forumTopic.findFirst({
    where: { id: topicId, ...communityWhere(communityId) },
    include: {
      user: { select: { name: true } },
      posts: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { name: true } },
          images: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!topic) notFound();

  if (
    !userMatchesAudience(
      session!.user!.role,
      session!.user!.tenancyType,
      topic.audience,
    )
  ) {
    notFound();
  }

  return (
    <>
      <MarkEntitySeen entityType="forum_topic" entityId={topicId} />
      <PageTitle
        title={topic.title}
        backHref="/community/forum"
        backLabel={t("backList")}
      />
      <p className="mb-6 text-xs text-zinc-500">
        {t("authorTopic")}{" "}
        {forumTopicAuthorLabel(
          topic,
          session!.user!.role,
          t("anonymousAuthor"),
        )}
        {topic.isAnonymous &&
          canSeeForumTopicAuthor(topic.isAnonymous, session!.user!.role) && (
            <span className="text-amber-700 dark:text-amber-300">
              {" "}
              ({t("anonymousStaffNote")})
            </span>
          )}
        {" · "}
        {topic.createdAt.toLocaleString(dateLocale)}
      </p>
      {(topic.userId === session!.user!.id ||
        session!.user!.role === "CHAIR" ||
        session!.user!.role === "MODERATOR") && (
        <p className="mb-4">
          <Link
            href={`/community/forum/${topic.id}/edit`}
            className="text-xs font-semibold text-blue-700 hover:underline"
          >
            {t("edit")}
          </Link>
        </p>
      )}

      <div className="flex flex-col gap-4">
        {topic.posts.map((p) => (
          <Card key={p.id}>
            <p className="text-xs text-zinc-500">
              {forumPostAuthorLabel(
                topic,
                p,
                session!.user!.role,
                t("anonymousAuthor"),
              )}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{p.body}</p>
            <ForumPostGallery post={p} />
            <p className="mt-2 text-xs text-zinc-400">
              {p.createdAt.toLocaleString(dateLocale)}
            </p>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold">{t("replyHeading")}</h2>
      <Card>
        <ForumReplyForm topicId={topic.id} />
      </Card>

      <p className="mt-8 text-center text-sm">
        <Link href="/community/forum" className="text-blue-700 hover:underline">
          {t("backList")}
        </Link>
      </p>
    </>
  );
}
