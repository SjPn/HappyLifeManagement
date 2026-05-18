import { Card } from "@/components/Ui";
import { NewsLikeButton } from "@/components/NewsLikeButton";

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
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium">{title}</p>
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
          className="mt-3 max-h-72 w-full rounded-xl object-cover ring-1 ring-black/5 dark:ring-white/10"
        />
      )}
      <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
        {body}
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-zinc-500">
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
    </Card>
  );
}
