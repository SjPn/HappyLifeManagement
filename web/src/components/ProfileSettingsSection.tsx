"use client";

import { useState } from "react";
import { KeyRound, UserPen } from "lucide-react";
import { useTranslations } from "next-intl";
import { HubActionCard, HubSection } from "@/components/hub/hubUi";
import { ModalShell } from "@/components/ModalShell";
import { ProfileCredentialsForm } from "@/components/ProfileCredentialsForm";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import type { AddressOption } from "@/lib/communityAddresses";

export function ProfileSettingsSection({
  email,
  name,
  communityAddressId,
  phone,
  tenancyType,
  addresses,
}: {
  email: string;
  name: string;
  communityAddressId: string | null;
  phone: string | null;
  tenancyType: string;
  addresses: AddressOption[];
}) {
  const t = useTranslations("profile");
  const tCred = useTranslations("credentials");
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <HubSection title={t("hubSectionSettings")} className="!mt-6">
        <HubActionCard
          icon={KeyRound}
          title={t("changeCredentials")}
          description={t("changeCredentialsDesc")}
          tone="slate"
          onClick={() => setCredentialsOpen(true)}
        />
        <HubActionCard
          icon={UserPen}
          title={t("editProfile")}
          description={t("editProfileDesc")}
          tone="blue"
          onClick={() => setEditOpen(true)}
        />
      </HubSection>

      {credentialsOpen && (
        <ModalShell
          title={tCred("accountTitle")}
          closeLabel={t("closeModal")}
          onClose={() => setCredentialsOpen(false)}
        >
          <ProfileCredentialsForm currentEmail={email} />
        </ModalShell>
      )}

      {editOpen && (
        <ModalShell
          title={t("editProfile")}
          closeLabel={t("closeModal")}
          onClose={() => setEditOpen(false)}
        >
          <ProfileEditForm
            name={name}
            communityAddressId={communityAddressId}
            phone={phone}
            tenancyType={tenancyType}
            addresses={addresses}
            onSaved={() => setEditOpen(false)}
          />
        </ModalShell>
      )}
    </>
  );
}
