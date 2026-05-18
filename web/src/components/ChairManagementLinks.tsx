"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const linkClass =
  "block rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800";

export function ChairManagementLinks({ isChair }: { isChair: boolean }) {
  const t = useTranslations("chair");

  return (
    <div className="flex flex-col gap-2">
      {isChair && (
        <Link href="/chair/addresses" className={linkClass}>
          {t("addresses")}
        </Link>
      )}
      <Link href="/chair/users" className={linkClass}>
        {t("users")}
      </Link>
      <Link href="/residents" className={linkClass}>
        {t("residentsDirectory")}
      </Link>
      <Link href="/chair/reports" className={linkClass}>
        {t("reports")}
      </Link>
      <Link href="/chair/moderation" className={linkClass}>
        {t("moderation")}
      </Link>
    </div>
  );
}
