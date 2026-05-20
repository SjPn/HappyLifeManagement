"use client";

import { saveHouseholdMeterReading } from "@/actions/electricity";
import { computeElectricityCharge } from "@/lib/electricity";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

function parseLocal(raw: string): number | null {
  const n = Number(String(raw).trim().replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function HouseholdMeterForm({
  street,
  houseNumber,
  periodYear,
  periodMonth,
  dayReading,
  nightReading,
  prevDayReading,
  prevNightReading,
  dayRateUah,
  nightRateUah,
  electricityUah,
  onElectricityCalculated,
}: {
  street: string;
  houseNumber: string;
  periodYear: number;
  periodMonth: number;
  dayReading: number | null;
  nightReading: number | null;
  prevDayReading: number | null;
  prevNightReading: number | null;
  dayRateUah: number;
  nightRateUah: number;
  electricityUah: number;
  onElectricityCalculated?: (amount: number) => void;
}) {
  const router = useRouter();
  const t = useTranslations("payments.electricityMeter");
  const tc = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dayVal, setDayVal] = useState(
    dayReading != null ? String(dayReading) : "",
  );
  const [nightVal, setNightVal] = useState(
    nightReading != null ? String(nightReading) : "",
  );

  const hasTariff = dayRateUah > 0 || nightRateUah > 0;
  const hasPrev = prevDayReading != null && prevNightReading != null;

  const preview = useMemo(() => {
    const day = parseLocal(dayVal);
    const night = parseLocal(nightVal);
    if (day === null || night === null || !hasTariff) return null;
    const prev =
      hasPrev && prevDayReading != null && prevNightReading != null
        ? { day: prevDayReading, night: prevNightReading }
        : null;
    return computeElectricityCharge(
      { day, night },
      prev,
      { dayRateUah, nightRateUah },
    );
  }, [
    dayVal,
    nightVal,
    hasTariff,
    hasPrev,
    prevDayReading,
    prevNightReading,
    dayRateUah,
    nightRateUah,
  ]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await saveHouseholdMeterReading(new FormData(e.currentTarget));
    setLoading(false);
    if (res && "error" in res) {
      if (res.error === "noTariff") setError(t("errorNoTariff"));
      else if (res.error === "badReadings") setError(t("errorBadReadings"));
      else setError(t("errorSave"));
      return;
    }
    if (res && "electricityUah" in res && typeof res.electricityUah === "number") {
      onElectricityCalculated?.(res.electricityUah);
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2 rounded-xl border border-amber-200/80 bg-amber-50/40 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/90 dark:text-amber-200/90">
        {t("meterTitle")}
      </p>
      <input type="hidden" name="street" value={street} />
      <input type="hidden" name="houseNumber" value={houseNumber} />
      <input type="hidden" name="periodYear" value={periodYear} />
      <input type="hidden" name="periodMonth" value={periodMonth} />

      {(prevDayReading != null || prevNightReading != null) && (
        <p className="text-[0.65rem] text-slate-600 dark:text-slate-400">
          {t("prevReadings", {
            day: prevDayReading ?? "—",
            night: prevNightReading ?? "—",
          })}
        </p>
      )}
      {!hasPrev && (
        <p className="text-[0.65rem] text-amber-800 dark:text-amber-300">
          {t("noPrevHint")}
        </p>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs">
          {t("dayReading")}
          <input
            name="dayReading"
            type="text"
            inputMode="decimal"
            value={dayVal}
            onChange={(e) => setDayVal(e.target.value)}
            className="w-28 rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          {t("nightReading")}
          <input
            name="nightReading"
            type="text"
            inputMode="decimal"
            value={nightVal}
            onChange={(e) => setNightVal(e.target.value)}
            className="w-28 rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </label>
        <button
          type="submit"
          disabled={loading || !hasTariff}
          className="h-8 rounded-lg bg-amber-700 px-3 text-xs font-medium text-white hover:bg-amber-800 disabled:opacity-50 dark:bg-amber-600"
        >
          {loading ? tc("loading") : t("calcSave")}
        </button>
      </div>

      {!hasTariff && (
        <p className="text-[0.65rem] text-amber-800 dark:text-amber-300">
          {t("setTariffFirst")}
        </p>
      )}

      {preview && (
        <p className="text-xs text-slate-700 dark:text-slate-300">
          {t("preview", {
            dayKwh: preview.deltaDay,
            nightKwh: preview.deltaNight,
            amount: preview.totalUah,
          })}
        </p>
      )}

      {electricityUah > 0 && (
        <p className="text-[0.65rem] text-slate-500">
          {t("currentCharge", { amount: electricityUah })}
        </p>
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </form>
  );
}
