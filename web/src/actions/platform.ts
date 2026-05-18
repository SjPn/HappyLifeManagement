"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role, UserStatus } from "@/lib/enums";
import {
  generateInviteCode,
  slugifyCommunityName,
} from "@/lib/tenant";
import { revalidateAllLocales } from "@/lib/revalidateI18n";

async function requirePlatformAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.PLATFORM_ADMIN) {
    return { error: "forbidden" as const };
  }
  return { session };
}

export async function createCommunity(formData: FormData) {
  const gate = await requirePlatformAdmin();
  if ("error" in gate) return gate;

  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const defaultLocale = String(formData.get("defaultLocale") ?? "uk").trim();

  if (!name) return { error: "nameRequired" };

  let slug = slugRaw || slugifyCommunityName(name);
  const inviteCode = generateInviteCode();

  for (let i = 0; i < 5; i++) {
    try {
      await prisma.community.create({
        data: {
          name,
          slug: i === 0 ? slug : `${slug}-${i + 1}`,
          inviteCode,
          approvedAt: new Date(),
          defaultLocale: ["uk", "ru", "en"].includes(defaultLocale)
            ? defaultLocale
            : "uk",
        },
      });
      await revalidateAllLocales("/platform/communities");
      return { ok: true };
    } catch {
      /* slug collision */
    }
  }
  return { error: "slugConflict" };
}

async function verifyCommunityInviteCode(
  communityId: string,
  inviteCode: string,
) {
  const trimmed = inviteCode.trim();
  if (!trimmed) return { error: "inviteConfirmRequired" as const };

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { inviteCode: true },
  });
  if (!community) return { error: "notFound" as const };
  if (community.inviteCode !== trimmed) return { error: "inviteMismatch" as const };
  return { ok: true as const };
}

export async function deleteCommunity(communityId: string, inviteCode: string) {
  const gate = await requirePlatformAdmin();
  if ("error" in gate) return gate;

  const verified = await verifyCommunityInviteCode(communityId, inviteCode);
  if ("error" in verified) return verified;

  await prisma.community.delete({ where: { id: communityId } });
  await revalidateAllLocales("/platform/communities");
  return { ok: true };
}

export async function setCommunityBlocked(
  communityId: string,
  blocked: boolean,
  inviteCode: string,
) {
  const gate = await requirePlatformAdmin();
  if ("error" in gate) return gate;

  const verified = await verifyCommunityInviteCode(communityId, inviteCode);
  if ("error" in verified) return verified;

  await prisma.community.update({
    where: { id: communityId },
    data: { blockedAt: blocked ? new Date() : null },
  });
  await revalidateAllLocales("/platform/communities");
  return { ok: true };
}

export async function approveCommunity(communityId: string) {
  const gate = await requirePlatformAdmin();
  if ("error" in gate) return gate;

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { approvedAt: true },
  });
  if (!community) return { error: "notFound" as const };
  if (community.approvedAt) return { error: "alreadyApproved" as const };

  await prisma.$transaction([
    prisma.community.update({
      where: { id: communityId },
      data: { approvedAt: new Date() },
    }),
    prisma.user.updateMany({
      where: {
        communityId,
        role: Role.CHAIR,
        status: UserStatus.PENDING,
      },
      data: { status: UserStatus.APPROVED },
    }),
  ]);

  await revalidateAllLocales("/platform/communities");
  return { ok: true };
}

export async function registerCommunitySelfServe(formData: FormData) {
  const communityName = String(formData.get("communityName") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const chairName = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const defaultLocale = String(formData.get("defaultLocale") ?? "uk").trim();

  if (!communityName || !chairName || !email || password.length < 6) {
    return { error: "invalidFields" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "emailTaken" };

  const slug = slugRaw || slugifyCommunityName(communityName);
  const inviteCode = generateInviteCode();
  const passwordHash = await import("bcryptjs").then((b) =>
    b.hash(password, 10),
  );

  try {
    const community = await prisma.community.create({
      data: {
        name: communityName,
        slug,
        inviteCode,
        defaultLocale: ["uk", "ru", "en"].includes(defaultLocale)
          ? defaultLocale
          : "uk",
        users: {
          create: {
            email,
            passwordHash,
            name: chairName,
            street: "—",
            houseNumber: "—",
            role: Role.CHAIR,
            status: UserStatus.PENDING,
            memorandumAcceptedAt: new Date(),
            memorandumVersion: "MVP-2026-05-05",
          },
        },
      },
    });
    return {
      ok: true,
      pending: true,
      inviteCode: community.inviteCode,
      slug: community.slug,
    };
  } catch {
    return { error: "slugConflict" };
  }
}
