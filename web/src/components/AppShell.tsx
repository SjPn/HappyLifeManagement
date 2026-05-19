"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import {
  ClipboardList,
  Home,
  LogOut,
  UsersRound,
  LayoutGrid,
} from "lucide-react";
import { NotificationBadge } from "@/components/NotificationBadge";
import { useNotifications } from "@/components/NotificationProvider";
import type { NotificationCounts } from "@/lib/notifications";

const tabs: {
  href: string;
  navKey: "home" | "requests" | "community" | "more";
  Icon: typeof Home;
  countKey?: keyof Pick<
    NotificationCounts,
    "home" | "requests" | "community"
  >;
}[] = [
  { href: "/dashboard", navKey: "home", Icon: Home, countKey: "home" },
  {
    href: "/requests",
    navKey: "requests",
    Icon: ClipboardList,
    countKey: "requests",
  },
  {
    href: "/community",
    navKey: "community",
    Icon: UsersRound,
    countKey: "community",
  },
  { href: "/profile", navKey: "more", Icon: LayoutGrid },
];

export function AppShell({
  children,
  communityName,
}: {
  children: React.ReactNode;
  communityName?: string;
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const { data } = useSession();
  const role = (data?.user as { role?: string } | undefined)?.role;
  const isModerator = role === "MODERATOR";
  const { counts } = useNotifications();
  const visibleTabs = isModerator
    ? tabs.filter((x) => x.href !== "/requests" && x.href !== "/community")
    : tabs;

  return (
    <div className="flex min-h-screen flex-col pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))]">
      <main className="relative mx-auto w-full min-w-0 max-w-lg flex-1 px-4 pb-2 pt-5 sm:px-5">
        {communityName ? (
          <p className="mb-3 truncate text-center text-xs font-semibold uppercase tracking-wide text-blue-700/90 dark:text-blue-300/90">
            {communityName}
          </p>
        ) : null}
        {children}
      </main>

      <nav className="hl-bottom-nav fixed bottom-0 left-0 right-0 z-40 border-t border-blue-900/10 bg-[color-mix(in_oklab,var(--hl-bg-elevated)_88%,transparent)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_32px_-12px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-blue-400/10 dark:shadow-[0_-12px_40px_-16px_rgba(0,0,0,0.55)]">
        <div className="mx-auto flex max-w-lg items-end justify-between gap-1">
          {visibleTabs.map((tab) => {
            const active =
              tab.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(tab.href);
            const Icon = tab.Icon;
            const badgeCount = tab.countKey ? counts[tab.countKey] : 0;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-b from-blue-500/15 to-sky-500/5 text-blue-800 shadow-inner shadow-blue-500/10 dark:from-blue-400/15 dark:to-sky-400/5 dark:text-blue-100"
                    : "text-slate-500 hover:bg-white/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                }`}
              >
                <span
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-active:scale-95 ${
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 dark:bg-blue-500 dark:shadow-blue-500/20"
                      : "bg-slate-100/90 text-slate-600 dark:bg-slate-800/90 dark:text-slate-300"
                  }`}
                >
                  <Icon className="h-[1.35rem] w-[1.35rem]" strokeWidth={2} />
                  <NotificationBadge count={badgeCount} />
                </span>
                <span className="max-w-full truncate px-0.5 text-[0.65rem] font-semibold leading-none tracking-tight">
                  {t(tab.navKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function SignOutButton() {
  const locale = useLocale();
  const t = useTranslations("profile");

  return (
    <button
      type="button"
      onClick={() => {
        // Do not rely on server-side redirect (NEXTAUTH_URL/AUTH_URL might be misconfigured).
        // Sign out without redirect, then navigate on the client using the current origin.
        signOut({ redirect: false })
          .catch(() => null)
          .finally(() => {
            window.location.assign(`/${locale}`);
          });
      }}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-red-900/50 dark:hover:bg-red-950/40 dark:hover:text-red-200"
    >
      <LogOut className="h-4 w-4" />
      {t("signOut")}
    </button>
  );
}
