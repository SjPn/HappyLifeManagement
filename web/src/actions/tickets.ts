"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TicketCategory } from "@/lib/enums";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import { savePublicUpload } from "@/lib/upload";

const allowedCategories = new Set<string>(Object.values(TicketCategory));

export async function createTicket(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return { error: "noAccess" as const };
  }
  if (session.user.role === "MODERATOR") {
    return { error: "forbidden" as const };
  }

  const categoryRaw = String(formData.get("category") || "");
  const category = allowedCategories.has(categoryRaw)
    ? categoryRaw
    : "OTHER";
  const description = String(formData.get("description") || "").trim();
  const locationNote =
    String(formData.get("locationNote") || "").trim() || null;
  const file = formData.get("photo");

  if (!description) return { error: "noDescription" as const };

  let photoUrl: string | null = null;
  if (file instanceof File && file.size > 0) {
    try {
      photoUrl = await savePublicUpload(file);
    } catch {
      return { error: "badFile" as const };
    }
  }

  await prisma.ticket.create({
    data: {
      category,
      description,
      locationNote,
      photoUrl,
      userId: session.user.id,
    },
  });

  revalidateAllLocales("/requests");
  revalidateAllLocales("/dashboard");
  return { ok: true as const };
}

export async function updateTicketStatus(ticketId: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "noAccess" as const };
  if (session.user.role !== "CHAIR" && session.user.role !== "MODERATOR") {
    return { error: "staffOnly" as const };
  }

  const allowed = new Set(["NEW", "IN_PROGRESS", "RESOLVED"]);
  if (!allowed.has(status)) return { error: "badStatus" as const };

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status },
  });

  revalidateAllLocales("/requests");
  revalidateAllLocales("/dashboard");
  revalidateAllLocales("/chair");
  return { ok: true };
}
