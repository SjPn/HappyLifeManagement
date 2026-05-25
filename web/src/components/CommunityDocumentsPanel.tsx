"use client";

import { deleteCommunityDocument, uploadCommunityDocument } from "@/actions/documents";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Card } from "@/components/Ui";
import { DocumentOpenLink } from "@/components/DocumentOpenLink";
import { NotificationBadge } from "@/components/NotificationBadge";
import { FileText, Trash2 } from "lucide-react";

export type DocumentRow = {
  id: string;
  title: string;
  fileUrl: string;
  createdAt: string;
  authorName: string;
};

export function CommunityDocumentsPanel({
  documents,
  isChair,
  unreadById = new Map(),
}: {
  documents: DocumentRow[];
  isChair: boolean;
  unreadById?: Map<string, number>;
}) {
  const t = useTranslations("documents");
  const te = useTranslations("errors");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await uploadCommunityDocument(new FormData(e.currentTarget));
    setLoading(false);
    if (res && "error" in res && res.error) {
      setError(te(res.error));
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    const res = await deleteCommunityDocument(id);
    if (res && "error" in res && res.error) {
      setError(te(res.error));
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {isChair && (
        <Card>
          <form onSubmit={onUpload} className="flex flex-col gap-3">
            <p className="text-sm font-semibold">{t("uploadTitle")}</p>
            <label className="flex flex-col gap-1 text-sm">
              <span className={labelClass}>{t("docTitle")}</span>
              <input name="title" required className={inputClass} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className={labelClass}>{t("docFile")}</span>
              <input
                name="file"
                type="file"
                required
                accept=".pdf,image/*"
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
              {loading ? t("uploading") : t("uploadBtn")}
            </button>
          </form>
        </Card>
      )}

      {documents.length === 0 ? (
        <Card>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("empty")}</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {documents.map((doc) => {
            const unread = unreadById.get(doc.id) ?? 0;
            return (
            <Card key={doc.id} className="relative flex items-start gap-3">
              {unread > 0 && (
                <span className="absolute right-3 top-3">
                  <NotificationBadge count={unread} />
                </span>
              )}
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1 pr-8">
                <DocumentOpenLink
                  documentId={doc.id}
                  href={doc.fileUrl}
                  className="font-semibold text-blue-800 hover:underline dark:text-blue-200"
                >
                  {doc.title}
                </DocumentOpenLink>
                <p className="mt-1 text-xs text-zinc-500">
                  {doc.authorName} · {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
              {isChair && (
                <button
                  type="button"
                  onClick={() => onDelete(doc.id)}
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  aria-label={t("delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </Card>
          );
          })}
        </div>
      )}
    </div>
  );
}
