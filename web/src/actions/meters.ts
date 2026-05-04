"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateAllLocales } from "@/lib/revalidateI18n";

export async function addMeterReading(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return { error: "noAccess" as const };
  }

  const valueRaw = String(formData.get("value") || "").replace(",", ".");
  const value = Number(valueRaw);
  const note = String(formData.get("note") || "").trim() || null;
  if (!Number.isFinite(value) || value < 0) {
    return { error: "badValue" as const };
  }

  await prisma.meterReading.create({
    data: {
      userId: session.user.id,
      value,
      note,
    },
  });

  revalidateAllLocales("/meters");
  revalidateAllLocales("/dashboard");
  return { ok: true as const };
}
