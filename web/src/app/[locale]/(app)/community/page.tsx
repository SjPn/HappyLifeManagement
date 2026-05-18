import { auth } from "@/auth";
import { PageTitle } from "@/components/Ui";
import { CommunityHubSection } from "@/components/CommunityHubSection";
import { getCommunityHubStats } from "@/lib/hubStats";
import { requireCommunityId } from "@/lib/tenant";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function CommunityHubPage() {
  const session = await auth();
  if (session!.user!.role === "MODERATOR") {
    const locale = await getLocale();
    redirect(`/${locale}/chair`);
  }
  const communityId = requireCommunityId(session!.user!);
  const t = await getTranslations("community");
  const stats = await getCommunityHubStats(communityId, session!.user!.id);

  return (
    <>
      <PageTitle title={t("title")} subtitle={t("subtitle")} />
      <CommunityHubSection
        stats={stats}
        items={[
          {
            id: "news",
            href: "/community/news",
            title: t("newsTitle"),
            desc: t("newsDesc"),
            countKey: "news",
          },
          {
            id: "board",
            href: "/community/board",
            title: t("boardTitle"),
            desc: t("boardDesc"),
            countKey: "board",
          },
          {
            id: "forum",
            href: "/community/forum",
            title: t("forumTitle"),
            desc: t("forumDesc"),
            countKey: "forum",
          },
          {
            id: "residents",
            href: "/residents",
            title: t("residentsTitle"),
            desc: t("residentsDesc"),
          },
          {
            id: "messages",
            href: "/messages",
            title: t("messagesTitle"),
            desc: t("messagesDesc"),
            countKey: "messages",
          },
        ]}
      />
    </>
  );
}
