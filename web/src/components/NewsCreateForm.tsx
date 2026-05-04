"use client";

import { createNewsPost } from "@/actions/news";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";

export function NewsCreateForm() {
  const router = useRouter();
  const t = useTranslations("chair");
  const te = useTranslations("errors");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await createNewsPost(new FormData(e.currentTarget));
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
        <span className={labelClass}>{t("newsTitleField")}</span>
        <input name="title" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelClass}>{t("newsBodyField")}</span>
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
        {loading ? t("newsPublishing") : t("newsPublishBtn")}
      </button>
    </form>
  );
}
