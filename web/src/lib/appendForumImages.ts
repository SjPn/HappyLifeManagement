/** Append selected photos to FormData for forum server actions. */
export function appendForumImages(fd: FormData, files: File[]): void {
  fd.delete("images");
  for (const file of files) {
    fd.append("images", file);
  }
}
