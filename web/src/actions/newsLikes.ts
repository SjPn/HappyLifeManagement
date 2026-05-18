"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import { communityWhere, requireCommunityId } from "@/lib/tenant";

export async function toggleNewsLike(newsPostId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return { error: "noAccess" as const };
  }
  if (session.user.role === "MODERATOR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);

  const post = await prisma.newsPost.findFirst({
    where: { id: newsPostId, ...communityWhere(communityId) },
    select: { id: true },
  });
  if (!post) return { error: "generic" as const };

  const existing = await prisma.newsPostLike.findUnique({
    where: {
      userId_newsPostId: { userId: session.user.id, newsPostId },
    },
  });

  if (existing) {
    await prisma.newsPostLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.newsPostLike.create({
      data: { newsPostId, userId: session.user.id },
    });
  }

  const likeCount = await prisma.newsPostLike.count({
    where: { newsPostId },
  });

  revalidateAllLocales("/dashboard");
  revalidateAllLocales("/community/news");

  return {
    ok: true as const,
    liked: !existing,
    likeCount,
  };
}
