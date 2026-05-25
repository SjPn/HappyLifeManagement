import { forumTopicAudienceWhere } from "@/lib/audience";
import { EntitySeenType, getEntitySeenMap } from "@/lib/entitySeen";
import { prisma } from "@/lib/prisma";
import { communityWhere } from "@/lib/tenant";

export async function getForumUnreadByTopic(
  userId: string,
  communityId: string,
  audience: { role: string; tenancyType?: string | null },
): Promise<Map<string, number>> {
  const topics = await prisma.forumTopic.findMany({
    where: {
      ...communityWhere(communityId),
      ...forumTopicAudienceWhere(audience),
    },
    select: { id: true, createdAt: true },
  });
  if (topics.length === 0) return new Map();

  const topicIds = topics.map((t) => t.id);
  const seenMap = await getEntitySeenMap(
    userId,
    EntitySeenType.forumTopic,
    topicIds,
  );
  const topicCreated = new Map(topics.map((t) => [t.id, t.createdAt]));

  const posts = await prisma.forumPost.findMany({
    where: {
      communityId,
      topicId: { in: topicIds },
      userId: { not: userId },
    },
    select: { topicId: true, createdAt: true },
  });

  const counts = new Map<string, number>();
  for (const post of posts) {
    const baseline =
      seenMap.get(post.topicId) ?? topicCreated.get(post.topicId)!;
    if (post.createdAt > baseline) {
      counts.set(post.topicId, (counts.get(post.topicId) ?? 0) + 1);
    }
  }
  return counts;
}

export async function countForumUnreadTotal(
  userId: string,
  communityId: string,
  audience: { role: string; tenancyType?: string | null },
): Promise<number> {
  const byTopic = await getForumUnreadByTopic(userId, communityId, audience);
  let total = 0;
  for (const n of byTopic.values()) total += n;
  return total;
}
