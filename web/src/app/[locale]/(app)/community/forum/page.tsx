import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card, ButtonLink } from "@/components/Ui";
import { getLocale, getTranslations } from "next-intl/server";
import { dateLocaleForUi } from "@/lib/dateLocale";
import { forumTopicAudienceWhere } from "@/lib/audience";
import { redirect } from "next/navigation";
import { MarkNotificationsSeen } from "@/components/MarkNotificationsSeen";
import { forumTopicAuthorLabel } from "@/lib/forumDisplay";
import { communityWhere, requireCommunityId } from "@/lib/tenant";

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

  const topics = await prisma.forumTopic.findMany({
    where: {
      ...communityWhere(communityId),
      ...forumTopicAudienceWhere({
        role: session!.user!.role,
        tenancyType: session!.user!.tenancyType,
      }),
    },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      user: { select: { name: true } },
      posts: { select: { id: true } },
    },
  });

  return (
    <>
      <MarkNotificationsSeen scopes={["forum"]} />
      <PageTitle title={t("title")} subtitle={t("subtitle")} />
      <div className="mb-4">
        <ButtonLink href="/community/forum/new">{t("newTopic")}</ButtonLink>
      </div>
      <div className="flex flex-col gap-2">
        {topics.map((topic) => (
          <Link key={topic.id} href={`/community/forum/${topic.id}`}>
            <Card className="transition hover:border-blue-300">
              <p className="font-medium">{topic.title}</p>
              <p className="mt-2 text-xs text-zinc-500">
                {forumTopicAuthorLabel(topic, session!.user!.role, t("anonymousAuthor"))}{" "}
                · {t("postCount", { count: topic.posts.length })}{" "}
                ·{" "}
                {topic.createdAt.toLocaleDateString(dateLocale, {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </Card>
          </Link>
        ))}
        {topics.length === 0 && (
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
