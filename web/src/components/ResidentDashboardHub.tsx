"use client";

import { useNotifications } from "@/components/NotificationProvider";
import {
  HubActionCard,
  HubPulseBanner,
  HubSection,
  HubStatTile,
  HubStatsRow,
} from "@/components/hub/hubUi";
import type { ResidentDashboardStats } from "@/lib/hubStats";
import { useTranslations } from "next-intl";
import {
  ClipboardList,
  CreditCard,
  MessageCircle,
  Newspaper,
  Users,
  Vote,
} from "lucide-react";

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
  const { counts } = useNotifications();

  const needsAttention =
    stats.openTickets > 0 ||
    stats.unreadMessages > 0 ||
    (balanceUah ?? 0) > 0 ||
    showPaymentsPulse;

  return (
    <div className="mt-4">
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

      <HubSection title={t("sectionQuick")}>
        <HubActionCard
          href="/requests/new"
          icon={ClipboardList}
          title={t("actionNewTicket")}
          description={t("actionNewTicketDesc")}
          badge={counts.tickets}
          tone="blue"
        />
        <HubActionCard
          href="/payments"
          icon={CreditCard}
          title={t("actionPayments")}
          description={t("actionPaymentsDesc")}
          badge={counts.payments}
          tone="emerald"
        />
        <HubActionCard
          href="/community"
          icon={Users}
          title={t("actionCommunity")}
          description={t("actionCommunityDesc")}
          tone="violet"
        />
        <HubActionCard
          href="/messages"
          icon={MessageCircle}
          title={t("actionMessages")}
          description={t("actionMessagesDesc")}
          badge={counts.messages}
          tone="cyan"
        />
      </HubSection>

      <HubSection title={t("sectionMore")}>
        <HubActionCard
          href="/votes"
          icon={Vote}
          title={t("actionVotes")}
          description={t("actionVotesDesc")}
          badge={counts.votes}
          tone="violet"
        />
        <HubActionCard
          href="/community/news"
          icon={Newspaper}
          title={t("actionNews")}
          description={t("actionNewsDesc")}
          badge={counts.news}
          tone="blue"
        />
      </HubSection>
    </div>
  );
}
