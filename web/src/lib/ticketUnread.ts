import { Role } from "@/lib/enums";
import { EntitySeenType, getEntitySeenMap } from "@/lib/entitySeen";
import { prisma } from "@/lib/prisma";
import { communityWhere } from "@/lib/tenant";

export async function getTicketUnreadCounts(
  userId: string,
  communityId: string,
  role: string,
): Promise<Map<string, number>> {
  const tenant = communityWhere(communityId);
  const staff = role === Role.CHAIR || role === Role.MODERATOR;
  const where = staff ? tenant : { ...tenant, userId };

  const tickets = await prisma.ticket.findMany({
    where: { ...where, status: { not: "RESOLVED" } },
    select: { id: true, createdAt: true, updatedAt: true },
  });
  if (tickets.length === 0) return new Map();

  const seenMap = await getEntitySeenMap(
    userId,
    EntitySeenType.ticket,
    tickets.map((t) => t.id),
  );

  const counts = new Map<string, number>();
  for (const ticket of tickets) {
    const baseline = seenMap.get(ticket.id) ?? ticket.createdAt;
    if (ticket.updatedAt > baseline) {
      counts.set(ticket.id, 1);
    }
  }
  return counts;
}

export async function countTicketsUnread(
  userId: string,
  communityId: string,
  role: string,
): Promise<number> {
  const map = await getTicketUnreadCounts(userId, communityId, role);
  return map.size;
}
