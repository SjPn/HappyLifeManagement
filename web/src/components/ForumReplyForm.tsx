"use client";

import { createForumReply } from "@/actions/forum";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { translateActionError } from "@/lib/actionError";
import { inputClass, primaryButtonClass } from "@/lib/formStyles";
import { ForumImageInput } from "@/components/ForumImageInput";
import { uploadForumPhotos } from "@/lib/forumUploadClient";

export function ForumReplyForm({ topicId }: { topicId: string }) {
  const router = useRouter();
  const t = useTranslations("forum");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadLabel, setUploadLabel] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadLabel(null);
    const form = e.currentTarget;
    try {
      const fd = new FormData(form);
      fd.set("topicId", topicId);

      if (photos.length > 0) {
        const up = await uploadForumPhotos(photos, 0, (current, total) => {
          setUploadLabel(t("uploadingPhotos", { current, total }));
        });
        if ("error" in up) {
          setError(translateActionError(te, up.error));
          return;
        }
        fd.set("imageUrls", JSON.stringify(up.urls));
      }

      const res = await createForumReply(fd);
      if (res && "error" in res && res.error) {
        setError(translateActionError(te, res.error));
        return;
      }
      form.reset();
      setPhotos([]);
      router.refresh();
    } finally {
      setLoading(false);
      setUploadLabel(null);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="topicId" value={topicId} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="sr-only">{t("reply")}</span>
        <textarea
          name="body"
          required
          rows={4}
          placeholder={t("replyPh")}
          className={inputClass}
        />
      </label>
      <ForumImageInput onFilesChange={setPhotos} />
      {uploadLabel && (
        <p className="text-sm text-blue-700 dark:text-blue-300">{uploadLabel}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className={primaryButtonClass}
      >
        {loading ? (uploadLabel ?? tc("sending")) : t("reply")}
      </button>
    </form>
  );
}
