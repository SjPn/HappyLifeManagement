import { prisma } from "@/lib/prisma";
import { communityWhere } from "@/lib/tenant";
import type { ConversationRow } from "@/components/MessagesInbox";

export async function listConversations(
  communityId: string,
  userId: string,
): Promise<ConversationRow[]> {
  const messages = await prisma.directMessage.findMany({
    where: {
      ...communityWhere(communityId),
      OR: [{ senderId: userId }, { recipientId: userId }],
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      sender: { select: { id: true, name: true } },
      recipient: { select: { id: true, name: true } },
    },
  });

  const byPartner = new Map<
    string,
    {
      partnerId: string;
      partnerName: string;
      lastBody: string;
      lastAt: Date;
      unread: number;
    }
  >();

  for (const m of messages) {
    const isMe = m.senderId === userId;
    const partnerId = isMe ? m.recipientId : m.senderId;
    const partnerName = isMe ? m.recipient.name : m.sender.name;
    if (byPartner.has(partnerId)) continue;

    const unread = await prisma.directMessage.count({
      where: {
        ...communityWhere(communityId),
        senderId: partnerId,
        recipientId: userId,
        readAt: null,
      },
    });

    byPartner.set(partnerId, {
      partnerId,
      partnerName,
      lastBody: m.body,
      lastAt: m.createdAt,
      unread,
    });
  }

  return [...byPartner.values()]
    .sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime())
    .map((c) => ({
      ...c,
      lastAt: c.lastAt.toISOString(),
    }));
}
