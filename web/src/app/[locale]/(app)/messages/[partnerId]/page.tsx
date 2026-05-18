import { auth } from "@/auth";
import { MessageThread, type MessageRow } from "@/components/MessageThread";
import { ButtonLink } from "@/components/Ui";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";
import { communityWhere, requireCommunityId } from "@/lib/tenant";
import { markMessagesRead } from "@/actions/messages";
import { getTranslations } from "next-intl/server";
import { redirect, notFound } from "next/navigation";

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ partnerId: string }>;
}) {
  const { partnerId } = await params;
  const session = await auth();
  if (session!.user!.role === Role.MODERATOR) redirect("/chair");

  const communityId = requireCommunityId(session!.user!);
  const userId = session!.user!.id;
  const t = await getTranslations("messages");

  const partner = await prisma.user.findFirst({
    where: {
      id: partnerId,
      ...communityWhere(communityId),
      status: "APPROVED",
      role: { in: [Role.RESIDENT, Role.CHAIR] },
    },
    select: { id: true, name: true },
  });
  if (!partner) notFound();

  const rows = await prisma.directMessage.findMany({
    where: {
      ...communityWhere(communityId),
      OR: [
        { senderId: userId, recipientId: partnerId },
        { senderId: partnerId, recipientId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  await markMessagesRead(partnerId);

  const messages: MessageRow[] = rows.map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    mine: m.senderId === userId,
  }));

  return (
    <>
      <div className="mb-4">
        <ButtonLink href="/messages" variant="secondary">
          {t("back")}
        </ButtonLink>
      </div>
      <MessageThread
        partnerId={partner.id}
        partnerName={partner.name}
        messages={messages}
      />
    </>
  );
}
