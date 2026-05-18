"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateAllLocales } from "@/lib/revalidateI18n";
import {
  parseAudienceScope,
  userMatchesAudience,
} from "@/lib/audience";
import { communityWhere, requireCommunityId } from "@/lib/tenant";

export async function submitVote(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return { error: "noAccess" as const };
  }
  // MODERATOR is a service role: can moderate, but does not participate as a resident
  if (session.user.role === "MODERATOR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);

  const voteId = String(formData.get("voteId") || "");
  const optionId = String(formData.get("optionId") || "");
  if (!voteId || !optionId) return { error: "votePick" as const };

  const vote = await prisma.vote.findFirst({
    where: { id: voteId, ...communityWhere(communityId) },
    include: { options: true, responses: true },
  });
  if (!vote) return { error: "generic" as const };

  if (vote.endsAt && vote.endsAt < new Date()) {
    return { error: "voteClosed" as const };
  }

  const opt = vote.options.find((o) => o.id === optionId);
  if (!opt) return { error: "generic" as const };

  if (
    !userMatchesAudience(
      session.user.role,
      session.user.tenancyType,
      vote.audience,
    )
  ) {
    return { error: "audienceDenied" as const };
  }

  await prisma.voteResponse.upsert({
    where: {
      userId_voteId: { userId: session.user.id, voteId },
    },
    create: {
      userId: session.user.id,
      voteId,
      optionId,
    },
    update: { optionId },
  });

  revalidateAllLocales("/votes");
  revalidateAllLocales(`/votes/${voteId}`);
  revalidateAllLocales("/dashboard");
  return { ok: true as const };
}

export async function createVote(formData: FormData) {
  const session = await auth();
  if (
    !session?.user?.id ||
    session.user.role !== "CHAIR"
  ) {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);

  const title = String(formData.get("title") || "").trim();
  const description =
    String(formData.get("description") || "").trim() || null;
  const type = String(formData.get("type") || "YES_NO");
  const days = Number(formData.get("days") || 7);
  const optA = String(formData.get("optA") || "").trim();
  const optB = String(formData.get("optB") || "").trim();
  const audience = parseAudienceScope(String(formData.get("audience") || ""));

  if (!title) return { error: "titleRequired" as const };

  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + (Number.isFinite(days) ? days : 7));

  if (type === "YES_NO" || !type) {
    await prisma.vote.create({
      data: {
        communityId,
        title,
        description,
        type: "YES_NO",
        audience,
        endsAt,
        options: {
          create: [
            { text: optA || "Так", sortOrder: 0 },
            { text: optB || "Ні", sortOrder: 1 },
          ],
        },
      },
    });
  } else {
    return { error: "voteTypeMvp" as const };
  }

  revalidateAllLocales("/votes");
  revalidateAllLocales("/dashboard");
  revalidateAllLocales("/chair");
  return { ok: true as const };
}

export async function deleteVote(voteId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "noAccess" as const };
  if (session.user.role !== "MODERATOR" && session.user.role !== "CHAIR") {
    return { error: "forbidden" as const };
  }

  const communityId = requireCommunityId(session.user);

  const vote = await prisma.vote.findFirst({
    where: { id: voteId, ...communityWhere(communityId) },
  });
  if (!vote) return { error: "generic" as const };

  await prisma.vote.delete({ where: { id: voteId } });
  revalidateAllLocales("/votes");
  revalidateAllLocales("/dashboard");
  revalidateAllLocales("/chair");
  return { ok: true as const };
}
