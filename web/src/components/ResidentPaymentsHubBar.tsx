"use client";

import { HubStatTile, HubStatsRow } from "@/components/hub/hubUi";
import { useTranslations } from "next-intl";

export function ResidentPaymentsHubBar({
  subscriptionLabel,
  electricityLabel,
  totalLabel,
  highlightTotal,
}: {
  subscriptionLabel: string;
  electricityLabel: string;
  totalLabel: string;
  highlightTotal?: boolean;
}) {
  const t = useTranslations("payments.residentHub");

  return (
    <HubStatsRow>
      <HubStatTile
        value={0}
        displayValue={subscriptionLabel}
        label={t("subscription")}
      />
      <HubStatTile
        value={0}
        displayValue={electricityLabel}
        label={t("electricity")}
      />
      <HubStatTile
        value={0}
        displayValue={totalLabel}
        label={t("total")}
        highlight={highlightTotal}
      />
    </HubStatsRow>
  );
}
