export type ForumPostWithImages = {
  imageUrl: string | null;
  images: { imageUrl: string; sortOrder: number }[];
};

/** Ordered URLs: relation first, then legacy imageUrl if no rows yet. */
export function forumPostImageUrls(post: ForumPostWithImages): string[] {
  if (post.images.length > 0) {
    return [...post.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i) => i.imageUrl);
  }
  return post.imageUrl ? [post.imageUrl] : [];
}
