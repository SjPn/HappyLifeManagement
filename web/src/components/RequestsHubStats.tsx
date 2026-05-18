"use client";

import { HubStatTile, HubStatsRow } from "@/components/hub/hubUi";
import type { RequestsHubStats } from "@/lib/hubStats";
import { useTranslations } from "next-intl";

export function RequestsHubStatsBar({ stats }: { stats: RequestsHubStats }) {
  const t = useTranslations("requests.hubStats");

  return (
    <HubStatsRow>
      <HubStatTile
        href="/requests"
        value={stats.newCount}
        label={t("new")}
        highlight={stats.newCount > 0}
      />
      <HubStatTile
        href="/requests"
        value={stats.inProgressCount}
        label={t("inProgress")}
      />
      <HubStatTile
        href="/requests/archive"
        value={stats.archiveCount}
        label={t("archive")}
      />
    </HubStatsRow>
  );
}
