"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import { savePublicUpload } from "@/lib/upload";
import { mapUploadError } from "@/lib/uploadErrors";
import {
  parseAudienceScope,
  userMatchesAudience,
} from "@/lib/audience";
import { communityWhere, requireCommunityId } from "@/lib/tenant";

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
  const img = formData.get("image");
  const audience = parseAudienceScope(String(formData.get("audience") || ""));
  const isAnonymous = formData.get("isAnonymous") === "on";

  if (!title || !body) return { error: "topicRequired" as const };

  let imageUrl: string | null = null;
  if (img instanceof File && img.size > 0) {
    try {
      imageUrl = await savePublicUpload(img);
    } catch (e) {
      return { error: mapUploadError(e) };
    }
  }

  await prisma.forumTopic.create({
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
  if (session.user.role === "MODERATOR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);

  const topicId = String(formData.get("topicId") || "");
  const body = String(formData.get("body") || "").trim();
  const img = formData.get("image");

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

  let imageUrl: string | null = null;
  if (img instanceof File && img.size > 0) {
    try {
      imageUrl = await savePublicUpload(img);
    } catch (e) {
      return { error: mapUploadError(e) };
    }
  }

  await prisma.forumPost.create({
    data: {
      communityId,
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

export async function updateForumTopic(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return { error: "noAccess" as const };
  }

  const communityId = requireCommunityId(session.user);

  const topicId = String(formData.get("topicId") || "");
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const img = formData.get("image");
  const audience = parseAudienceScope(String(formData.get("audience") || ""));

  if (!topicId || !title || !body) return { error: "requiredFields" as const };

  const topic = await prisma.forumTopic.findFirst({
    where: { id: topicId, ...communityWhere(communityId) },
    include: { posts: { orderBy: { createdAt: "asc" }, take: 1 } },
  });
  if (!topic) return { error: "noTopic" as const };

  const canEdit =
    topic.userId === session.user.id ||
    session.user.role === "CHAIR" ||
    session.user.role === "MODERATOR";
  if (!canEdit) return { error: "forbidden" as const };

  let imageUrl: string | null | undefined = undefined;
  if (img instanceof File && img.size > 0) {
    try {
      imageUrl = await savePublicUpload(img);
    } catch (e) {
      return { error: mapUploadError(e) };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.forumTopic.update({
      where: { id: topicId },
      data: { title, audience },
    });
    const first = topic.posts[0];
    if (first) {
      await tx.forumPost.update({
        where: { id: first.id },
        data: {
          body,
          ...(imageUrl !== undefined ? { imageUrl } : {}),
        },
      });
    }
  });

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
