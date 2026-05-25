"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import {
  parseAudienceScope,
  userMatchesAudience,
} from "@/lib/audience";
import { communityWhere, requireCommunityId } from "@/lib/tenant";
import { forumPostImageUrls } from "@/lib/forumPostImages";
import {
  parseUploadedImageUrls,
  validateImageUrlCount,
} from "@/lib/forumImageUrls";
import { createForumPostImages } from "@/lib/forumUpload";
import { EntitySeenType, markEntitySeen } from "@/lib/entitySeen";

export async function createForumTopic(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return { error: "noAccess" as const };
  }
  if (session.user.role === "MODERATOR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const audience = parseAudienceScope(String(formData.get("audience") || ""));
  const isAnonymous = formData.get("isAnonymous") === "on";
  const imageUrls = parseUploadedImageUrls(formData);

  if (!title || !body) return { error: "topicRequired" as const };

  const countErr = validateImageUrlCount(imageUrls.length, 0);
  if (countErr) return { error: countErr };

  const topic = await prisma.forumTopic.create({
    data: {
      communityId,
      title,
      audience,
      isAnonymous,
      userId: session.user.id,
      posts: {
        create: {
          communityId,
          body,
          userId: session.user.id,
        },
      },
    },
    include: {
      posts: { orderBy: { createdAt: "asc" }, take: 1 },
    },
  });

  const firstPost = topic.posts[0];
  if (firstPost) {
    await markEntitySeen(
      session.user.id,
      EntitySeenType.forumTopic,
      topic.id,
    );
    if (imageUrls.length > 0) {
      try {
        await createForumPostImages(firstPost.id, imageUrls, 0);
      } catch {
        await prisma.forumTopic.delete({ where: { id: topic.id } });
        return { error: "generic" as const };
      }
    }
  }

  revalidateAllLocales("/community/forum");
  revalidateAllLocales("/community");
  return { ok: true as const };
}

export async function createForumReply(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return { error: "noAccess" as const };
  }
  if (session.user.role === "MODERATOR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);

  const topicId = String(formData.get("topicId") || "");
  const body = String(formData.get("body") || "").trim();
  const imageUrls = parseUploadedImageUrls(formData);

  if (!topicId || !body) return { error: "emptyMessage" as const };

  const topic = await prisma.forumTopic.findFirst({
    where: { id: topicId, ...communityWhere(communityId) },
  });
  if (!topic) return { error: "noTopic" as const };

  if (
    !userMatchesAudience(
      session.user.role,
      session.user.tenancyType,
      topic.audience,
    )
  ) {
    return { error: "audienceDenied" as const };
  }

  const countErr = validateImageUrlCount(imageUrls.length, 0);
  if (countErr) return { error: countErr };

  const post = await prisma.forumPost.create({
    data: {
      communityId,
      topicId,
      body,
      userId: session.user.id,
    },
  });

  if (imageUrls.length > 0) {
    try {
      await createForumPostImages(post.id, imageUrls, 0);
    } catch {
      await prisma.forumPost.delete({ where: { id: post.id } });
      return { error: "generic" as const };
    }
  }

  revalidateAllLocales(`/community/forum/${topicId}`);
  revalidateAllLocales("/community/forum");
  return { ok: true as const };
}

export async function updateForumTopic(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return { error: "noAccess" as const };
  }

  const communityId = requireCommunityId(session.user);

  const topicId = String(formData.get("topicId") || "");
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const audience = parseAudienceScope(String(formData.get("audience") || ""));
  const imageUrls = parseUploadedImageUrls(formData);

  if (!topicId || !title || !body) return { error: "requiredFields" as const };

  const topic = await prisma.forumTopic.findFirst({
    where: { id: topicId, ...communityWhere(communityId) },
    include: {
      posts: {
        orderBy: { createdAt: "asc" },
        take: 1,
        include: {
          images: { orderBy: { sortOrder: "asc" }, select: { imageUrl: true, sortOrder: true } },
        },
      },
    },
  });
  if (!topic) return { error: "noTopic" as const };

  const canEdit =
    topic.userId === session.user.id ||
    session.user.role === "CHAIR" ||
    session.user.role === "MODERATOR";
  if (!canEdit) return { error: "forbidden" as const };

  const first = topic.posts[0];
  const existingCount = first ? forumPostImageUrls(first).length : 0;

  const countErr = validateImageUrlCount(imageUrls.length, existingCount);
  if (countErr) return { error: countErr };

  await prisma.$transaction(async (tx) => {
    await tx.forumTopic.update({
      where: { id: topicId },
      data: { title, audience },
    });
    if (first) {
      await tx.forumPost.update({
        where: { id: first.id },
        data: { body },
      });
    }
  });

  if (first && imageUrls.length > 0) {
    try {
      await createForumPostImages(first.id, imageUrls, existingCount);
    } catch {
      return { error: "generic" as const };
    }
  }

  revalidateAllLocales(`/community/forum/${topicId}`);
  revalidateAllLocales("/community/forum");
  return { ok: true as const };
}

export async function deleteForumTopic(topicId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "noAccess" as const };
  if (session.user.role !== "MODERATOR" && session.user.role !== "CHAIR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);

  const topic = await prisma.forumTopic.findFirst({
    where: { id: topicId, ...communityWhere(communityId) },
  });
  if (!topic) return { error: "generic" as const };

  await prisma.forumTopic.delete({ where: { id: topicId } });
  revalidateAllLocales("/community/forum");
  revalidateAllLocales("/community");
  revalidateAllLocales("/chair");
  return { ok: true as const };
}
