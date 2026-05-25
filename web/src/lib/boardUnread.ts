import { EntitySeenType } from "@/lib/entitySeen";
import { prisma } from "@/lib/prisma";
import { countSimpleUnread, getSimpleUnreadMap } from "@/lib/simpleEntityUnread";
import { communityWhere } from "@/lib/tenant";

export async function getBoardUnreadMap(
  userId: string,
  communityId: string,
): Promise<Map<string, number>> {
  const posts = await prisma.boardPost.findMany({
    where: { ...communityWhere(communityId), userId: { not: userId } },
    select: { id: true, createdAt: true },
  });
  return getSimpleUnreadMap(
    userId,
    EntitySeenType.boardPost,
    posts.map((p) => ({ id: p.id, activityAt: p.createdAt })),
  );
}

export async function countBoardUnread(
  userId: string,
  communityId: string,
): Promise<number> {
  const posts = await prisma.boardPost.findMany({
    where: { ...communityWhere(communityId), userId: { not: userId } },
    select: { id: true, createdAt: true },
  });
  return countSimpleUnread(
    userId,
    EntitySeenType.boardPost,
    posts.map((p) => ({ id: p.id, activityAt: p.createdAt })),
  );
}
