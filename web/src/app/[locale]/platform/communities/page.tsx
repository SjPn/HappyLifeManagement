import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";
import {
  PlatformCommunitiesPanel,
  type CommunityRow,
} from "@/components/PlatformCommunitiesPanel";
import { getTranslations } from "next-intl/server";

export default async function PlatformCommunitiesPage() {
  const t = await getTranslations("platform");

  const rows = await prisma.community.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { users: true } },
      users: {
        where: { role: Role.CHAIR },
        select: { id: true, name: true, email: true, status: true },
        orderBy: { createdAt: "asc" },
      },
    },
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
    chairs: c.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      status: u.status,
    })),
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
