import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, Card, FormSection } from "@/components/Ui";
import { ProfileIdentityCard } from "@/components/ProfileIdentityCard";
import { ProfileHubLinks } from "@/components/ProfileHubLinks";
import { ProfileSettingsSection } from "@/components/ProfileSettingsSection";
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
  const isModerator = session!.user!.role === Role.MODERATOR;

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
        <ProfileSettingsSection
          email={user.email}
          name={user.name}
          communityAddressId={user.communityAddressId}
          phone={user.phone ?? null}
          tenancyType={user.tenancyType ?? "OWNER"}
          addresses={addresses}
        />
      )}

      <ProfileHubLinks
        showChairLinks={isChair || isModerator}
        role={session!.user!.role}
        pushPrefs={{
          pushNotifyNewTickets: user?.pushNotifyNewTickets ?? true,
          pushNotifyTicketStatus: user?.pushNotifyTicketStatus ?? true,
          pushNotifyNews: user?.pushNotifyNews ?? false,
          pushNotifyDebt: user?.pushNotifyDebt ?? true,
        }}
      />
    </>
  );
}
