import { voteAudienceWhere } from "@/lib/audience";
import { EntitySeenType } from "@/lib/entitySeen";
import { prisma } from "@/lib/prisma";
import { countSimpleUnread, getSimpleUnreadMap } from "@/lib/simpleEntityUnread";
import { communityWhere } from "@/lib/tenant";

function activeVotesWhere(now = new Date()) {
  return {
    OR: [{ endsAt: null }, { endsAt: { gt: now } }],
  };
}

export async function getVoteUnreadMap(
  userId: string,
  communityId: string,
  audience: { role: string; tenancyType?: string | null },
): Promise<Map<string, number>> {
  const votes = await prisma.vote.findMany({
    where: {
      ...communityWhere(communityId),
      ...voteAudienceWhere(audience),
      ...activeVotesWhere(),
    },
    select: { id: true, createdAt: true },
  });
  return getSimpleUnreadMap(
    userId,
    EntitySeenType.vote,
    votes.map((v) => ({ id: v.id, activityAt: v.createdAt })),
  );
}

export async function countVotesUnread(
  userId: string,
  communityId: string,
  audience: { role: string; tenancyType?: string | null },
): Promise<number> {
  const votes = await prisma.vote.findMany({
    where: {
      ...communityWhere(communityId),
      ...voteAudienceWhere(audience),
      ...activeVotesWhere(),
    },
    select: { id: true, createdAt: true },
  });
  return countSimpleUnread(
    userId,
    EntitySeenType.vote,
    votes.map((v) => ({ id: v.id, activityAt: v.createdAt })),
  );
}
