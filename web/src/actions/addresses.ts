"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeHouseNumber, normalizeStreet } from "@/lib/household";
import { revalidateAllLocales } from "@/lib/revalidateI18n";

export async function createCommunityAddress(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "CHAIR") {
    return { error: "forbidden" as const };
  }

  const street = normalizeStreet(String(formData.get("street") || ""));
  const houseNumber = normalizeHouseNumber(
    String(formData.get("houseNumber") || ""),
  );
  if (!street || !houseNumber) {
    return { error: "requiredFields" as const };
  }

  const existing = await prisma.communityAddress.findUnique({
    where: { street_houseNumber: { street, houseNumber } },
  });
  if (existing) {
    return { error: "addressExists" as const };
  }

  await prisma.communityAddress.create({
    data: { street, houseNumber },
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

  const linked = await prisma.user.count({
    where: { communityAddressId: addressId },
  });
  if (linked > 0) {
    return { error: "addressInUse" as const };
  }

  await prisma.communityAddress.delete({ where: { id: addressId } });

  revalidateAllLocales("/chair/addresses");
  revalidateAllLocales("/register");
  return { ok: true as const };
}

