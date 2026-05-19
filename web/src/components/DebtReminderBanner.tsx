"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "hl-debt-reminder-dismissed";

export function DebtReminderBanner({
  amountLabel,
  periodLabel,
}: {
  amountLabel: string;
  periodLabel: string;
}) {
  const t = useTranslations("payments");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  return (
    <div
      role="alert"
      className="relative mb-4 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 pr-10 shadow-sm dark:border-amber-800 dark:from-amber-950/60 dark:to-orange-950/40"
    >
      <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
        {t("debtReminderTitle")}
      </p>
      <p className="mt-1 text-sm text-amber-900/90 dark:text-amber-200/90">
        {t("debtReminderText", { period: periodLabel, amount: amountLabel })}
      </p>
      <Link
        href="/payments"
        className="mt-2 inline-block text-sm font-semibold text-blue-800 underline dark:text-blue-300"
      >
        {t("debtReminderLink")}
      </Link>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 top-2 rounded-lg p-1 text-amber-800 hover:bg-amber-100 dark:text-amber-200"
        aria-label={t("debtReminderDismiss")}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
