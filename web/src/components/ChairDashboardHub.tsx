"use client";

import { Link } from "@/i18n/navigation";
import { NotificationBadge } from "@/components/NotificationBadge";
import { useNotifications } from "@/components/NotificationProvider";
import type { ChairDashboardStats } from "@/lib/chairDashboard";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
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

const accent = {
  blue: "from-blue-500 to-sky-600 shadow-blue-500/30",
  violet: "from-violet-500 to-purple-600 shadow-violet-500/25",
  emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/25",
  amber: "from-amber-500 to-orange-500 shadow-amber-500/25",
  rose: "from-rose-500 to-pink-600 shadow-rose-500/25",
  slate: "from-slate-600 to-slate-700 shadow-slate-500/20",
} as const;

type Accent = keyof typeof accent;

function StatTile({
  href,
  value,
  label,
  highlight,
}: {
  href: string;
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`hl-glass flex min-w-0 flex-1 flex-col items-center rounded-2xl px-2 py-3 text-center transition hover:-translate-y-0.5 hover:border-blue-300/60 hover:shadow-lg active:scale-[0.98] sm:px-3 ${
        highlight
          ? "ring-2 ring-amber-400/50 dark:ring-amber-500/40"
          : ""
      }`}
    >
      <span
        className={`text-2xl font-bold tabular-nums tracking-tight ${
          highlight
            ? "text-amber-700 dark:text-amber-300"
            : "bg-gradient-to-br from-blue-600 to-sky-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-300"
        }`}
      >
        {value}
      </span>
      <span className="mt-1 text-[0.65rem] font-semibold uppercase leading-tight tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
    </Link>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  description,
  badge,
  tone,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  badge?: number;
  tone: Accent;
}) {
  return (
    <Link href={href} className="group block">
      <div className="hl-glass relative flex items-center gap-4 rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-blue-300/50 hover:shadow-xl active:scale-[0.99]">
        {badge != null && badge > 0 && (
          <span className="absolute right-3 top-3">
            <NotificationBadge count={badge} />
          </span>
        )}
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg ${accent[tone]}`}
        >
          <Icon className="h-5 w-5 text-white" strokeWidth={2.25} aria-hidden />
        </span>
        <span className="min-w-0 flex-1 pr-6 text-left">
          <span className="block font-semibold text-slate-900 group-hover:text-blue-800 dark:text-slate-100 dark:group-hover:text-blue-200">
            {title}
          </span>
          {description && (
            <span className="mt-0.5 block text-sm leading-snug text-slate-500 dark:text-slate-400">
              {description}
            </span>
          )}
        </span>
        <span
          className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500 dark:text-slate-600"
          aria-hidden
        >
          →
        </span>
      </div>
    </Link>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-blue-600/90 dark:text-blue-400/90">
        {title}
      </h2>
      <div className="flex flex-col gap-2.5">{children}
      </div>
    </section>
  );
}

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
        <div className="mb-5 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/95 to-orange-50/80 px-4 py-3.5 shadow-sm dark:border-amber-900/50 dark:from-amber-950/50 dark:to-orange-950/30">
          <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
            {t("pulseTitle")}
          </p>
          <p className="mt-1 text-sm text-amber-900/90 dark:text-amber-200/90">
            {t("pulseText", {
              pending: stats.pendingResidents,
              tickets: stats.openTickets,
            })}
          </p>
        </div>
      )}

      <div className="flex gap-2 sm:gap-3">
        <StatTile
          href="/chair/users"
          value={stats.pendingResidents}
          label={t("statPending")}
          highlight={stats.pendingResidents > 0}
        />
        <StatTile
          href="/votes"
          value={stats.activeVotes}
          label={t("statVotes")}
        />
        <StatTile
          href="/requests"
          value={stats.openTickets}
          label={t("statTickets")}
          highlight={stats.openTickets > 0}
        />
        <StatTile
          href="/community/news"
          value={stats.newsLikesWeek}
          label={t("statLikes")}
        />
      </div>

      {isChair && (
        <Section title={t("sectionContent")}>
          <ActionCard
            href="/community/news"
            icon={Newspaper}
            title={tChair("newsHomeButton")}
            description={t("newsDesc")}
            tone="blue"
          />
          <ActionCard
            href="/votes"
            icon={Vote}
            title={tChair("voteHomeButton")}
            description={t("votesDesc")}
            tone="violet"
          />
        </Section>
      )}

      <Section title={t("sectionResidents")}>
        {paymentsLabel && isChair && (
          <ActionCard
            href="/payments"
            icon={CreditCard}
            title={paymentsLabel}
            description={t("paymentsDesc")}
            badge={counts.payments}
            tone="emerald"
          />
        )}
        <ActionCard
          href="/chair/users"
          icon={Users}
          title={tChair("users")}
          description={t("usersDesc")}
          badge={counts.pendingResidents}
          tone="amber"
        />
      </Section>

      {isChair && (
        <Section title={t("sectionManage")}>
          <ActionCard
            href="/chair/addresses"
            icon={MapPin}
            title={tChair("addresses")}
            description={t("addressesDesc")}
            tone="slate"
          />
          <ActionCard
            href="/chair/tariffs"
            icon={FileText}
            title={tChair("editTariffs")}
            description={t("tariffsDesc")}
            tone="slate"
          />
          <ActionCard
            href="/chair/memorandum"
            icon={ScrollText}
            title={tChair("editMemorandum")}
            description={t("memorandumDesc")}
            tone="slate"
          />
        </Section>
      )}

      <Section title={t("sectionSafety")}>
        <ActionCard
          href="/chair/moderation"
          icon={Shield}
          title={tChair("moderation")}
          description={t("moderationDesc")}
          tone="rose"
        />
        {!isChair && (
          <ActionCard
            href="/dashboard"
            icon={Home}
            title={t("backHome")}
            tone="blue"
          />
        )}
      </Section>

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
