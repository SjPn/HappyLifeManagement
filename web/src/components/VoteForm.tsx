"use client";

import { submitVote } from "@/actions/votes";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { primaryButtonClass } from "@/lib/formStyles";

export function VoteForm({
  voteId,
  options,
  disabled,
}: {
  voteId: string;
  options: { id: string; text: string }[];
  disabled?: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("votes");
  const te = useTranslations("errors");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [thanks, setThanks] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setThanks(false);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await submitVote(form);
    setLoading(false);
    if (res && "error" in res && res.error) {
      setError(te(res.error));
      return;
    }
    setThanks(true);
    router.refresh();
    window.setTimeout(() => setThanks(false), 4000);
  }

  return (
    <form onSubmit={onSubmit} className="relative flex flex-col gap-4">
      <input type="hidden" name="voteId" value={voteId} />
      <div className="flex flex-col gap-2">
        {options.map((o) => (
          <label
            key={o.id}
            className="hl-glass flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 transition has-checked:border-blue-400/60 has-checked:bg-blue-50/50 dark:has-checked:bg-blue-950/30"
          >
            <input
              type="radio"
              name="optionId"
              value={o.id}
              required
              disabled={disabled || loading}
              className="h-4 w-4 accent-blue-600"
            />
            <span className="text-sm font-medium">{o.text}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={disabled || loading}
        className={primaryButtonClass}
      >
        {loading
          ? t("saving")
          : disabled
            ? t("ballotClosed")
            : t("submitVote")}
      </button>
      {thanks && (
        <p
          role="status"
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-emerald-200/80 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-900 shadow-lg dark:border-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-100"
        >
          {t("voteThanks")}
        </p>
      )}
    </form>
  );
}
