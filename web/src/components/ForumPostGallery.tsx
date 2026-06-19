import { forumPostImageUrls, type ForumPostWithImages } from "@/lib/forumPostImages";

function ForumGalleryImage({
  url,
  className,
}: {
  url: string;
  className: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-xl ring-1 ring-black/5"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className={className} />
    </a>
  );
}

export function ForumPostGallery({ post }: { post: ForumPostWithImages }) {
  const urls = forumPostImageUrls(post);
  if (urls.length === 0) return null;

  if (urls.length === 1) {
    return (
      <ForumGalleryImage
        url={urls[0]}
        className="mt-3 max-h-96 w-full rounded-xl object-contain"
      />
    );
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {urls.map((url) => (
        <ForumGalleryImage
          key={url}
          url={url}
          className="aspect-square h-32 w-full object-cover sm:h-36"
        />
      ))}
    </div>
  );
}
