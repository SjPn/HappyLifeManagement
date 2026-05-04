"use client";

import { createConfidentialReport } from "@/actions/reports";
import { ReportKind } from "@/lib/enums";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";

export function ConfidentialNewForm() {
  const router = useRouter();
  const t = useTranslations("reports");
  const tKind = useTranslations("categories.reportKind");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await createConfidentialReport(new FormData(e.currentTarget));
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
        <span className={labelClass}>{t("type")}</span>
        <select name="kind" className={inputClass}>
          {Object.values(ReportKind).map((k) => (
            <option key={k} value={k}>
              {tKind(k as "COMPLAINT" | "SUGGESTION" | "VIOLATION" | "IDEA")}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelClass}>{t("topicShort")}</span>
        <input
          name="category"
          placeholder={t("topicPh")}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelClass}>{t("body")}</span>
        <textarea
          name="body"
          required
          rows={5}
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
        {loading ? tc("sending") : t("send")}
      </button>
    </form>
  );
}
