import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/Ui";
import { CommunityDocumentsPanel } from "@/components/CommunityDocumentsPanel";
import { getTranslations } from "next-intl/server";
import { communityWhere, requireCommunityId } from "@/lib/tenant";
import { Role } from "@/lib/enums";

export default async function CommunityDocumentsPage() {
  const session = await auth();
  const communityId = requireCommunityId(session!.user!);
  const isChair = session!.user!.role === Role.CHAIR;
  const t = await getTranslations("documents");

  const documents = await prisma.communityDocument.findMany({
    where: communityWhere(communityId),
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <>
      <PageTitle title={t("title")} subtitle={t("subtitle")} />
      <CommunityDocumentsPanel
        isChair={isChair}
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
