import { Role } from "@/lib/enums";
import { EntitySeenType, getEntitySeenMap } from "@/lib/entitySeen";
import { isUnreadSinceSeen } from "@/lib/simpleEntityUnread";
import { normalizeHouseNumber, normalizeStreet } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { communityWhere } from "@/lib/tenant";

function billingActivityAt(b: {
  paymentSentAt: Date | null;
  updatedAt: Date;
}): Date | null {
  if (!b.paymentSentAt) return null;
  return b.updatedAt > b.paymentSentAt ? b.updatedAt : b.paymentSentAt;
}

function billingNeedsAttention(b: {
  paymentSentAt: Date | null;
  paidAt: Date | null;
  subscriptionFeeUah: number;
  electricityUah: number;
}): boolean {
  if (!b.paymentSentAt || b.paidAt) return false;
  return b.subscriptionFeeUah + b.electricityUah > 0;
}

export async function getPaymentBillingUnreadMap(
  userId: string,
  communityId: string,
  street: string,
  houseNumber: string,
): Promise<Map<string, number>> {
  const billings = await prisma.householdBilling.findMany({
    where: {
      ...communityWhere(communityId),
      street: normalizeStreet(street),
      houseNumber: normalizeHouseNumber(houseNumber),
      paymentSentAt: { not: null },
      paidAt: null,
    },
    select: {
      id: true,
      paymentSentAt: true,
      updatedAt: true,
      subscriptionFeeUah: true,
      electricityUah: true,
      paidAt: true,
    },
  });

  const relevant = billings.filter(billingNeedsAttention);
  if (relevant.length === 0) return new Map();

  const seenMap = await getEntitySeenMap(
    userId,
    EntitySeenType.paymentBilling,
    relevant.map((b) => b.id),
  );

  const counts = new Map<string, number>();
  for (const b of relevant) {
    const activity = billingActivityAt(b);
    if (!activity) continue;
    if (isUnreadSinceSeen(seenMap.get(b.id), activity)) {
      counts.set(b.id, 1);
    }
  }
  return counts;
}

export async function countPaymentsUnread(
  userId: string,
  user: {
    role: string;
    communityId: string;
    street?: string;
    houseNumber?: string;
  },
): Promise<number> {
  if (user.role === Role.CHAIR || !user.street || !user.houseNumber) {
    return 0;
  }
  const map = await getPaymentBillingUnreadMap(
    userId,
    user.communityId,
    user.street,
    user.houseNumber,
  );
  return map.size;
}
