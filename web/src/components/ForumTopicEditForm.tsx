"use client";

import { updateForumTopic } from "@/actions/forum";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { translateActionError } from "@/lib/actionError";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";
import { AudienceScope } from "@/lib/audience";
import { ForumImageInput } from "@/components/ForumImageInput";
import { appendForumImages } from "@/lib/appendForumImages";

export function ForumTopicEditForm(props: {
  topicId: string;
  title: string;
  body: string;
  audience: string;
  existingPhotoCount?: number;
}) {
  const router = useRouter();
  const t = useTranslations("forum");
  const ta = useTranslations("categories.audience");
  const te = useTranslations("errors");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("topicId", props.topicId);
    appendForumImages(fd, photos);
    const res = await updateForumTopic(fd);
    setLoading(false);
    if (res && "error" in res && res.error) {
      setError(translateActionError(te, res.error));
      return;
    }
    router.push(`/community/forum/${props.topicId}`);
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
        <input name="title" required className={inputClass} defaultValue={props.title} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelClass}>{t("firstPost")}</span>
        <textarea
          name="body"
          required
          rows={6}
          className={inputClass}
          defaultValue={props.body}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelClass}>{t("audienceField")}</span>
        <select
          name="audience"
          className={inputClass}
          defaultValue={props.audience || AudienceScope.ALL}
        >
          <option value={AudienceScope.ALL}>{ta("ALL")}</option>
          <option value={AudienceScope.OWNERS_ONLY}>{ta("OWNERS_ONLY")}</option>
          <option value={AudienceScope.TENANTS_ONLY}>{ta("TENANTS_ONLY")}</option>
        </select>
      </label>
      <ForumImageInput
        existingCount={props.existingPhotoCount ?? 0}
        onFilesChange={setPhotos}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className={primaryButtonClass}
      >
        {loading ? t("creating") : t("saveEdit")}
      </button>
    </form>
  );
}
