import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { NewsCreateForm } from "@/components/NewsCreateForm";
import { getNewsUnreadMap } from "@/lib/newsUnread";
import { NewsPostCard } from "@/components/NewsPostCard";
import { PageTitle, Card } from "@/components/Ui";
import { newsPostCardProps, newsPostListInclude } from "@/lib/newsPosts";
import { prisma } from "@/lib/prisma";
import { communityWhere, requireCommunityId } from "@/lib/tenant";
import { getLocale, getTranslations } from "next-intl/server";
import { dateLocaleForUi } from "@/lib/dateLocale";
import { redirect } from "next/navigation";

export default async function CommunityNewsPage() {
  const session = await auth();
  if (session!.user!.role === "MODERATOR") {
    const locale = await getLocale();
    redirect(`/${locale}/chair`);
  }

  const communityId = requireCommunityId(session!.user!);
  const isChair = session!.user!.role === "CHAIR";
  const userId = session!.user!.id;
  const canLikeNews =
    session!.user!.status === "APPROVED" &&
    session!.user!.role !== "MODERATOR";
  const locale = await getLocale();
  const t = await getTranslations("community");
  const tChair = await getTranslations("chair");
  const tLikes = await getTranslations("newsLikes");
  const dateLocale = dateLocaleForUi(locale);

  const [news, newsUnread] = await Promise.all([
    prisma.newsPost.findMany({
      where: communityWhere(communityId),
      orderBy: { createdAt: "desc" },
      take: 50,
      include: newsPostListInclude(userId),
    }),
    getNewsUnreadMap(userId, communityId),
  ]);

  return (
    <>
      <PageTitle
        title={t("newsTitle")}
        subtitle={t("newsSubtitle")}
        backHref="/community"
        backLabel={t("title")}
      />

      {isChair && (
        <Card className="mb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {tChair("newsEyebrow")}
          </p>
          <NewsCreateForm />
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {news.length === 0 && (
          <Card>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("newsEmpty")}
            </p>
          </Card>
        )}
        {news.map((n) => (
          <NewsPostCard
            key={n.id}
            {...newsPostCardProps(
              n,
              n.createdAt.toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              canLikeNews,
              tLikes("popular"),
            )}
            unreadBadge={newsUnread.get(n.id)}
          />
        ))}
      </div>

      <p className="mt-8 text-center text-sm">
        <Link href="/community" className="text-blue-700 hover:underline">
          {t("back")}
        </Link>
      </p>
    </>
  );
}
