"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role, UserStatus } from "@/lib/enums";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import { TenancyType } from "@/lib/audience";
import { resolveCommunityAddress } from "@/lib/communityAddresses";
import {
  billingUniqueWhere,
  type BillingPeriod,
} from "@/lib/billing";
import { normalizeHouseNumber, normalizeStreet } from "@/lib/household";
import { communityWhere, requireCommunityId } from "@/lib/tenant";

function staff(session: { user?: { role?: string } } | null) {
  const r = session?.user?.role;
  return r === "CHAIR" || r === "MODERATOR";
}

export async function setUserStatus(userId: string, status: string) {
  const session = await auth();
  if (!staff(session)) return { error: "forbidden" as const };

  const communityId = requireCommunityId(session!.user!);

  const allowed = new Set<string>([
    UserStatus.PENDING,
    UserStatus.APPROVED,
    UserStatus.REJECTED,
  ]);
  if (!allowed.has(status)) return { error: "badStatus" as const };

  const user = await prisma.user.findFirst({
    where: { id: userId, ...communityWhere(communityId) },
  });
  if (!user) return { error: "badData" as const };

  await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  revalidateAllLocales("/chair");
  revalidateAllLocales("/chair/users");
  return { ok: true };
}

export async function setUserBalance(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "CHAIR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);

  const userId = String(formData.get("userId") || "");
  const balanceRaw = String(formData.get("balanceUah") || "").replace(
    ",",
    ".",
  );
  const balanceUah = Number(balanceRaw);
  if (!userId || !Number.isFinite(balanceUah)) {
    return { error: "badData" as const };
  }

  const user = await prisma.user.findFirst({
    where: { id: userId, ...communityWhere(communityId) },
  });
  if (!user) return { error: "badData" as const };

  await prisma.user.update({
    where: { id: userId },
    data: { balanceUah },
  });

  revalidateAllLocales("/chair");
  revalidateAllLocales("/chair/users");
  revalidateAllLocales("/payments");
  revalidateAllLocales("/profile");
  return { ok: true };
}

function parseUah(raw: string) {
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function parseBillingPeriodFromForm(
  formData: FormData,
): BillingPeriod | null {
  const year = Number(formData.get("periodYear"));
  const month = Number(formData.get("periodMonth"));
  if (
    !Number.isInteger(year) ||
    year < 2020 ||
    year > 2100 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }
  return { year, month };
}

export async function setHouseholdPayments(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "CHAIR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);

  const period = parseBillingPeriodFromForm(formData);
  const street = normalizeStreet(String(formData.get("street") || ""));
  const houseNumber = normalizeHouseNumber(
    String(formData.get("houseNumber") || ""),
  );
  const subscriptionFeeUah = parseUah(
    String(formData.get("subscriptionFeeUah") || ""),
  );
  const electricityUah = parseUah(String(formData.get("electricityUah") || ""));
  if (
    !period ||
    !street ||
    !houseNumber ||
    subscriptionFeeUah === null ||
    electricityUah === null
  ) {
    return { error: "badData" as const };
  }

  const uniqueWhere = billingUniqueWhere(
    communityId,
    street,
    houseNumber,
    period,
  );
  const existing = await prisma.householdBilling.findUnique({
    where: uniqueWhere,
  });
  const amountsChanged =
    existing != null &&
    (existing.subscriptionFeeUah !== subscriptionFeeUah ||
      existing.electricityUah !== electricityUah);

  await prisma.householdBilling.upsert({
    where: uniqueWhere,
    create: {
      communityId,
      street,
      houseNumber,
      periodYear: period.year,
      periodMonth: period.month,
      subscriptionFeeUah,
      electricityUah,
    },
    update: {
      subscriptionFeeUah,
      electricityUah,
      ...(amountsChanged ? { paidAt: null } : {}),
    },
  });

  revalidateAllLocales("/chair");
  revalidateAllLocales("/chair/users");
  revalidateAllLocales("/payments");
  revalidateAllLocales("/dashboard");
  return { ok: true as const };
}

export async function setHouseholdPaid(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "CHAIR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);

  const period = parseBillingPeriodFromForm(formData);
  const street = normalizeStreet(String(formData.get("street") || ""));
  const houseNumber = normalizeHouseNumber(
    String(formData.get("houseNumber") || ""),
  );
  const paid = formData.get("paid") === "true";
  if (!period || !street || !houseNumber) {
    return { error: "badData" as const };
  }

  const uniqueWhere = billingUniqueWhere(
    communityId,
    street,
    houseNumber,
    period,
  );

  await prisma.householdBilling.upsert({
    where: uniqueWhere,
    create: {
      communityId,
      street,
      houseNumber,
      periodYear: period.year,
      periodMonth: period.month,
      paidAt: paid ? new Date() : null,
    },
    update: {
      paidAt: paid ? new Date() : null,
    },
  });

  revalidateAllLocales("/payments");
  revalidateAllLocales("/dashboard");
  return { ok: true as const };
}

export async function updateUserProfile(formData: FormData) {
  const session = await auth();
  if (!staff(session)) return { error: "forbidden" as const };

  const communityId = requireCommunityId(session!.user!);

  const userId = String(formData.get("userId") || "");
  const name = String(formData.get("name") || "").trim();
  const communityAddressId = String(
    formData.get("communityAddressId") || "",
  ).trim();
  const phoneRaw = String(formData.get("phone") || "").trim();
  const tenancyRaw = String(formData.get("tenancyType") || "").trim();
  const tenancyType =
    tenancyRaw === TenancyType.TENANT ? TenancyType.TENANT : TenancyType.OWNER;

  if (!userId || !name || !communityAddressId) {
    return { error: "requiredFields" as const };
  }

  const target = await prisma.user.findFirst({
    where: { id: userId, ...communityWhere(communityId) },
  });
  if (!target) return { error: "badData" as const };

  const address = await resolveCommunityAddress(communityAddressId, communityId);
  if (!address) return { error: "invalidAddress" as const };

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      street: address.street,
      houseNumber: address.houseNumber,
      communityAddressId: address.id,
      phone: phoneRaw || null,
      tenancyType,
    },
  });

  revalidateAllLocales("/chair/users");
  revalidateAllLocales("/profile");
  revalidateAllLocales("/dashboard");
  revalidateAllLocales("/payments");
  return { ok: true as const };
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!staff(session)) return { error: "forbidden" as const };
  if (!userId) return { error: "badData" as const };
  if (session!.user!.id === userId) {
    return { error: "cannotDeleteSelf" as const };
  }

  const communityId = requireCommunityId(session!.user!);

  const user = await prisma.user.findFirst({
    where: { id: userId, ...communityWhere(communityId) },
    select: { role: true },
  });
  if (!user) return { error: "badData" as const };
  if (user.role !== Role.RESIDENT) {
    return { error: "cannotDeleteStaff" as const };
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidateAllLocales("/chair");
  revalidateAllLocales("/chair/users");
  revalidateAllLocales("/residents");
  revalidateAllLocales("/community");
  revalidateAllLocales("/dashboard");
  return { ok: true as const };
}
