import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, ButtonLink } from "@/components/Ui";
import { HubContentCard, HubMetaLine } from "@/components/hub/hubUi";
import { getLocale, getTranslations } from "next-intl/server";
import { dateLocaleForUi } from "@/lib/dateLocale";
import { forumTopicAudienceWhere } from "@/lib/audience";
import { redirect } from "next/navigation";
import { forumTopicAuthorLabel } from "@/lib/forumDisplay";
import { communityWhere, requireCommunityId } from "@/lib/tenant";
import { getForumUnreadByTopic } from "@/lib/forumUnread";
import { MessagesSquare } from "lucide-react";

export default async function ForumListPage() {
  const session = await auth();
  const communityId = requireCommunityId(session!.user!);
  if (session!.user!.role === "MODERATOR") {
    const locale = await getLocale();
    redirect(`/${locale}/chair`);
  }
  const locale = await getLocale();
  const t = await getTranslations("forum");
  const dateLocale = dateLocaleForUi(locale);

  const audience = {
    role: session!.user!.role,
    tenancyType: session!.user!.tenancyType,
  };

  const [topics, unreadByTopic] = await Promise.all([
    prisma.forumTopic.findMany({
      where: {
        ...communityWhere(communityId),
        ...forumTopicAudienceWhere(audience),
      },
      orderBy: { createdAt: "desc" },
      take: 40,
      include: {
        user: { select: { name: true } },
        posts: { select: { id: true } },
      },
    }),
    getForumUnreadByTopic(session!.user!.id, communityId, audience),
  ]);

  return (
    <>
      <PageTitle
        title={t("title")}
        subtitle={t("subtitle")}
        backHref="/community"
        backLabel={t("back")}
      />
      <div className="mb-5">
        <ButtonLink href="/community/forum/new">{t("newTopic")}</ButtonLink>
      </div>
      <div className="flex flex-col gap-2.5">
        {topics.map((topic) => {
          const unread = unreadByTopic.get(topic.id) ?? 0;
          return (
            <HubContentCard
              key={topic.id}
              href={`/community/forum/${topic.id}`}
              badge={unread}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md">
                  <MessagesSquare className="h-5 w-5" strokeWidth={2.25} />
                </span>
                <span className="min-w-0 flex-1 pr-8">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {topic.title}
                  </p>
                  <HubMetaLine>
                    {forumTopicAuthorLabel(
                      topic,
                      session!.user!.role,
                      t("anonymousAuthor"),
                    )}{" "}
                    · {t("postCount", { count: topic.posts.length })} ·{" "}
                    {topic.createdAt.toLocaleDateString(dateLocale, {
                      day: "numeric",
                      month: "short",
                    })}
                  </HubMetaLine>
                </span>
              </div>
            </HubContentCard>
          );
        })}
        {topics.length === 0 && (
          <HubContentCard>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("empty")}
            </p>
          </HubContentCard>
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
