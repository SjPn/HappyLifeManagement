"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import { savePublicUpload } from "@/lib/upload";
import { mapUploadError } from "@/lib/uploadErrors";
import { communityWhere, requireCommunityId } from "@/lib/tenant";

export async function uploadCommunityDocument(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "CHAIR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);
  const title = String(formData.get("title") || "").trim();
  const file = formData.get("file");

  if (!title) return { error: "noTitle" as const };
  if (!(file instanceof File) || file.size === 0) {
    return { error: "noFile" as const };
  }

  let fileUrl: string | null;
  try {
    fileUrl = await savePublicUpload(file);
  } catch (e) {
    return { error: mapUploadError(e) };
  }
  if (!fileUrl) return { error: "noFile" as const };

  await prisma.communityDocument.create({
    data: {
      communityId,
      title,
      fileUrl,
      authorId: session.user.id,
    },
  });

  revalidateAllLocales("/community/documents");
  return { ok: true as const };
}

export async function deleteCommunityDocument(documentId: string) {
  const session = await auth();
  if (session?.user?.role !== "CHAIR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);
  const doc = await prisma.communityDocument.findFirst({
    where: { id: documentId, ...communityWhere(communityId) },
  });
  if (!doc) return { error: "generic" as const };

  await prisma.communityDocument.delete({ where: { id: documentId } });
  revalidateAllLocales("/community/documents");
  return { ok: true as const };
}
