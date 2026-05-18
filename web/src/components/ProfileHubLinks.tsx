"use client";

import { HubActionCard, HubSection } from "@/components/hub/hubUi";
import { useTranslations } from "next-intl";
import { FileText, ScrollText, User } from "lucide-react";
import { SignOutButton } from "@/components/AppShell";
import { ApkDownloadLink } from "@/components/ApkDownloadLink";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function ProfileHubLinks({
  showChairLinks,
}: {
  showChairLinks: boolean;
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
        <div className="hl-glass flex flex-col items-center gap-4 rounded-2xl p-4">
          <LanguageSwitcher />
          <ApkDownloadLink />
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
