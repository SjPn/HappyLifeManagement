"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { updateCommunityInviteCode } from "@/actions/chair";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";
import { useTranslations } from "next-intl";

export function ChairInviteCodeForm({ currentCode }: { currentCode: string }) {
  const t = useTranslations("profile");
  const router = useRouter();
  const [code, setCode] = useState(currentCode);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    const fd = new FormData();
    fd.set("inviteCode", code);
    const res = await updateCommunityInviteCode(fd);
    setLoading(false);
    if (!res || "error" in res) {
      setError(t(`inviteErrors.${res?.error ?? "generic"}`));
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("inviteHint")}</p>
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t("inviteLabel")}</span>
        <input
          name="inviteCode"
          required
          minLength={4}
          maxLength={32}
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setSaved(false);
          }}
          className={inputClass}
          autoComplete="off"
        />
      </label>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {saved && (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          {t("inviteSaved")}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || code === currentCode}
        className={primaryButtonClass}
      >
        {loading ? t("inviteSaving") : t("inviteSave")}
      </button>
    </form>
  );
}
