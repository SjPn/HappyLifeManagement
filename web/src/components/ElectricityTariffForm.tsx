"use client";

import { saveElectricityTariff } from "@/actions/electricity";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function ElectricityTariffForm({
  periodYear,
  periodMonth,
  dayRateUah,
  nightRateUah,
}: {
  periodYear: number;
  periodMonth: number;
  dayRateUah: number;
  nightRateUah: number;
}) {
  const router = useRouter();
  const t = useTranslations("payments.electricityMeter");
  const tc = useTranslations("common");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await saveElectricityTariff(new FormData(e.currentTarget));
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        {t("tariffTitle")}
      </p>
      <p className="text-xs text-slate-600 dark:text-slate-400">{t("tariffHint")}</p>
      <input type="hidden" name="periodYear" value={periodYear} />
      <input type="hidden" name="periodMonth" value={periodMonth} />
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-xs">
          {t("dayRate")}
          <input
            name="dayRateUah"
            type="text"
            inputMode="decimal"
            defaultValue={dayRateUah > 0 ? String(dayRateUah) : ""}
            className="w-32 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          {t("nightRate")}
          <input
            name="nightRateUah"
            type="text"
            inputMode="decimal"
            defaultValue={nightRateUah > 0 ? String(nightRateUah) : ""}
            className="w-32 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="self-end rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? tc("loading") : tc("save")}
        </button>
      </div>
    </form>
  );
}
