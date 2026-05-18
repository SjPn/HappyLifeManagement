import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card, FormSection } from "@/components/Ui";
import { ProfileHubLinks } from "@/components/ProfileHubLinks";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { ProfileCredentialsForm } from "@/components/ProfileCredentialsForm";
import { ChairInviteCodeForm } from "@/components/ChairInviteCodeForm";
import { getTranslations } from "next-intl/server";
import { Role } from "@/lib/enums";
import { listCommunityAddresses } from "@/lib/communityAddresses";
import { requireCommunityId } from "@/lib/tenant";

export default async function ProfilePage() {
  const session = await auth();
  const communityId = requireCommunityId(session!.user!);
  const t = await getTranslations("profile");
  const tCred = await getTranslations("credentials");
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
        <FormSection title={t("inviteSection")}>
          <Card>
            <ChairInviteCodeForm currentCode={community.inviteCode} />
          </Card>
        </FormSection>
      )}

      {user && (
        <FormSection title={tCred("accountTitle")}>
          <Card>
            <ProfileCredentialsForm currentEmail={user.email} />
          </Card>
        </FormSection>
      )}

      {user && (
        <FormSection title={t("editProfile")}>
          <Card>
          <ProfileEditForm
            name={user.name}
            communityAddressId={user.communityAddressId}
            phone={user.phone ?? null}
            tenancyType={user.tenancyType ?? "OWNER"}
            addresses={addresses}
          />
          </Card>
        </FormSection>
      )}

      <ProfileHubLinks showChairLinks={isChair} />
    </>
  );
}
