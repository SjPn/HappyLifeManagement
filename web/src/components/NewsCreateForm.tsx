"use client";

import { createNewsPost } from "@/actions/news";
import { PublishSuccessModal } from "@/components/PublishSuccessModal";
import { translateActionError } from "@/lib/actionError";
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
  const [published, setPublished] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await createNewsPost(new FormData(e.currentTarget));
    setLoading(false);
    if (res && "error" in res && res.error) {
      setError(translateActionError(te, res.error));
      return;
    }
    e.currentTarget.reset();
    setPublished(true);
    router.refresh();
  }

  return (
    <>
      <form
        onSubmit={onSubmit}
        encType="multipart/form-data"
        className="flex flex-col gap-3"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className={labelClass}>{t("newsTitleField")}</span>
          <input name="title" required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className={labelClass}>{t("newsBodyField")}</span>
          <textarea name="body" required rows={5} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className={labelClass}>{t("newsImageField")}</span>
          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-800 hover:file:bg-blue-100 dark:file:bg-blue-950/50 dark:file:text-blue-200"
          />
          <span className="text-xs text-zinc-500">{t("newsImageHint")}</span>
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

      {published && (
        <PublishSuccessModal
          title={t("newsPublishedTitle")}
          message={t("newsPublishedText")}
          closeLabel={t("newsPublishedClose")}
          onClose={() => setPublished(false)}
        />
      )}
    </>
  );
}
