"use client";

import { Link } from "@/i18n/navigation";
import { NotificationBadge } from "@/components/NotificationBadge";
import type { LucideIcon } from "lucide-react";

export const hubAccent = {
  blue: "from-blue-500 to-sky-600 shadow-blue-500/30",
  violet: "from-violet-500 to-purple-600 shadow-violet-500/25",
  emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/25",
  amber: "from-amber-500 to-orange-500 shadow-amber-500/25",
  rose: "from-rose-500 to-pink-600 shadow-rose-500/25",
  slate: "from-slate-600 to-slate-700 shadow-slate-500/20",
  cyan: "from-cyan-500 to-blue-600 shadow-cyan-500/25",
} as const;

export type HubAccentTone = keyof typeof hubAccent;

export function HubStatTile({
  href,
  value,
  displayValue,
  label,
  highlight,
  dense,
}: {
  href?: string;
  value: number;
  /** Shown instead of `value` (e.g. formatted currency). */
  displayValue?: string;
  label: string;
  highlight?: boolean;
  /** Narrow tiles (e.g. three currency columns on mobile). */
  dense?: boolean;
}) {
  const shown = displayValue ?? String(value);
  const valueClass = dense
    ? "text-sm font-bold leading-tight sm:text-base"
    : "text-xl font-bold tracking-tight sm:text-2xl";
  const labelClass = dense
    ? "text-[0.58rem] font-semibold uppercase leading-tight tracking-wide"
    : "text-[0.65rem] font-semibold uppercase leading-tight tracking-wide";
  const inner = (
    <>
      <span
        className={`${valueClass} tabular-nums ${
          highlight
            ? "text-amber-700 dark:text-amber-300"
            : "bg-gradient-to-br from-blue-600 to-sky-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-300"
        }`}
      >
        {shown}
      </span>
      <span
        className={`mt-1 ${labelClass} text-slate-500 dark:text-slate-400`}
      >
        {label}
      </span>
    </>
  );

  const className = `hl-glass flex min-w-0 flex-1 flex-col items-center rounded-2xl ${
    dense ? "px-1 py-2.5 sm:px-2" : "px-2 py-3 sm:px-3"
  } text-center ${
    highlight ? "ring-2 ring-amber-400/50 dark:ring-amber-500/40" : ""
  } ${
    href
      ? "transition hover:-translate-y-0.5 hover:border-blue-300/60 hover:shadow-lg active:scale-[0.98]"
      : ""
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}

export function HubStatsRow({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-2 sm:gap-3">{children}</div>;
}

export function HubActionCard({
  href,
  icon: Icon,
  title,
  description,
  badge,
  tone,
  onClick,
}: {
  href?: string;
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  badge?: number;
  tone: HubAccentTone;
  onClick?: () => void;
}) {
  const inner = (
    <div className="hl-glass relative flex items-center gap-4 rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-blue-300/50 hover:shadow-xl active:scale-[0.99]">
      {badge != null && badge > 0 && (
        <span className="absolute right-3 top-3">
          <NotificationBadge count={badge} />
        </span>
      )}
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg ${hubAccent[tone]}`}
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
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="group block w-full text-left">
        {inner}
      </button>
    );
  }

  if (!href) {
    return <div className="group block">{inner}</div>;
  }

  return (
    <Link href={href} className="group block">
      {inner}
    </Link>
  );
}

export function HubSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mt-8 ${className}`}>
      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-blue-600/90 dark:text-blue-400/90">
        {title}
      </h2>
      <div className="flex flex-col gap-2.5">{children}</div>
    </section>
  );
}

export function HubPulseBanner({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="mb-5 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/95 to-orange-50/80 px-4 py-3.5 shadow-sm dark:border-amber-900/50 dark:from-amber-950/50 dark:to-orange-950/30">
      <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
        {title}
      </p>
      <p className="mt-1 text-sm text-amber-900/90 dark:text-amber-200/90">
        {message}
      </p>
    </div>
  );
}

export function HubContentCard({
  href,
  children,
  className = "",
  badge,
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
  badge?: number;
}) {
  const body = (
    <div
      className={`hl-glass relative rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-blue-300/50 hover:shadow-lg ${className}`}
    >
      {badge != null && badge > 0 && (
        <span className="absolute right-3 top-3 z-10">
          <NotificationBadge count={badge} />
        </span>
      )}
      {children}
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block">
        {body}
      </Link>
    );
  }
  return body;
}

export function HubMetaLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-1.5 text-xs text-slate-500 dark:text-slate-400">
      {children}
    </p>
  );
}

export function AvatarInitials({
  name,
  tone = "blue",
}: {
  name: string;
  tone?: HubAccentTone;
}) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
      : (parts[0]?.slice(0, 2) ?? "?").toUpperCase();
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-md ${hubAccent[tone]}`}
    >
      {initials}
    </span>
  );
}
