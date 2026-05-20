import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PageTitle } from "@/components/Ui";
import {
  ChairUsersPanel,
  type ChairUserRow,
} from "@/components/ChairUsersPanel";
import { getLocale, getTranslations } from "next-intl/server";
import { listCommunityAddresses } from "@/lib/communityAddresses";
import { communityWhere, requireCommunityId } from "@/lib/tenant";

export default async function ChairUsersPage() {
  const session = await auth();
  const communityId = requireCommunityId(session!.user!);
  const locale = await getLocale();
  if (session!.user!.role !== "CHAIR" && session!.user!.role !== "MODERATOR") {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations("chair");

  const [users, addresses] = await Promise.all([
    prisma.user.findMany({
      where: communityWhere(communityId),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        street: true,
        houseNumber: true,
        role: true,
        status: true,
        tenancyType: true,
        balanceUah: true,
        communityAddressId: true,
        phone: true,
      },
    }),
    listCommunityAddresses(communityId),
  ]);

  const isChair = session!.user!.role === "CHAIR";
  const canManage = isChair || session!.user!.role === "MODERATOR";
  const rows: ChairUserRow[] = users;

  return (
    <>
      <PageTitle
        title={t("usersTitle")}
        subtitle={t("usersSubtitle")}
        backHref="/chair"
        backLabel={t("backPanel")}
      />
      {isChair && (
        <p className="mb-4 text-sm">
          <Link href="/payments" className="font-semibold text-blue-700 hover:underline">
            {t("paymentsManageLink")}
          </Link>
        </p>
      )}
      <ChairUsersPanel
        users={rows}
        addresses={addresses}
        isChair={isChair}
        canManage={canManage}
      />
    </>
  );
}
