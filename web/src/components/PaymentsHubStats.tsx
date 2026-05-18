"use client";

import { HubStatTile, HubStatsRow } from "@/components/hub/hubUi";
import type { PaymentsHubStats } from "@/lib/hubStats";
import { useTranslations } from "next-intl";

export function PaymentsHubStatsBar({ stats }: { stats: PaymentsHubStats }) {
  const t = useTranslations("payments.hubStats");

  return (
    <HubStatsRow>
      <HubStatTile href="/payments" value={stats.households} label={t("households")} />
      <HubStatTile
        href="/payments"
        value={stats.paidCount}
        label={t("paid")}
      />
      <HubStatTile
        href="/payments"
        value={stats.unpaidCount}
        label={t("unpaid")}
        highlight={stats.unpaidCount > 0}
      />
    </HubStatsRow>
  );
}
