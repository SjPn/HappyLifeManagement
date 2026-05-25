import { auth } from "@/auth";
import { MarkEntitySeen } from "@/components/MarkEntitySeen";
import { NewsLikeButton } from "@/components/NewsLikeButton";
import { PageTitle, Card } from "@/components/Ui";
import { EntitySeenType } from "@/lib/entitySeen";
import { newsPostListInclude } from "@/lib/newsPosts";
import { prisma } from "@/lib/prisma";
import { communityWhere, requireCommunityId } from "@/lib/tenant";
import { getLocale, getTranslations } from "next-intl/server";
import { dateLocaleForUi } from "@/lib/dateLocale";
import { notFound, redirect } from "next/navigation";
import { Newspaper } from "lucide-react";

export default async function NewsDetailPage({
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
  const canLikeNews =
    session!.user!.status === "APPROVED" &&
    session!.user!.role !== "MODERATOR";
  const locale = await getLocale();
  const t = await getTranslations("community");
  const tLikes = await getTranslations("newsLikes");
  const dateLocale = dateLocaleForUi(locale);

  const post = await prisma.newsPost.findFirst({
    where: { id, ...communityWhere(communityId) },
    include: newsPostListInclude(userId),
  });
  if (!post) notFound();

  const likeCount = post._count.likes;
  const likedByMe = post.likes.length > 0;
  const popular =
    likeCount >= 5 ? tLikes("popular") : null;

  return (
    <>
      <MarkEntitySeen entityType={EntitySeenType.news} entityId={id} />
      <PageTitle
        title={post.title}
        subtitle={t("newsTitle")}
        backHref="/community/news"
        backLabel={t("newsTitle")}
      />
      <Card>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 text-white shadow-md">
            <Newspaper className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <div className="min-w-0 flex-1">
            {popular && (
              <span className="mb-2 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
                🔥 {popular}
              </span>
            )}
            {post.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.imageUrl}
                alt=""
                className="mb-4 max-h-96 w-full rounded-xl object-cover ring-1 ring-black/5 dark:ring-white/10"
              />
            )}
            <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
              {post.body}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                {post.author.name} ·{" "}
                {post.createdAt.toLocaleDateString(dateLocale, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              {canLikeNews && (
                <NewsLikeButton
                  newsPostId={post.id}
                  initialLiked={likedByMe}
                  initialCount={likeCount}
                />
              )}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
