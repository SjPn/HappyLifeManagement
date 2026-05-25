import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { MarkEntitySeen } from "@/components/MarkEntitySeen";
import { PageTitle, Card } from "@/components/Ui";
import { EntitySeenType } from "@/lib/entitySeen";
import { prisma } from "@/lib/prisma";
import { communityWhere, requireCommunityId } from "@/lib/tenant";
import { getLocale, getTranslations } from "next-intl/server";
import { dateLocaleForUi } from "@/lib/dateLocale";
import { notFound, redirect } from "next/navigation";
import { Megaphone } from "lucide-react";

export default async function BoardPostPage({
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
  const locale = await getLocale();
  const t = await getTranslations("board");
  const tCat = await getTranslations("categories.board");
  const dateLocale = dateLocaleForUi(locale);

  const post = await prisma.boardPost.findFirst({
    where: { id, ...communityWhere(communityId) },
    include: { user: { select: { name: true } } },
  });
  if (!post) notFound();

  const canEdit =
    post.userId === userId || session!.user!.role === "CHAIR";

  return (
    <>
      <MarkEntitySeen entityType={EntitySeenType.boardPost} entityId={id} />
      <PageTitle
        title={post.title}
        subtitle={tCat(post.category)}
        backHref="/community/board"
        backLabel={t("title")}
      />
      <Card>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
            <Megaphone className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
              {post.body}
            </p>
            {post.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.imageUrl}
                alt=""
                className="mt-4 max-h-96 w-full rounded-xl object-cover ring-1 ring-black/5"
              />
            )}
            <p className="mt-4 text-xs text-slate-500">
              {post.user.name} ·{" "}
              {post.createdAt.toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            {canEdit && (
              <Link
                href={`/community/board/${post.id}/edit`}
                className="mt-3 inline-block text-sm font-semibold text-blue-700 hover:underline"
              >
                {t("edit")}
              </Link>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}
