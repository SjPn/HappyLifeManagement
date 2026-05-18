"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";
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

export async function deleteCommunity(communityId: string, confirm: string) {
  const gate = await requirePlatformAdmin();
  if ("error" in gate) return gate;
  if (confirm !== "yes") return { error: "confirmRequired" };

  await prisma.community.delete({ where: { id: communityId } });
  await revalidateAllLocales("/platform/communities");
  return { ok: true };
}

export async function setCommunityBlocked(
  communityId: string,
  blocked: boolean,
  confirm: string,
) {
  const gate = await requirePlatformAdmin();
  if ("error" in gate) return gate;
  if (confirm !== "yes") return { error: "confirmRequired" };

  await prisma.community.update({
    where: { id: communityId },
    data: { blockedAt: blocked ? new Date() : null },
  });
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
            status: "APPROVED",
            memorandumAcceptedAt: new Date(),
            memorandumVersion: "MVP-2026-05-05",
          },
        },
      },
    });
    return { ok: true, inviteCode: community.inviteCode, slug: community.slug };
  } catch {
    return { error: "slugConflict" };
  }
}
