"use client";

import { createVote } from "@/actions/votes";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";

export function VoteCreateForm() {
  const router = useRouter();
  const t = useTranslations("chair");
  const te = useTranslations("errors");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("type", "YES_NO");
    const res = await createVote(fd);
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
        <span className={labelClass}>{t("voteQuestionField")}</span>
        <input name="title" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelClass}>{t("voteDescField")}</span>
        <textarea
          name="description"
          rows={3}
          className={inputClass}
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className={labelClass}>{t("voteOptYes")}</span>
          <input
            name="optA"
            placeholder={t("voteOptYesPh")}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className={labelClass}>{t("voteOptNo")}</span>
          <input
            name="optB"
            placeholder={t("voteOptNoPh")}
            className={inputClass}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelClass}>{t("voteDaysLabel")}</span>
        <input
          name="days"
          type="number"
          min={1}
          max={90}
          defaultValue={14}
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
        {loading ? t("voteCreating") : t("voteLaunchBtn")}
      </button>
    </form>
  );
}
