"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import { requireCommunityId } from "@/lib/tenant";

export async function createNewsPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CHAIR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!title || !body) return { error: "requiredFields" as const };

  await prisma.newsPost.create({
    data: {
      communityId,
      title,
      body,
      authorId: session.user.id,
    },
  });

  revalidateAllLocales("/dashboard");
  revalidateAllLocales("/chair");
  return { ok: true as const };
}
