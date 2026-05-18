import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card, ButtonLink } from "@/components/Ui";
import { getLocale, getTranslations } from "next-intl/server";
import { dateLocaleForUi } from "@/lib/dateLocale";
import { redirect } from "next/navigation";
import { MarkNotificationsSeen } from "@/components/MarkNotificationsSeen";
import { communityWhere, requireCommunityId } from "@/lib/tenant";

export default async function BoardPage() {
  const session = await auth();
  const communityId = requireCommunityId(session!.user!);
  if (session!.user!.role === "MODERATOR") {
    const locale = await getLocale();
    redirect(`/${locale}/chair`);
  }
  const userId = session!.user!.id;
  const locale = await getLocale();
  const t = await getTranslations("board");
  const tCat = await getTranslations("categories.board");
  const dateLocale = dateLocaleForUi(locale);

  const posts = await prisma.boardPost.findMany({
    where: communityWhere(communityId),
    orderBy: { createdAt: "desc" },
    take: 40,
    include: { user: { select: { name: true } } },
  });

  return (
    <>
      <MarkNotificationsSeen scopes={["board"]} />
      <PageTitle title={t("title")} subtitle={t("subtitle")} />
      <div className="mb-4">
        <ButtonLink href="/community/board/new">{t("new")}</ButtonLink>
      </div>
      <div className="flex flex-col gap-3">
        {posts.map((p) => (
          <Card key={p.id}>
            <p className="text-xs font-medium uppercase text-blue-700">
              {tCat(p.category)}
            </p>
            <p className="mt-2 font-medium">{p.title}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
              {p.body}
            </p>
            {(p.userId === userId || session!.user!.role === "CHAIR") && (
              <div className="mt-3">
                <Link
                  href={`/community/board/${p.id}/edit`}
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  {t("edit")}
                </Link>
              </div>
            )}
            {p.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.imageUrl}
                alt=""
                className="mt-3 max-h-72 w-full rounded-xl object-cover ring-1 ring-black/5"
              />
            )}
            <p className="mt-3 text-xs text-zinc-500">
              {p.user.name} ·{" "}
              {p.createdAt.toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "short",
              })}
            </p>
          </Card>
        ))}
        {posts.length === 0 && (
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
