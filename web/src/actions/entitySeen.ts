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
    forum_topic: ["/community", "/community/forum"],
    ticket: ["/dashboard", "/requests"],
  };
  for (const p of paths[entityType] ?? []) {
    revalidateAllLocales(p);
  }
  if (entityType === EntitySeenType.forumTopic) {
    revalidateAllLocales(`/community/forum/${entityId}`);
  }

  return { ok: true as const };
}
