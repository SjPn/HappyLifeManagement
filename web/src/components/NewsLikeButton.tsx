"use client";

import { toggleNewsLike } from "@/actions/newsLikes";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

export function NewsLikeButton({
  newsPostId,
  initialLiked,
  initialCount,
}: {
  newsPostId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const router = useRouter();
  const t = useTranslations("newsLikes");
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();
  const [burst, setBurst] = useState(false);

  function onClick() {
    startTransition(async () => {
      const res = await toggleNewsLike(newsPostId);
      if (!res || "error" in res) return;
      setLiked(res.liked);
      setCount(res.likeCount);
      if (res.liked) {
        setBurst(true);
        window.setTimeout(() => setBurst(false), 450);
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={liked}
      aria-label={liked ? t("unlikeAria") : t("likeAria")}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:opacity-60 ${
        liked
          ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200 dark:hover:bg-rose-950"
          : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-rose-200 hover:bg-rose-50/80 hover:text-rose-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-rose-900 dark:hover:bg-rose-950/30 dark:hover:text-rose-200"
      } ${burst ? "scale-110" : "scale-100"}`}
    >
      <span
        className={`text-base leading-none transition-transform ${burst ? "animate-pulse" : ""}`}
        aria-hidden
      >
        {liked ? "❤️" : "🤍"}
      </span>
      <span>{t("count", { count })}</span>
    </button>
  );
}
