"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
  billingPeriodKey,
  formatBillingPeriodLabel,
  shiftBillingPeriod,
  type BillingPeriod,
} from "@/lib/billing";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

function periodQuery(p: BillingPeriod) {
  return `?y=${p.year}&m=${p.month}`;
}

export function PaymentPeriodNav({ period }: { period: BillingPeriod }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("payments");
  const label = formatBillingPeriodLabel(locale, period);
  const prev = shiftBillingPeriod(period, -1);
  const next = shiftBillingPeriod(period, 1);
  const isCurrent =
    billingPeriodKey(period) ===
    billingPeriodKey({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    });

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`${pathname}${periodQuery(prev)}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-label={t("periodPrev")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("billingPeriod")}
          </p>
          <p className="truncate text-lg font-bold capitalize text-zinc-900 dark:text-zinc-100">
            {label}
          </p>
          {isCurrent && (
            <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-300">
              {t("periodCurrent")}
            </p>
          )}
        </div>
        <Link
          href={`${pathname}${periodQuery(next)}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-label={t("periodNext")}
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
