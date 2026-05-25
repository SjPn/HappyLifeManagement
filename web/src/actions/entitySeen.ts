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
