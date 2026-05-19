"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";
import { useTranslations } from "next-intl";
import { bindModalOverlay } from "@/lib/modalOverlay";

export type CommunityDangerAction =
  | "block"
  | "unblock"
  | "delete"
  | "suspendChair"
  | "restoreChair"
  | "deleteChair";

export function CommunityDangerModal({
  communityName,
  subjectName,
  action,
  onClose,
  onConfirm,
}: {
  communityName: string;
  subjectName?: string;
  action: CommunityDangerAction;
  onClose: () => void;
  onConfirm: (inviteCode: string) => Promise<{ error?: string }>;
}) {
  const t = useTranslations("platform");
  const tChair = useTranslations("chair");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const chair = subjectName ?? "";

  const title =
    action === "delete"
      ? t("modalDeleteTitle")
      : action === "block"
        ? t("modalBlockTitle")
        : action === "unblock"
          ? t("modalUnblockTitle")
          : action === "deleteChair"
            ? t("modalDeleteChairTitle")
            : action === "suspendChair"
              ? t("modalSuspendChairTitle")
              : t("modalRestoreChairTitle");

  const description =
    action === "delete"
      ? t("modalDeleteText", { name: communityName })
      : action === "block"
        ? t("modalBlockText", { name: communityName })
        : action === "unblock"
          ? t("modalUnblockText", { name: communityName })
          : action === "deleteChair"
            ? t("modalDeleteChairText", { chair, community: communityName })
            : action === "suspendChair"
              ? t("modalSuspendChairText", { chair, community: communityName })
              : t("modalRestoreChairText", { chair, community: communityName });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onClose();
    }
    document.addEventListener("keydown", onKey);
    const release = bindModalOverlay();
    return () => {
      document.removeEventListener("keydown", onKey);
      release();
    };
  }, [onClose, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = code.trim();
    if (!trimmed) {
      setError(t("inviteConfirmRequired"));
      return;
    }
    setLoading(true);
    const res = await onConfirm(trimmed);
    setLoading(false);
    if (res?.error) {
      const key = res.error as
        | "inviteMismatch"
        | "inviteConfirmRequired"
        | "notFound"
        | "forbidden";
      setError(t(`errors.${key}`));
      return;
    }
    onClose();
  }

  const dangerBtn =
    action === "delete" || action === "deleteChair"
      ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/25"
      : action === "block" || action === "suspendChair"
        ? "bg-amber-600 hover:bg-amber-700 text-white"
        : primaryButtonClass;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-4 pb-0 sm:items-center sm:pb-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label={tChair("closeModal")}
        onClick={() => !loading && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-lg font-semibold leading-snug">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label={tChair("closeModal")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-4 py-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
          <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
            {t("inviteConfirmHint")}
          </p>
          <label className="mt-4 flex flex-col gap-1.5">
            <span className={labelClass}>{t("inviteConfirmLabel")}</span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={inputClass}
              autoComplete="off"
              autoFocus
              disabled={loading}
              placeholder={t("inviteConfirmPlaceholder")}
            />
          </label>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium dark:border-zinc-700"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold disabled:opacity-60 ${dangerBtn}`}
            >
              {loading
                ? t("confirming")
                : action === "delete"
                  ? t("confirmDeleteBtn")
                  : action === "deleteChair"
                    ? t("confirmDeleteChairBtn")
                    : action === "block"
                      ? t("confirmBlockBtn")
                      : action === "suspendChair"
                        ? t("confirmSuspendChairBtn")
                        : action === "restoreChair"
                          ? t("confirmRestoreChairBtn")
                          : t("confirmUnblockBtn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
