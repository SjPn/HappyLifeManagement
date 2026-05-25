import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/Ui";
import { CommunityDocumentsPanel } from "@/components/CommunityDocumentsPanel";
import { getTranslations } from "next-intl/server";
import { communityWhere, requireCommunityId } from "@/lib/tenant";
import { Role } from "@/lib/enums";
import { getDocumentUnreadMap } from "@/lib/documentUnread";

export default async function CommunityDocumentsPage() {
  const session = await auth();
  const communityId = requireCommunityId(session!.user!);
  const isChair = session!.user!.role === Role.CHAIR;
  const t = await getTranslations("documents");
  const tc = await getTranslations("community");

  const userId = session!.user!.id;

  const [documents, docUnread] = await Promise.all([
    prisma.communityDocument.findMany({
      where: communityWhere(communityId),
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } },
    }),
    getDocumentUnreadMap(userId, communityId),
  ]);

  return (
    <>
      <PageTitle
        title={t("title")}
        subtitle={t("subtitle")}
        backHref="/community"
        backLabel={tc("title")}
      />
      <CommunityDocumentsPanel
        isChair={isChair}
        unreadById={docUnread}
        documents={documents.map((d) => ({
          id: d.id,
          title: d.title,
          fileUrl: d.fileUrl,
          createdAt: d.createdAt.toISOString(),
          authorName: d.author.name,
        }))}
      />
    </>
  );
}
