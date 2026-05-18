"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BoardCategory } from "@/lib/enums";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import { savePublicUpload } from "@/lib/upload";
import { communityWhere, requireCommunityId } from "@/lib/tenant";

const allowed = new Set<string>(Object.values(BoardCategory));

export async function createBoardPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return { error: "noAccess" as const };
  }
  if (session.user.role === "MODERATOR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);

  const categoryRaw = String(formData.get("category") || "");
  const category: string = allowed.has(categoryRaw)
    ? categoryRaw
    : "SELL_GIVE";
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const imageField = formData.get("image");

  if (!title || !body) return { error: "requiredFields" as const };

  let imageUrl: string | null = null;
  if (imageField instanceof File && imageField.size > 0) {
    try {
      imageUrl = await savePublicUpload(imageField);
    } catch {
      return { error: "badFile" as const };
    }
  }

  await prisma.boardPost.create({
    data: {
      communityId,
      category,
      title,
      body,
      imageUrl,
      userId: session.user.id,
    },
  });

  revalidateAllLocales("/community/board");
  revalidateAllLocales("/community");
  return { ok: true as const };
}

export async function updateBoardPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return { error: "noAccess" as const };
  }

  const communityId = requireCommunityId(session.user);

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const categoryRaw = String(formData.get("category") || "");
  const category: string = allowed.has(categoryRaw) ? categoryRaw : "SELL_GIVE";
  const imageField = formData.get("image");

  if (!id || !title || !body) return { error: "requiredFields" as const };

  const existing = await prisma.boardPost.findFirst({
    where: { id, ...communityWhere(communityId) },
  });
  if (!existing) return { error: "generic" as const };

  const canEdit =
    existing.userId === session.user.id ||
    session.user.role === "CHAIR" ||
    session.user.role === "MODERATOR";
  if (!canEdit) return { error: "forbidden" as const };

  let imageUrl: string | null | undefined = undefined;
  if (imageField instanceof File && imageField.size > 0) {
    try {
      imageUrl = await savePublicUpload(imageField);
    } catch {
      return { error: "badFile" as const };
    }
  }

  await prisma.boardPost.update({
    where: { id },
    data: {
      category,
      title,
      body,
      ...(imageUrl !== undefined ? { imageUrl } : {}),
    },
  });

  revalidateAllLocales("/community/board");
  revalidateAllLocales("/community");
  return { ok: true as const };
}

export async function deleteBoardPost(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "noAccess" as const };
  if (session.user.role !== "MODERATOR" && session.user.role !== "CHAIR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);

  const existing = await prisma.boardPost.findFirst({
    where: { id, ...communityWhere(communityId) },
  });
  if (!existing) return { error: "generic" as const };

  await prisma.boardPost.delete({ where: { id } });
  revalidateAllLocales("/community/board");
  revalidateAllLocales("/community");
  revalidateAllLocales("/chair");
  return { ok: true as const };
}
