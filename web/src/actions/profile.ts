"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TenancyType } from "@/lib/audience";
import { revalidateAllLocales } from "@/lib/revalidateI18n";

export async function updateMyProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "noAccess" as const };

  const name = String(formData.get("name") || "").trim();
  const street = String(formData.get("street") || "").trim();
  const houseNumber = String(formData.get("houseNumber") || "").trim();
  const phoneRaw = String(formData.get("phone") || "").trim();
  const tenancyRaw = String(formData.get("tenancyType") || "").trim();
  const tenancyType =
    tenancyRaw === TenancyType.TENANT ? TenancyType.TENANT : TenancyType.OWNER;

  if (!name || !street || !houseNumber) return { error: "requiredFields" as const };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      street,
      houseNumber,
      phone: phoneRaw || null,
      tenancyType,
    },
  });

  revalidateAllLocales("/profile");
  revalidateAllLocales("/dashboard");
  return { ok: true as const };
}

