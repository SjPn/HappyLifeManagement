import { prisma } from "@/lib/prisma";

export const EntitySeenType = {
  forumTopic: "forum_topic",
  ticket: "ticket",
  vote: "vote",
  news: "news",
  boardPost: "board_post",
  document: "document",
  paymentBilling: "payment_billing",
  messageThread: "message_thread",
} as const;

export type EntitySeenType =
  (typeof EntitySeenType)[keyof typeof EntitySeenType];

export async function markEntitySeen(
  userId: string,
  entityType: EntitySeenType,
  entityId: string,
): Promise<void> {
  await prisma.userEntitySeen.upsert({
    where: {
      userId_entityType_entityId: { userId, entityType, entityId },
    },
    create: { userId, entityType, entityId },
    update: { seenAt: new Date() },
  });
}

export async function getEntitySeenMap(
  userId: string,
  entityType: EntitySeenType,
  entityIds: string[],
): Promise<Map<string, Date>> {
  if (entityIds.length === 0) return new Map();
  const rows = await prisma.userEntitySeen.findMany({
    where: { userId, entityType, entityId: { in: entityIds } },
    select: { entityId: true, seenAt: true },
  });
  return new Map(rows.map((r) => [r.entityId, r.seenAt]));
}
