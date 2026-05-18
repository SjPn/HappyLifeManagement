"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeHouseNumber, normalizeStreet } from "@/lib/household";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import { communityWhere, requireCommunityId } from "@/lib/tenant";

export async function createCommunityAddress(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "CHAIR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);

  const street = normalizeStreet(String(formData.get("street") || ""));
  const houseNumber = normalizeHouseNumber(
    String(formData.get("houseNumber") || ""),
  );
  if (!street || !houseNumber) {
    return { error: "requiredFields" as const };
  }

  const existing = await prisma.communityAddress.findFirst({
    where: { street, houseNumber, ...communityWhere(communityId) },
  });
  if (existing) {
    return { error: "addressExists" as const };
  }

  await prisma.communityAddress.create({
    data: { communityId, street, houseNumber },
  });

  revalidateAllLocales("/chair/addresses");
  revalidateAllLocales("/register");
  return { ok: true as const };
}

export async function deleteCommunityAddress(addressId: string) {
  const session = await auth();
  if (session?.user?.role !== "CHAIR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);

  const address = await prisma.communityAddress.findFirst({
    where: { id: addressId, ...communityWhere(communityId) },
  });
  if (!address) return { error: "generic" as const };

  const linked = await prisma.user.count({
    where: { communityAddressId: addressId, ...communityWhere(communityId) },
  });
  if (linked > 0) {
    return { error: "addressInUse" as const };
  }

  await prisma.communityAddress.delete({ where: { id: addressId } });

  revalidateAllLocales("/chair/addresses");
  revalidateAllLocales("/register");
  return { ok: true as const };
}
