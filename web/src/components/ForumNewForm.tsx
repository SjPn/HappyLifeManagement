"use client";

import { createForumTopic } from "@/actions/forum";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";
import { AudienceScope } from "@/lib/audience";
import { translateActionError } from "@/lib/actionError";

export function ForumNewForm() {
  const router = useRouter();
  const t = useTranslations("forum");
  const ta = useTranslations("categories.audience");
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
      setError(translateActionError(te, res.error));
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
        <span className={labelClass}>{t("audienceField")}</span>
        <select name="audience" className={inputClass} defaultValue={AudienceScope.ALL}>
          <option value={AudienceScope.ALL}>{ta("ALL")}</option>
          <option value={AudienceScope.OWNERS_ONLY}>{ta("OWNERS_ONLY")}</option>
          <option value={AudienceScope.TENANTS_ONLY}>{ta("TENANTS_ONLY")}</option>
        </select>
      </label>
      <label className="flex items-start gap-2 rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-700">
        <input
          type="checkbox"
          name="isAnonymous"
          className="mt-0.5 h-4 w-4"
        />
        <span className="text-zinc-700 dark:text-zinc-300">
          <span className="font-medium">{t("anonymousLabel")}</span>
          <span className="mt-1 block text-xs text-zinc-500">
            {t("anonymousHint")}
          </span>
        </span>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelClass}>{t("image")}</span>
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-800 hover:file:bg-blue-100 dark:file:bg-blue-950/50 dark:file:text-blue-200"
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
