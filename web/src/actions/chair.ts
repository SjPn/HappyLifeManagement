"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserStatus } from "@/lib/enums";
import { revalidateAllLocales } from "@/lib/revalidateI18n";

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
  if (session?.user?.role !== "CHAIR" && session?.user?.role !== "MODERATOR") {
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
