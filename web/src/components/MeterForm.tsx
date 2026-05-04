"use client";

import { addMeterReading } from "@/actions/meters";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";

export function MeterForm() {
  const router = useRouter();
  const t = useTranslations("meters");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await addMeterReading(new FormData(e.currentTarget));
    setLoading(false);
    if (res && "error" in res && res.error) {
      setError(te(res.error));
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelClass}>{t("value")}</span>
        <input
          name="value"
          type="text"
          inputMode="decimal"
          required
          placeholder={t("valuePh")}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelClass}>{t("note")}</span>
        <input
          name="note"
          placeholder={t("notePh")}
          className={inputClass}
        />
      </label>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className={primaryButtonClass}
      >
        {loading ? tc("loading") : t("submitReading")}
      </button>
    </form>
  );
}
