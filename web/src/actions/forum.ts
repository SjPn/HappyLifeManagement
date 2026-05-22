"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import { mapUploadError } from "@/lib/uploadErrors";
import {
  parseAudienceScope,
  userMatchesAudience,
} from "@/lib/audience";
import { communityWhere, requireCommunityId } from "@/lib/tenant";
import { forumPostImageUrls } from "@/lib/forumPostImages";
import {
  createForumPostImages,
  parseForumImageFiles,
  saveForumImages,
  validateForumImages,
} from "@/lib/forumUpload";

async function attachNewForumImages(
  postId: string,
  formData: FormData,
  existingCount: number,
): Promise<{ error?: string } | { urls: string[] }> {
  const files = parseForumImageFiles(formData);
  const validation = validateForumImages(files, existingCount);
  if (validation) return { error: validation };

  if (files.length === 0) return { urls: [] };

  try {
    const urls = await saveForumImages(files);
    const startOrder = existingCount;
    await createForumPostImages(postId, urls, startOrder);
    return { urls };
  } catch (e) {
    return { error: mapUploadError(e) };
  }
}

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

  if (!title || !body) return { error: "topicRequired" as const };

  const files = parseForumImageFiles(formData);
  const validation = validateForumImages(files, 0);
  if (validation) return { error: validation };

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
  if (firstPost && files.length > 0) {
    const attached = await attachNewForumImages(firstPost.id, formData, 0);
    if ("error" in attached && attached.error) {
      await prisma.forumTopic.delete({ where: { id: topic.id } });
      return { error: attached.error };
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

  const files = parseForumImageFiles(formData);
  const validation = validateForumImages(files, 0);
  if (validation) return { error: validation };

  const post = await prisma.forumPost.create({
    data: {
      communityId,
      topicId,
      body,
      userId: session.user.id,
    },
  });

  if (files.length > 0) {
    const attached = await attachNewForumImages(post.id, formData, 0);
    if ("error" in attached && attached.error) {
      await prisma.forumPost.delete({ where: { id: post.id } });
      return { error: attached.error };
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

  if (!topicId || !title || !body) return { error: "requiredFields" as const };

  const topic = await prisma.forumTopic.findFirst({
    where: { id: topicId, ...communityWhere(communityId) },
    include: {
      posts: {
        orderBy: { createdAt: "asc" },
        take: 1,
        include: { images: { select: { id: true } } },
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

  const files = parseForumImageFiles(formData);
  const validation = validateForumImages(files, existingCount);
  if (validation) return { error: validation };

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

  if (first && files.length > 0) {
    const attached = await attachNewForumImages(first.id, formData, existingCount);
    if ("error" in attached && attached.error) {
      return { error: attached.error };
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
