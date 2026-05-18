"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";
import { useTranslations } from "next-intl";

type EditorAction = (formData: FormData) => Promise<
  { ok: true } | { error: string } | undefined
>;

export function CommunityContentEditor({
  kind,
  initialBody,
  initialVersion,
  saveAction,
  publicHref,
}: {
  kind: "memorandum" | "tariffs";
  initialBody: string | null;
  initialVersion?: string | null;
  saveAction: EditorAction;
  publicHref: "/info/memorandum" | "/info/tariffs";
}) {
  const t = useTranslations("chair");
  const router = useRouter();
  const [body, setBody] = useState(initialBody ?? "");
  const [version, setVersion] = useState(initialVersion ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    const fd = new FormData();
    fd.set("body", body);
    if (kind === "memorandum") fd.set("version", version);
    const res = await saveAction(fd);
    setLoading(false);
    if (!res || "error" in res) {
      setError(t("contentErrors.generic"));
      return;
    }
    setSaved(true);
    router.refresh();
  }

  const hint =
    kind === "memorandum" ? t("memorandumEditHint") : t("tariffsEditHint");

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{hint}</p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {kind === "memorandum" && (
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>{t("contentVersionLabel")}</span>
            <input
              name="version"
              value={version}
              onChange={(e) => {
                setVersion(e.target.value);
                setSaved(false);
              }}
              className={inputClass}
              placeholder={t("contentVersionPlaceholder")}
            />
          </label>
        )}
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>{t("contentBodyLabel")}</span>
          <textarea
            name="body"
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setSaved(false);
            }}
            rows={14}
            className={`${inputClass} min-h-[12rem] resize-y font-mono text-sm`}
            placeholder={t("contentBodyPlaceholder")}
          />
        </label>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {saved && (
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            {t("contentSaved")}
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={loading}
            className={primaryButtonClass}
          >
            {loading ? t("contentSaving") : t("contentSave")}
          </button>
          <Link
            href={publicHref}
            target="_blank"
            className="text-center text-sm font-medium text-blue-700 hover:underline dark:text-blue-400"
          >
            {t("viewPublicPage")}
          </Link>
        </div>
      </form>
    </div>
  );
}
