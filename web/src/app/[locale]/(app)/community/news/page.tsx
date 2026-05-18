import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { NewsCreateForm } from "@/components/NewsCreateForm";
import { MarkNotificationsSeen } from "@/components/MarkNotificationsSeen";
import { PageTitle, Card } from "@/components/Ui";
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
  const locale = await getLocale();
  const t = await getTranslations("community");
  const tChair = await getTranslations("chair");
  const dateLocale = dateLocaleForUi(locale);

  const news = await prisma.newsPost.findMany({
    where: communityWhere(communityId),
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { author: { select: { name: true } } },
  });

  return (
    <>
      <MarkNotificationsSeen scopes={["news"]} />
      <PageTitle title={t("newsTitle")} subtitle={t("newsSubtitle")} />

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
          <Card key={n.id}>
            <p className="font-medium">{n.title}</p>
            {n.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={n.imageUrl}
                alt=""
                className="mt-3 max-h-80 w-full rounded-xl object-cover ring-1 ring-black/5"
              />
            )}
            <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
              {n.body}
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              {n.author.name} ·{" "}
              {n.createdAt.toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </Card>
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
