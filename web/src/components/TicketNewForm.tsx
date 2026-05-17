"use client";

import { createTicket } from "@/actions/tickets";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { TicketCategory } from "@/lib/enums";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";

export function TicketNewForm() {
  const router = useRouter();
  const t = useTranslations("requests");
  const tc = useTranslations("categories.ticket");
  const te = useTranslations("errors");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await createTicket(form);
    setLoading(false);
    if (res && "error" in res && res.error) {
      setError(te(res.error));
      return;
    }
    router.push("/requests");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      encType="multipart/form-data"
      className="flex flex-col gap-4"
    >
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t("category")}</span>
        <select
          name="category"
          className={inputClass}
          required
        >
          {Object.values(TicketCategory).map((c) => (
            <option key={c} value={c}>
              {tc(c)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t("describe")}</span>
        <textarea
          name="description"
          required
          rows={5}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t("landmark")}</span>
        <input
          name="locationNote"
          placeholder={t("landmarkPh")}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t("photo")}</span>
        <input
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-800 dark:text-slate-300 dark:file:bg-blue-950 dark:file:text-blue-200"
        />
        <span className="text-xs text-slate-500">{t("photoHint")}</span>
      </label>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className={`${primaryButtonClass}`}
      >
        {loading ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
