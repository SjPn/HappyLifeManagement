"use client";

import { createForumReply } from "@/actions/forum";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { translateActionError } from "@/lib/actionError";
import { inputClass, primaryButtonClass } from "@/lib/formStyles";
import { ForumImageInput } from "@/components/ForumImageInput";
import { appendForumImages } from "@/lib/appendForumImages";

export function ForumReplyForm({ topicId }: { topicId: string }) {
  const router = useRouter();
  const t = useTranslations("forum");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("topicId", topicId);
    appendForumImages(fd, photos);
    const res = await createForumReply(fd);
    setLoading(false);
    if (res && "error" in res && res.error) {
      setError(translateActionError(te, res.error));
      return;
    }
    e.currentTarget.reset();
    setPhotos([]);
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      encType="multipart/form-data"
      className="flex flex-col gap-3"
    >
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
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className={primaryButtonClass}
      >
        {loading ? tc("sending") : t("reply")}
      </button>
    </form>
  );
}
