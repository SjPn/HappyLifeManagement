import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";

export type SessionUser = {
  id: string;
  role: string;
  status?: string;
  communityId?: string | null;
};

export function isPlatformAdmin(role: string) {
  return role === Role.PLATFORM_ADMIN;
}

export function requireCommunityId(user: SessionUser): string {
  if (isPlatformAdmin(user.role)) {
    throw new Error("PLATFORM_ADMIN_HAS_NO_COMMUNITY");
  }
  const id = user.communityId;
  if (!id) throw new Error("MISSING_COMMUNITY_ID");
  return id;
}

export function communityWhere(communityId: string) {
  return { communityId };
}

export async function resolveCommunityId(user: SessionUser): Promise<string | null> {
  if (isPlatformAdmin(user.role)) return null;
  if (user.communityId) return user.communityId;
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { communityId: true },
  });
  return dbUser?.communityId ?? null;
}

export async function requireCommunityIdFromSession(
  user: SessionUser,
): Promise<string> {
  const id = await resolveCommunityId(user);
  if (!id) throw new Error("MISSING_COMMUNITY_ID");
  return id;
}

export async function getCommunityForSession(user: SessionUser) {
  const id = await resolveCommunityId(user);
  if (!id) return null;
  return prisma.community.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      defaultLocale: true,
      blockedAt: true,
      approvedAt: true,
      memorandumBody: true,
      memorandumVersion: true,
      tariffsBody: true,
    },
  });
}

export async function assertCommunityActive(communityId: string) {
  const c = await prisma.community.findUnique({
    where: { id: communityId },
    select: { blockedAt: true, approvedAt: true, name: true },
  });
  if (!c) throw new Error("COMMUNITY_NOT_FOUND");
  if (!c.approvedAt) throw new Error("COMMUNITY_NOT_APPROVED");
  if (c.blockedAt) throw new Error("COMMUNITY_BLOCKED");
  return c;
}

export function isCommunityApproved(community: {
  approvedAt: Date | null;
}) {
  return community.approvedAt != null;
}

import { randomUUID } from "crypto";

export function generateInviteCode() {
  return randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
}

export function slugifyCommunityName(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "community";
}
