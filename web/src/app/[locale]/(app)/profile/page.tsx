import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card, FormSection } from "@/components/Ui";
import { ProfileIdentityCard } from "@/components/ProfileIdentityCard";
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

      {user && (
        <ProfileIdentityCard
          name={user.name}
          email={user.email}
          address={`${user.street} ${user.houseNumber}`}
          roleLabel={`${t("role")} ${tr(user.role as "RESIDENT" | "MODERATOR" | "CHAIR")}`}
          tenancyLabel={`${t("tenancyTitle")}: ${tt(user.tenancyType as "OWNER" | "TENANT")}`}
        />
      )}

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
