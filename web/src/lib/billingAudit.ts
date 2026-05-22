import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { BillingPeriod } from "@/lib/billing";
import { normalizeHouseNumber, normalizeStreet } from "@/lib/household";

export const BillingAuditAction = {
  PAID_MARKED: "paid_marked",
  PAID_UNMARKED: "paid_unmarked",
  PAYMENT_SENT: "payment_sent",
  METER_SAVED: "meter_saved",
  COPIED_FROM_PREV: "copied_from_prev",
} as const;

export type BillingAuditAction =
  (typeof BillingAuditAction)[keyof typeof BillingAuditAction];

export type BillingAuditActor = {
  id: string;
  name: string;
};

export async function logHouseholdBillingChange(params: {
  communityId: string;
  street: string;
  houseNumber: string;
  period: BillingPeriod;
  actor: BillingAuditActor;
  action: BillingAuditAction;
  details?: Prisma.InputJsonValue;
}) {
  const street = normalizeStreet(params.street);
  const houseNumber = normalizeHouseNumber(params.houseNumber);
  await prisma.householdBillingAuditLog.create({
    data: {
      communityId: params.communityId,
      street,
      houseNumber,
      periodYear: params.period.year,
      periodMonth: params.period.month,
      actorUserId: params.actor.id,
      actorName: params.actor.name.trim() || "—",
      action: params.action,
      details: params.details ?? undefined,
    },
  });
}

export async function listHouseholdBillingAudit(params: {
  communityId: string;
  street: string;
  houseNumber: string;
  period: BillingPeriod;
  limit?: number;
}) {
  const street = normalizeStreet(params.street);
  const houseNumber = normalizeHouseNumber(params.houseNumber);
  const rows = await prisma.householdBillingAuditLog.findMany({
    where: {
      communityId: params.communityId,
      street,
      houseNumber,
      periodYear: params.period.year,
      periodMonth: params.period.month,
    },
    orderBy: { createdAt: "desc" },
    take: params.limit ?? 100,
  });
  return rows.map((r) => ({
    id: r.id,
    actorName: r.actorName,
    action: r.action,
    details: r.details,
    createdAt: r.createdAt.toISOString(),
  }));
}
