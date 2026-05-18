"use client";

import { addTicketComment } from "@/actions/ticketComments";
import { translateActionError } from "@/lib/actionError";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";
import { IMAGE_ACCEPT, validateImageFile } from "@/lib/uploadLimits";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function TicketCommentForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const t = useTranslations("requests");
  const te = useTranslations("errors");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const body = String(data.get("body") || "").trim();
    const image = data.get("image");

    const fileErr =
      image instanceof File ? validateImageFile(image) : null;
    if (fileErr) {
      setError(translateActionError(te, fileErr));
      return;
    }

    const hasImage = image instanceof File && image.size > 0;
    if (!body && !hasImage) {
      setError(translateActionError(te, "emptyMessage"));
      return;
    }

    setLoading(true);
    try {
      const res = await addTicketComment(data);
      if (res && "error" in res && res.error) {
        setError(translateActionError(te, res.error));
        return;
      }
      form.reset();
      router.refresh();
    } catch {
      setError(translateActionError(te, "generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      encType="multipart/form-data"
      className="flex flex-col gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800"
    >
      <input type="hidden" name="ticketId" value={ticketId} />
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600/90 dark:text-blue-400/90">
        {t("addCommentTitle")}
      </p>
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelClass}>{t("commentBody")}</span>
        <textarea name="body" rows={3} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelClass}>{t("commentPhoto")}</span>
        <input
          name="image"
          type="file"
          accept={IMAGE_ACCEPT}
          className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-800 dark:file:bg-blue-950/50 dark:file:text-blue-200"
        />
        <span className="text-xs text-slate-500">{t("photoHint")}</span>
      </label>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button type="submit" disabled={loading} className={primaryButtonClass}>
        {loading ? t("commentSending") : t("commentSend")}
      </button>
    </form>
  );
}
