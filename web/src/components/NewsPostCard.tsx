import { HubContentCard } from "@/components/hub/hubUi";
import { NewsLikeButton } from "@/components/NewsLikeButton";
import { Newspaper } from "lucide-react";

export function NewsPostCard({
  id,
  title,
  body,
  imageUrl,
  authorName,
  dateLabel,
  likeCount,
  likedByMe,
  canLike,
  popularLabel,
}: {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  authorName: string;
  dateLabel: string;
  likeCount: number;
  likedByMe: boolean;
  canLike: boolean;
  popularLabel?: string | null;
}) {
  return (
    <HubContentCard>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 text-white shadow-md shadow-blue-500/25">
          <Newspaper className="h-5 w-5" strokeWidth={2.25} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </p>
            {popularLabel && (
              <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
                🔥 {popularLabel}
              </span>
            )}
          </div>
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="mt-3 max-h-56 w-full rounded-xl object-cover ring-1 ring-black/5 dark:ring-white/10"
            />
          )}
          <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
            {body}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              {authorName} · {dateLabel}
            </p>
            {canLike ? (
              <NewsLikeButton
                newsPostId={id}
                initialLiked={likedByMe}
                initialCount={likeCount}
              />
            ) : (
              likeCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                  <span aria-hidden>❤️</span>
                  <span>{likeCount}</span>
                </span>
              )
            )}
          </div>
        </span>
      </div>
    </HubContentCard>
  );
}
