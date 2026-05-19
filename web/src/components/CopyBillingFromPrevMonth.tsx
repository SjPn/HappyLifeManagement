"use client";

import { copyBillingFromPreviousMonthAction } from "@/actions/billing";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function CopyBillingFromPrevMonth({
  periodYear,
  periodMonth,
}: {
  periodYear: number;
  periodMonth: number;
}) {
  const t = useTranslations("payments");
  const te = useTranslations("errors");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!confirm(t("copyPrevConfirm"))) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    const fd = new FormData();
    fd.set("periodYear", String(periodYear));
    fd.set("periodMonth", String(periodMonth));
    const res = await copyBillingFromPreviousMonthAction(fd);
    setLoading(false);
    if (res && "error" in res && res.error) {
      setError(te(res.error));
      return;
    }
    if (res && "copied" in res) {
      setMessage(t("copyPrevDone", { count: res.copied }));
    }
    router.refresh();
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-900 transition hover:bg-violet-100 disabled:opacity-60 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-100"
      >
        {loading ? t("copyPrevLoading") : t("copyPrevMonth")}
      </button>
      {message && (
        <p className="mt-2 text-sm text-green-700 dark:text-green-400">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
