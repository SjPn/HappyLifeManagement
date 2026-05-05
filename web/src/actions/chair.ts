"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserStatus } from "@/lib/enums";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import { TenancyType } from "@/lib/audience";

function staff(session: { user?: { role?: string } } | null) {
  const r = session?.user?.role;
  return r === "CHAIR" || r === "MODERATOR";
}

export async function setUserStatus(userId: string, status: string) {
  const session = await auth();
  if (!staff(session)) return { error: "forbidden" as const };
  const allowed = new Set<string>([
    UserStatus.PENDING,
    UserStatus.APPROVED,
    UserStatus.REJECTED,
  ]);
  if (!allowed.has(status)) return { error: "badStatus" as const };

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

  const userId = String(formData.get("userId") || "");
  const balanceRaw = String(formData.get("balanceUah") || "").replace(
    ",",
    ".",
  );
  const balanceUah = Number(balanceRaw);
  if (!userId || !Number.isFinite(balanceUah)) {
    return { error: "badData" as const };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { balanceUah },
  });

  revalidateAllLocales("/chair");
  revalidateAllLocales("/profile");
  return { ok: true };
}

export async function updateUserProfile(formData: FormData) {
  const session = await auth();
  if (!staff(session)) return { error: "forbidden" as const };

  const userId = String(formData.get("userId") || "");
  const name = String(formData.get("name") || "").trim();
  const street = String(formData.get("street") || "").trim();
  const houseNumber = String(formData.get("houseNumber") || "").trim();
  const phoneRaw = String(formData.get("phone") || "").trim();
  const tenancyRaw = String(formData.get("tenancyType") || "").trim();
  const tenancyType =
    tenancyRaw === TenancyType.TENANT ? TenancyType.TENANT : TenancyType.OWNER;

  if (!userId || !name || !street || !houseNumber) {
    return { error: "requiredFields" as const };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      street,
      houseNumber,
      phone: phoneRaw || null,
      tenancyType,
    },
  });

  revalidateAllLocales("/chair/users");
  revalidateAllLocales("/profile");
  revalidateAllLocales("/dashboard");
  return { ok: true as const };
}
