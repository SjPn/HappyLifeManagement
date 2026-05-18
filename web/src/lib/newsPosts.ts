export function newsPostListInclude(userId: string) {
  return {
    author: { select: { name: true } },
    likes: { where: { userId }, select: { id: true } },
    _count: { select: { likes: true } },
  } as const;
}

export type NewsPostListRow = {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  createdAt: Date;
  author: { name: string };
  likes: { id: string }[];
  _count: { likes: number };
};

const POPULAR_LIKE_THRESHOLD = 5;

export function newsPostCardProps(
  post: NewsPostListRow,
  dateLabel: string,
  canLike: boolean,
  popularLabel?: string | null,
) {
  const likeCount = post._count.likes;
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    imageUrl: post.imageUrl,
    authorName: post.author.name,
    dateLabel,
    likeCount,
    likedByMe: post.likes.length > 0,
    canLike,
    popularLabel:
      likeCount >= POPULAR_LIKE_THRESHOLD ? (popularLabel ?? null) : null,
  };
}
