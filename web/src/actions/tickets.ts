"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TicketCategory } from "@/lib/enums";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import { savePublicUpload } from "@/lib/upload";
import { mapUploadError } from "@/lib/uploadErrors";
import { communityWhere, requireCommunityId } from "@/lib/tenant";
import {
  notifyChairsNewTicket,
  notifyResidentTicketStatus,
} from "@/lib/push/notify";

const allowedCategories = new Set<string>(Object.values(TicketCategory));

export async function createTicket(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return { error: "noAccess" as const };
  }
  if (session.user.role === "MODERATOR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);

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
    } catch (e) {
      return { error: mapUploadError(e) };
    }
  }

  await prisma.ticket.create({
    data: {
      communityId,
      category,
      description,
      locationNote,
      photoUrl,
      userId: session.user.id,
    },
  });

  const [author, community] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    }),
    prisma.community.findUnique({
      where: { id: communityId },
      select: { defaultLocale: true },
    }),
  ]);
  void notifyChairsNewTicket({
    communityId,
    authorName: author?.name ?? "мешканець",
    locale: community?.defaultLocale ?? "uk",
  }).catch((e) => console.error("[push] new ticket", e));

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

  const communityId = requireCommunityId(session.user);

  const allowed = new Set(["NEW", "IN_PROGRESS", "RESOLVED"]);
  if (!allowed.has(status)) return { error: "badStatus" as const };

  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, ...communityWhere(communityId) },
  });
  if (!ticket) return { error: "generic" as const };

  const now = new Date();
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status, statusChangedAt: now, updatedAt: now },
  });

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { defaultLocale: true },
  });
  void notifyResidentTicketStatus({
    userId: ticket.userId,
    status,
    locale: community?.defaultLocale ?? "uk",
  }).catch((e) => console.error("[push] ticket status", e));

  revalidateAllLocales("/requests");
  revalidateAllLocales("/dashboard");
  revalidateAllLocales("/chair");
  return { ok: true };
}

export async function rateTicket(ticketId: string, rating: number) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return { error: "noAccess" as const };
  }

  const communityId = requireCommunityId(session.user);
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return { error: "badRating" as const };
  }

  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      ...communityWhere(communityId),
      userId: session.user.id,
      status: "RESOLVED",
    },
  });
  if (!ticket) return { error: "generic" as const };

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { rating, ratedAt: new Date() },
  });

  revalidateAllLocales("/requests");
  revalidateAllLocales("/requests/archive");
  revalidateAllLocales("/dashboard");
  return { ok: true as const };
}
