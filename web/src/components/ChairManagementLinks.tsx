"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { NotificationBadge } from "@/components/NotificationBadge";
import { useNotifications } from "@/components/NotificationProvider";

export const chairNavLinkClass =
  "block rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800";

export function ChairManagementLinks({
  isChair,
  paymentsLabel,
}: {
  isChair: boolean;
  paymentsLabel?: string;
}) {
  const t = useTranslations("chair");
  const { counts } = useNotifications();

  return (
    <div className="flex flex-col gap-2">
      {paymentsLabel && (
        <span className="relative block">
          <Link href="/payments" className={chairNavLinkClass}>
            {paymentsLabel}
          </Link>
          {counts.payments > 0 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <NotificationBadge count={counts.payments} />
            </span>
          )}
        </span>
      )}
      {isChair && (
        <Link href="/chair/addresses" className={chairNavLinkClass}>
          {t("addresses")}
        </Link>
      )}
      <Link href="/chair/users" className={chairNavLinkClass}>
        {t("users")}
      </Link>
      <Link href="/chair/reports" className={chairNavLinkClass}>
        {t("reports")}
      </Link>
      <Link href="/chair/moderation" className={chairNavLinkClass}>
        {t("moderation")}
      </Link>
    </div>
  );
}
