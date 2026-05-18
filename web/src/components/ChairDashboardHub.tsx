"use client";

import { useNotifications } from "@/components/NotificationProvider";
import {
  HubActionCard,
  HubPulseBanner,
  HubSection,
  HubStatTile,
  HubStatsRow,
} from "@/components/hub/hubUi";
import type { ChairDashboardStats } from "@/lib/chairDashboard";
import { useTranslations } from "next-intl";
import {
  CreditCard,
  FileText,
  Heart,
  Home,
  MapPin,
  Newspaper,
  ScrollText,
  Shield,
  Users,
  Vote,
} from "lucide-react";

export function ChairDashboardHub({
  stats,
  isChair,
  paymentsLabel,
}: {
  stats: ChairDashboardStats;
  isChair: boolean;
  paymentsLabel?: string;
}) {
  const t = useTranslations("dashboard.chairHub");
  const tChair = useTranslations("chair");
  const { counts } = useNotifications();

  const needsAttention = stats.pendingResidents > 0 || stats.openTickets > 0;

  return (
    <div className="mt-4">
      {needsAttention && (
        <HubPulseBanner
          title={t("pulseTitle")}
          message={t("pulseText", {
            pending: stats.pendingResidents,
            tickets: stats.openTickets,
          })}
        />
      )}

      <HubStatsRow>
        <HubStatTile
          href="/chair/users"
          value={stats.pendingResidents}
          label={t("statPending")}
          highlight={stats.pendingResidents > 0}
        />
        <HubStatTile
          href="/votes"
          value={stats.activeVotes}
          label={t("statVotes")}
        />
        <HubStatTile
          href="/requests"
          value={stats.openTickets}
          label={t("statTickets")}
          highlight={stats.openTickets > 0}
        />
        <HubStatTile
          href="/community/news"
          value={stats.newsLikesWeek}
          label={t("statLikes")}
        />
      </HubStatsRow>

      {isChair && (
        <HubSection title={t("sectionContent")}>
          <HubActionCard
            href="/community/news"
            icon={Newspaper}
            title={tChair("newsHomeButton")}
            description={t("newsDesc")}
            tone="blue"
          />
          <HubActionCard
            href="/votes"
            icon={Vote}
            title={tChair("voteHomeButton")}
            description={t("votesDesc")}
            tone="violet"
          />
        </HubSection>
      )}

      <HubSection title={t("sectionResidents")}>
        {paymentsLabel && isChair && (
          <HubActionCard
            href="/payments"
            icon={CreditCard}
            title={paymentsLabel}
            description={t("paymentsDesc")}
            badge={counts.payments}
            tone="emerald"
          />
        )}
        <HubActionCard
          href="/chair/users"
          icon={Users}
          title={tChair("users")}
          description={t("usersDesc")}
          badge={counts.pendingResidents}
          tone="amber"
        />
      </HubSection>

      {isChair && (
        <HubSection title={t("sectionManage")}>
          <HubActionCard
            href="/chair/addresses"
            icon={MapPin}
            title={tChair("addresses")}
            description={t("addressesDesc")}
            tone="slate"
          />
          <HubActionCard
            href="/chair/tariffs"
            icon={FileText}
            title={tChair("editTariffs")}
            description={t("tariffsDesc")}
            tone="slate"
          />
          <HubActionCard
            href="/chair/memorandum"
            icon={ScrollText}
            title={tChair("editMemorandum")}
            description={t("memorandumDesc")}
            tone="slate"
          />
        </HubSection>
      )}

      <HubSection title={t("sectionSafety")}>
        <HubActionCard
          href="/chair/moderation"
          icon={Shield}
          title={tChair("moderation")}
          description={t("moderationDesc")}
          tone="rose"
        />
        {!isChair && (
          <HubActionCard
            href="/dashboard"
            icon={Home}
            title={t("backHome")}
            tone="blue"
          />
        )}
      </HubSection>

      {isChair && stats.newsPostsTotal > 0 && (
        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500 dark:text-slate-400">
          <Heart className="h-3.5 w-3.5 text-rose-500" aria-hidden />
          {t("footerEngagement", {
            posts: stats.newsPostsTotal,
            likes: stats.newsLikesWeek,
          })}
        </p>
      )}
    </div>
  );
}
