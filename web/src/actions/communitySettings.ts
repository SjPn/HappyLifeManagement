"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import { requireCommunityId } from "@/lib/tenant";

export async function updatePaymentRequisites(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "CHAIR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);
  const paymentRequisites =
    String(formData.get("paymentRequisites") || "").trim() || null;

  await prisma.community.update({
    where: { id: communityId },
    data: { paymentRequisites },
  });

  revalidateAllLocales("/payments");
  revalidateAllLocales("/payments/settings");
  revalidateAllLocales("/chair");
  return { ok: true as const };
}
