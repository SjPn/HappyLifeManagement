"use client";

import {
  HubPulseBanner,
  HubStatTile,
  HubStatsRow,
} from "@/components/hub/hubUi";
import type { ResidentDashboardStats } from "@/lib/hubStats";
import { useTranslations } from "next-intl";

export function ResidentDashboardHub({
  stats,
  showPaymentsPulse,
  balanceUah,
}: {
  stats: ResidentDashboardStats;
  showPaymentsPulse?: boolean;
  balanceUah?: number;
}) {
  const t = useTranslations("dashboard.residentHub");

  const needsAttention =
    stats.openTickets > 0 ||
    stats.unreadMessages > 0 ||
    (balanceUah ?? 0) > 0 ||
    showPaymentsPulse;

  return (
    <div className="mt-4 space-y-4">
      {needsAttention && (
        <HubPulseBanner
          title={t("pulseTitle")}
          message={t("pulseText", {
            tickets: stats.openTickets,
            messages: stats.unreadMessages,
          })}
        />
      )}

      <HubStatsRow>
        <HubStatTile
          href="/messages"
          value={stats.unreadMessages}
          label={t("statMessages")}
          highlight={stats.unreadMessages > 0}
        />
        <HubStatTile
          href="/requests"
          value={stats.openTickets}
          label={t("statTickets")}
          highlight={stats.openTickets > 0}
        />
        <HubStatTile
          href="/votes"
          value={stats.activeVotes}
          label={t("statVotes")}
        />
        <HubStatTile
          href="/community/news"
          value={stats.newsPosts}
          label={t("statNews")}
        />
      </HubStatsRow>
    </div>
  );
}
