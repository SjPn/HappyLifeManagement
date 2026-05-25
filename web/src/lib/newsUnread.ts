import { EntitySeenType } from "@/lib/entitySeen";
import { prisma } from "@/lib/prisma";
import { countSimpleUnread, getSimpleUnreadMap } from "@/lib/simpleEntityUnread";
import { communityWhere } from "@/lib/tenant";

export async function getNewsUnreadMap(
  userId: string,
  communityId: string,
): Promise<Map<string, number>> {
  const posts = await prisma.newsPost.findMany({
    where: { ...communityWhere(communityId), authorId: { not: userId } },
    select: { id: true, createdAt: true },
  });
  return getSimpleUnreadMap(
    userId,
    EntitySeenType.news,
    posts.map((p) => ({ id: p.id, activityAt: p.createdAt })),
  );
}

export async function countNewsUnread(
  userId: string,
  communityId: string,
): Promise<number> {
  const posts = await prisma.newsPost.findMany({
    where: { ...communityWhere(communityId), authorId: { not: userId } },
    select: { id: true, createdAt: true },
  });
  return countSimpleUnread(
    userId,
    EntitySeenType.news,
    posts.map((p) => ({ id: p.id, activityAt: p.createdAt })),
  );
}
