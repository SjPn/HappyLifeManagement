import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card } from "@/components/Ui";
import { SignOutButton } from "@/components/AppShell";
import { ApkDownloadLink } from "@/components/ApkDownloadLink";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { ChairInviteCodeForm } from "@/components/ChairInviteCodeForm";
import { getTranslations } from "next-intl/server";
import { Role } from "@/lib/enums";
import { listCommunityAddresses } from "@/lib/communityAddresses";
import { requireCommunityId } from "@/lib/tenant";

export default async function ProfilePage() {
  const session = await auth();
  const communityId = requireCommunityId(session!.user!);
  const t = await getTranslations("profile");
  const tr = await getTranslations("categories.roles");
  const tt = await getTranslations("categories.tenancy");

  const [user, addresses, community] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session!.user!.id },
    }),
    listCommunityAddresses(communityId),
    prisma.community.findUnique({
      where: { id: communityId },
      select: { inviteCode: true, approvedAt: true },
    }),
  ]);

  const isChair = session!.user!.role === Role.CHAIR;

  return (
    <>
      <PageTitle title={t("title")} subtitle={t("subtitle")} />

      <Card className="mb-6">
        <p className="text-sm font-medium">{user?.name}</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {user?.email}
        </p>
        <p className="mt-3 text-sm">
          {user?.street} {user?.houseNumber}
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          {t("role")}{" "}
          {user?.role ? tr(user.role as "RESIDENT" | "MODERATOR" | "CHAIR") : "—"}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {t("tenancyTitle")}:{" "}
          {user?.tenancyType
            ? tt(user.tenancyType as "OWNER" | "TENANT")
            : "—"}
        </p>
      </Card>

      {isChair && community?.approvedAt && (
        <Card className="mb-6">
          <p className="mb-3 text-sm font-semibold">{t("inviteSection")}</p>
          <ChairInviteCodeForm currentCode={community.inviteCode} />
        </Card>
      )}

      {user && (
        <Card className="mb-6">
          <p className="mb-3 text-sm font-semibold">{t("editProfile")}</p>
          <ProfileEditForm
            name={user.name}
            communityAddressId={user.communityAddressId}
            phone={user.phone ?? null}
            tenancyType={user.tenancyType ?? "OWNER"}
            addresses={addresses}
          />
        </Card>
      )}

      <div className="mb-6 flex justify-center">
        <LanguageSwitcher />
      </div>

      <nav className="flex flex-col gap-2">
        <Link
          href="/info/memorandum"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          {t("memorandumLink")}
        </Link>
      </nav>

      <div className="mt-10 flex flex-col items-center gap-3">
        <ApkDownloadLink />
        <SignOutButton />
      </div>
    </>
  );
}
