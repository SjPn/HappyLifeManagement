"use server";

import { auth } from "@/auth";
import {
  EntitySeenType,
  markEntitySeen,
  type EntitySeenType as SeenType,
} from "@/lib/entitySeen";
import { revalidateAllLocales } from "@/lib/revalidateI18n";

const allowed = new Set<string>(Object.values(EntitySeenType));

export async function markEntitySeenAction(
  entityType: string,
  entityId: string,
) {
  const session = await auth();
  if (!session?.user?.id || !allowed.has(entityType) || !entityId) {
    return { error: "forbidden" as const };
  }

  await markEntitySeen(
    session.user.id,
    entityType as SeenType,
    entityId.trim(),
  );

  const paths: Record<string, string[]> = {
    [EntitySeenType.forumTopic]: ["/community", "/community/forum"],
    [EntitySeenType.ticket]: ["/dashboard", "/requests"],
    [EntitySeenType.vote]: ["/dashboard", "/votes"],
    [EntitySeenType.news]: ["/dashboard", "/community", "/community/news"],
    [EntitySeenType.boardPost]: ["/community", "/community/board"],
    [EntitySeenType.document]: ["/community", "/community/documents"],
    [EntitySeenType.paymentBilling]: ["/dashboard", "/payments"],
    [EntitySeenType.messageThread]: ["/community", "/messages"],
  };
  for (const p of paths[entityType] ?? []) {
    revalidateAllLocales(p);
  }
  if (entityType === EntitySeenType.forumTopic) {
    revalidateAllLocales(`/community/forum/${entityId}`);
  }
  if (entityType === EntitySeenType.vote) {
    revalidateAllLocales(`/votes/${entityId}`);
  }
  if (entityType === EntitySeenType.news) {
    revalidateAllLocales(`/community/news/${entityId}`);
  }
  if (entityType === EntitySeenType.boardPost) {
    revalidateAllLocales(`/community/board/${entityId}`);
  }
  if (entityType === EntitySeenType.messageThread) {
    revalidateAllLocales(`/messages/${entityId}`);
  }

  return { ok: true as const };
}

export async function markDashboardSeenAction({
  newsIds = [],
  ticketIds = [],
  voteId,
}: {
  newsIds?: string[];
  ticketIds?: string[];
  voteId?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "forbidden" as const };

  const userId = session.user.id;
  const tasks: Promise<void>[] = [];

  for (const id of newsIds) {
    if (id) {
      tasks.push(
        markEntitySeen(userId, EntitySeenType.news, id),
      );
    }
  }
  for (const id of ticketIds) {
    if (id) {
      tasks.push(
        markEntitySeen(userId, EntitySeenType.ticket, id),
      );
    }
  }
  if (voteId) {
    tasks.push(markEntitySeen(userId, EntitySeenType.vote, voteId));
  }

  if (tasks.length === 0) return { ok: true as const };

  await Promise.all(tasks);

  for (const p of ["/dashboard", "/requests", "/votes", "/community/news"]) {
    revalidateAllLocales(p);
  }

  return { ok: true as const };
}
