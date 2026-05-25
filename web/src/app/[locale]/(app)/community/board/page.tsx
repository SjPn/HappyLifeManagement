import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, ButtonLink } from "@/components/Ui";
import { HubContentCard, HubMetaLine } from "@/components/hub/hubUi";
import { getLocale, getTranslations } from "next-intl/server";
import { dateLocaleForUi } from "@/lib/dateLocale";
import { redirect } from "next/navigation";
import { getBoardUnreadMap } from "@/lib/boardUnread";
import { communityWhere, requireCommunityId } from "@/lib/tenant";
import { Megaphone } from "lucide-react";

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

  const [posts, boardUnread] = await Promise.all([
    prisma.boardPost.findMany({
      where: communityWhere(communityId),
      orderBy: { createdAt: "desc" },
      take: 40,
      include: { user: { select: { name: true } } },
    }),
    getBoardUnreadMap(userId, communityId),
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
        <ButtonLink href="/community/board/new">{t("new")}</ButtonLink>
      </div>
      <div className="flex flex-col gap-2.5">
        {posts.map((p) => (
          <HubContentCard
            key={p.id}
            href={`/community/board/${p.id}`}
            badge={boardUnread.get(p.id)}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
                <Megaphone className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <span className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600/90 dark:text-blue-400/90">
                  {tCat(p.category)}
                </p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                  {p.title}
                </p>
                <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">
                  {p.body}
                </p>
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="mt-3 max-h-48 w-full rounded-xl object-cover ring-1 ring-black/5"
                  />
                )}
                <HubMetaLine>
                  {p.user.name} ·{" "}
                  {p.createdAt.toLocaleDateString(dateLocale, {
                    day: "numeric",
                    month: "short",
                  })}
                </HubMetaLine>
                {(p.userId === userId || session!.user!.role === "CHAIR") && (
                  <Link
                    href={`/community/board/${p.id}/edit`}
                    className="mt-2 inline-block text-xs font-semibold text-blue-700 hover:underline"
                  >
                    {t("edit")}
                  </Link>
                )}
              </span>
            </div>
          </HubContentCard>
        ))}
        {posts.length === 0 && (
          <HubContentCard>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("empty")}</p>
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
