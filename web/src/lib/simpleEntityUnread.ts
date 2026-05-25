import {
  EntitySeenType,
  getEntitySeenMap,
  type EntitySeenType as SeenType,
} from "@/lib/entitySeen";

export function isUnreadSinceSeen(
  seenAt: Date | undefined,
  activityAt: Date,
): boolean {
  return !seenAt || activityAt > seenAt;
}

export async function getSimpleUnreadMap(
  userId: string,
  entityType: SeenType,
  items: { id: string; activityAt: Date }[],
): Promise<Map<string, number>> {
  if (items.length === 0) return new Map();
  const seenMap = await getEntitySeenMap(
    userId,
    entityType,
    items.map((i) => i.id),
  );
  const counts = new Map<string, number>();
  for (const item of items) {
    if (isUnreadSinceSeen(seenMap.get(item.id), item.activityAt)) {
      counts.set(item.id, 1);
    }
  }
  return counts;
}

export async function countSimpleUnread(
  userId: string,
  entityType: SeenType,
  items: { id: string; activityAt: Date }[],
): Promise<number> {
  const map = await getSimpleUnreadMap(userId, entityType, items);
  return map.size;
}
