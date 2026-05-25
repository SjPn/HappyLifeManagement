import { EntitySeenType } from "@/lib/entitySeen";
import { prisma } from "@/lib/prisma";
import { countSimpleUnread, getSimpleUnreadMap } from "@/lib/simpleEntityUnread";
import { communityWhere } from "@/lib/tenant";

export async function getDocumentUnreadMap(
  userId: string,
  communityId: string,
): Promise<Map<string, number>> {
  const docs = await prisma.communityDocument.findMany({
    where: { ...communityWhere(communityId), authorId: { not: userId } },
    select: { id: true, createdAt: true },
  });
  return getSimpleUnreadMap(
    userId,
    EntitySeenType.document,
    docs.map((d) => ({ id: d.id, activityAt: d.createdAt })),
  );
}

export async function countDocumentsUnread(
  userId: string,
  communityId: string,
): Promise<number> {
  const docs = await prisma.communityDocument.findMany({
    where: { ...communityWhere(communityId), authorId: { not: userId } },
    select: { id: true, createdAt: true },
  });
  return countSimpleUnread(
    userId,
    EntitySeenType.document,
    docs.map((d) => ({ id: d.id, activityAt: d.createdAt })),
  );
}
