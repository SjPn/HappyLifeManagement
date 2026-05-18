import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCommunityForSession } from "@/lib/tenant";

export async function getCommunityContentForViewer() {
  const session = await auth();
  if (!session?.user) return null;
  return getCommunityForSession(session.user);
}

export async function getCommunityContentById(communityId: string) {
  return prisma.community.findUnique({
    where: { id: communityId },
    select: {
      memorandumBody: true,
      memorandumVersion: true,
      tariffsBody: true,
    },
  });
}
