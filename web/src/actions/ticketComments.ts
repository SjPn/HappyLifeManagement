"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import { savePublicUpload } from "@/lib/upload";
import { mapUploadError } from "@/lib/uploadErrors";
import { communityWhere, requireCommunityId } from "@/lib/tenant";

export async function addTicketComment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return { error: "noAccess" as const };
  }

  const communityId = requireCommunityId(session.user);
  const ticketId = String(formData.get("ticketId") || "");
  const body = String(formData.get("body") || "").trim();
  const image = formData.get("image");

  if (!ticketId) return { error: "generic" as const };

  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, ...communityWhere(communityId) },
    select: { id: true, userId: true },
  });
  if (!ticket) return { error: "generic" as const };

  const isStaff =
    session.user.role === "CHAIR" || session.user.role === "MODERATOR";
  const isOwner = ticket.userId === session.user.id;
  if (!isStaff && !isOwner) return { error: "forbidden" as const };

  let imageUrl: string | null = null;
  if (image instanceof File && image.size > 0) {
    try {
      imageUrl = await savePublicUpload(image);
    } catch (e) {
      return { error: mapUploadError(e) };
    }
  }

  if (!body && !imageUrl) return { error: "emptyMessage" as const };

  await prisma.ticketComment.create({
    data: {
      ticketId,
      authorId: session.user.id,
      body,
      imageUrl,
    },
  });

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
  });

  revalidateAllLocales("/requests");
  revalidateAllLocales("/requests/archive");
  revalidateAllLocales("/dashboard");
  return { ok: true as const };
}
