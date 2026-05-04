"use client";

import { createForumTopic } from "@/actions/forum";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";

export function ForumNewForm() {
  const router = useRouter();
  const t = useTranslations("forum");
  const te = useTranslations("errors");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await createForumTopic(new FormData(e.currentTarget));
    setLoading(false);
    if (res && "error" in res && res.error) {
      setError(te(res.error));
      return;
    }
    router.push("/community/forum");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      encType="multipart/form-data"
      className="flex flex-col gap-4"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelClass}>{t("topicTitle")}</span>
        <input name="title" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelClass}>{t("firstPost")}</span>
        <textarea
          name="body"
          required
          rows={6}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelClass}>{t("image")}</span>
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-emerald-800 hover:file:bg-emerald-100 dark:file:bg-emerald-950/50 dark:file:text-emerald-200"
        />
        <span className="text-xs text-zinc-500">{t("photoHint")}</span>
      </label>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className={primaryButtonClass}
      >
        {loading ? t("creating") : t("create")}
      </button>
    </form>
  );
}
