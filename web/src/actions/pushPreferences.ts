"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePushPreferences(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return { error: "noAccess" as const };
  }

  const data: {
    pushNotifyNewTickets?: boolean;
    pushNotifyTicketStatus?: boolean;
    pushNotifyNews?: boolean;
    pushNotifyDebt?: boolean;
  } = {};

  for (const key of [
    "pushNotifyNewTickets",
    "pushNotifyTicketStatus",
    "pushNotifyNews",
    "pushNotifyDebt",
  ] as const) {
    const v = formData.get(key);
    if (v !== null) data[key] = v === "on" || v === "true" || v === "1";
  }

  if (Object.keys(data).length === 0) {
    return { error: "generic" as const };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data,
  });

  revalidatePath("/profile", "layout");
  return { ok: true as const };
}
