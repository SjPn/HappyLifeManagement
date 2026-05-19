"use client";

import { updatePaymentRequisites } from "@/actions/communitySettings";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function ChairPaymentRequisitesForm({
  initialRequisites,
}: {
  initialRequisites: string | null;
}) {
  const t = useTranslations("payments");
  const te = useTranslations("errors");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    const res = await updatePaymentRequisites(new FormData(e.currentTarget));
    setLoading(false);
    if (res && "error" in res && res.error) {
      setError(te(res.error));
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {t("requisitesHint")}
      </p>
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelClass}>{t("requisitesLabel")}</span>
        <textarea
          name="paymentRequisites"
          rows={5}
          defaultValue={initialRequisites ?? ""}
          className={inputClass}
          placeholder={t("requisitesPlaceholder")}
        />
      </label>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {saved && (
        <p className="text-sm text-green-700 dark:text-green-400">
          {t("requisitesSaved")}
        </p>
      )}
      <button type="submit" disabled={loading} className={primaryButtonClass}>
        {loading ? t("requisitesSaving") : t("requisitesSave")}
      </button>
    </form>
  );
}
