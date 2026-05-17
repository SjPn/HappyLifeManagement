"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TenancyType } from "@/lib/audience";
import { resolveCommunityAddress } from "@/lib/communityAddresses";
import { revalidateAllLocales } from "@/lib/revalidateI18n";

export async function updateMyProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "noAccess" as const };

  const name = String(formData.get("name") || "").trim();
  const communityAddressId = String(
    formData.get("communityAddressId") || "",
  ).trim();
  const phoneRaw = String(formData.get("phone") || "").trim();
  const tenancyRaw = String(formData.get("tenancyType") || "").trim();
  const tenancyType =
    tenancyRaw === TenancyType.TENANT ? TenancyType.TENANT : TenancyType.OWNER;

  if (!name || !communityAddressId) return { error: "requiredFields" as const };

  const address = await resolveCommunityAddress(communityAddressId);
  if (!address) return { error: "invalidAddress" as const };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      street: address.street,
      houseNumber: address.houseNumber,
      communityAddressId: address.id,
      phone: phoneRaw || null,
      tenancyType,
    },
  });

  revalidateAllLocales("/profile");
  revalidateAllLocales("/dashboard");
  revalidateAllLocales("/payments");
  return { ok: true as const };
}

