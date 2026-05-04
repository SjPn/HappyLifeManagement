"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import { savePublicUpload } from "@/lib/upload";

export async function createForumTopic(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return { error: "noAccess" as const };
  }

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const img = formData.get("image");

  if (!title || !body) return { error: "topicRequired" as const };

  let imageUrl: string | null = null;
  if (img instanceof File && img.size > 0) {
    try {
      imageUrl = await savePublicUpload(img);
    } catch {
      return { error: "badFile" as const };
    }
  }

  await prisma.forumTopic.create({
    data: {
      title,
      userId: session.user.id,
      posts: {
        create: {
          body,
          imageUrl,
          userId: session.user.id,
        },
      },
    },
  });

  revalidateAllLocales("/community/forum");
  revalidateAllLocales("/community");
  return { ok: true as const };
}

export async function createForumReply(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return { error: "noAccess" as const };
  }

  const topicId = String(formData.get("topicId") || "");
  const body = String(formData.get("body") || "").trim();
  const img = formData.get("image");

  if (!topicId || !body) return { error: "emptyMessage" as const };

  const topic = await prisma.forumTopic.findUnique({ where: { id: topicId } });
  if (!topic) return { error: "noTopic" as const };

  let imageUrl: string | null = null;
  if (img instanceof File && img.size > 0) {
    try {
      imageUrl = await savePublicUpload(img);
    } catch {
      return { error: "badFile" as const };
    }
  }

  await prisma.forumPost.create({
    data: {
      topicId,
      body,
      imageUrl,
      userId: session.user.id,
    },
  });

  revalidateAllLocales(`/community/forum/${topicId}`);
  revalidateAllLocales("/community/forum");
  return { ok: true as const };
}
