"use client";

import { rateTicket } from "@/actions/tickets";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Star } from "lucide-react";

export function TicketRatingForm({
  ticketId,
  initialRating,
}: {
  ticketId: string;
  initialRating: number | null;
}) {
  const t = useTranslations("requests");
  const te = useTranslations("errors");
  const router = useRouter();
  const [rating, setRating] = useState(initialRating ?? 0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(initialRating != null);

  async function submit(value: number) {
    setLoading(true);
    setError(null);
    const res = await rateTicket(ticketId, value);
    setLoading(false);
    if (res && "error" in res && res.error) {
      setError(te(res.error));
      return;
    }
    setRating(value);
    setSaved(true);
    router.refresh();
  }

  if (saved) {
    return (
      <p className="mt-4 text-sm text-green-700 dark:text-green-400">
        {t("ratingThanks", { rating: initialRating ?? rating })}
      </p>
    );
  }

  return (
    <div className="mt-5 rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 dark:border-amber-900/50 dark:bg-amber-950/40">
      <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
        {t("ratingTitle")}
      </p>
      <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-200/80">
        {t("ratingHint")}
      </p>
      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={loading}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => submit(n)}
            className="rounded-lg p-1 transition hover:scale-110 disabled:opacity-50"
            aria-label={t("ratingStar", { n })}
          >
            <Star
              className={`h-8 w-8 ${
                n <= (hover || rating)
                  ? "fill-amber-400 text-amber-500"
                  : "text-zinc-300 dark:text-zinc-600"
              }`}
            />
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
