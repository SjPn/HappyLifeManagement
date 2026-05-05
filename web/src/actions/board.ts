"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BoardCategory } from "@/lib/enums";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import { savePublicUpload } from "@/lib/upload";

const allowed = new Set<string>(Object.values(BoardCategory));

export async function createBoardPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return { error: "noAccess" as const };
  }
  if (session.user.role === "MODERATOR") {
    return { error: "forbidden" as const };
  }

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
