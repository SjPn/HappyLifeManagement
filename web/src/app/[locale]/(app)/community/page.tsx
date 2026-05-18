import { auth } from "@/auth";
import { PageTitle } from "@/components/Ui";
import { CommunityHubSection } from "@/components/CommunityHubSection";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function CommunityHubPage() {
  const session = await auth();
  if (session!.user!.role === "MODERATOR") {
    const locale = await getLocale();
    redirect(`/${locale}/chair`);
  }
  const t = await getTranslations("community");

  return (
    <>
      <PageTitle title={t("title")} subtitle={t("subtitle")} />
      <CommunityHubSection
        items={[
          {
            href: "/community/news",
            title: t("newsTitle"),
            desc: t("newsDesc"),
            countKey: "news",
          },
          {
            href: "/community/board",
            title: t("boardTitle"),
            desc: t("boardDesc"),
            countKey: "board",
          },
          {
            href: "/community/forum",
            title: t("forumTitle"),
            desc: t("forumDesc"),
            countKey: "forum",
          },
          {
            href: "/residents",
            title: t("residentsTitle"),
            desc: t("residentsDesc"),
          },
          {
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
