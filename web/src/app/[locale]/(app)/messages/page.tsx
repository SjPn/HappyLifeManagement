import { auth } from "@/auth";
import { PageTitle, ButtonLink } from "@/components/Ui";
import { MessagesInbox } from "@/components/MessagesInbox";
import { listConversations } from "@/lib/conversations";
import { requireCommunityId } from "@/lib/tenant";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Role } from "@/lib/enums";

export default async function MessagesPage() {
  const session = await auth();
  if (session!.user!.role === Role.MODERATOR) {
    redirect("/chair");
  }
  const t = await getTranslations("messages");
  const communityId = requireCommunityId(session!.user!);
  const userId = session!.user!.id;

  const conversations = await listConversations(communityId, userId);

  return (
    <>
      <PageTitle title={t("title")} subtitle={t("subtitle")} />
      <div className="mb-4">
        <ButtonLink href="/messages/new">{t("newChat")}</ButtonLink>
      </div>
      <MessagesInbox conversations={conversations} />
    </>
  );
}
