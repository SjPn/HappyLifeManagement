"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import { requireCommunityId } from "@/lib/tenant";
import { savePublicUpload } from "@/lib/upload";
import { mapUploadError } from "@/lib/uploadErrors";

export async function createNewsPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CHAIR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const image = formData.get("image");

  if (!title || !body) return { error: "requiredFields" as const };

  let imageUrl: string | null = null;
  if (image instanceof File && image.size > 0) {
    try {
      imageUrl = await savePublicUpload(image);
    } catch (e) {
      return { error: mapUploadError(e) };
    }
  }

  await prisma.newsPost.create({
    data: {
      communityId,
      title,
      body,
      imageUrl,
      authorId: session.user.id,
    },
  });

  revalidateAllLocales("/dashboard");
  revalidateAllLocales("/chair");
  revalidateAllLocales("/community/news");
  revalidateAllLocales("/community");
  return { ok: true as const };
}
