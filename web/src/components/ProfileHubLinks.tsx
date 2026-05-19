"use client";

import { HubActionCard, HubSection } from "@/components/hub/hubUi";
import { useTranslations } from "next-intl";
import { FileText, ScrollText, User } from "lucide-react";
import { SignOutButton } from "@/components/AppShell";
import { ApkDownloadLink } from "@/components/ApkDownloadLink";
import { PushNotificationsSettings } from "@/components/PushNotificationsSettings";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function ProfileHubLinks({
  showChairLinks,
  role,
  pushPrefs,
}: {
  showChairLinks: boolean;
  role: string;
  pushPrefs: {
    pushNotifyNewTickets: boolean;
    pushNotifyTicketStatus: boolean;
    pushNotifyNews: boolean;
    pushNotifyDebt: boolean;
  };
}) {
  const t = useTranslations("profile");

  return (
    <>
      <HubSection title={t("hubSectionInfo")} className="!mt-2">
        <HubActionCard
          href="/info/memorandum"
          icon={ScrollText}
          title={t("memorandumLink")}
          description={t("memorandumDesc")}
          tone="blue"
        />
        <HubActionCard
          href="/info/tariffs"
          icon={FileText}
          title={t("tariffsLink")}
          description={t("tariffsDesc")}
          tone="emerald"
        />
        {showChairLinks && (
          <HubActionCard
            href="/chair"
            icon={User}
            title={t("chairPanel")}
            description={t("chairPanelDesc")}
            tone="violet"
          />
        )}
      </HubSection>

      <HubSection title={t("hubSectionApp")}>
        <div className="flex flex-col gap-3">
          <PushNotificationsSettings role={role} prefs={pushPrefs} />
          <div className="hl-glass flex flex-col items-center gap-4 rounded-2xl p-4">
            <LanguageSwitcher />
            <ApkDownloadLink />
          </div>
        </div>
      </HubSection>

      <HubSection title={t("hubSectionAccount")}>
        <div className="hl-glass rounded-2xl p-4">
          <SignOutButton />
        </div>
      </HubSection>
    </>
  );
}
