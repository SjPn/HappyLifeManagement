import { prisma } from "@/lib/prisma";
import {
  PlatformCommunitiesPanel,
  type CommunityRow,
} from "@/components/PlatformCommunitiesPanel";
import { getTranslations } from "next-intl/server";

export default async function PlatformCommunitiesPage() {
  const t = await getTranslations("platform");

  const rows = await prisma.community.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: true } } },
  });

  const communities: CommunityRow[] = rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    inviteCode: c.inviteCode,
    defaultLocale: c.defaultLocale,
    blockedAt: c.blockedAt?.toISOString() ?? null,
    approvedAt: c.approvedAt?.toISOString() ?? null,
    userCount: c._count.users,
  }));

  return (
    <>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        {t("subtitle")}
      </p>
      <PlatformCommunitiesPanel communities={communities} />
    </>
  );
}
