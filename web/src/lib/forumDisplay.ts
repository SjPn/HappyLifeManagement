import { isStaffRole } from "@/lib/audience";

export function canSeeForumTopicAuthor(
  isAnonymous: boolean,
  viewerRole: string,
): boolean {
  return !isAnonymous || isStaffRole(viewerRole);
}

export function forumTopicAuthorLabel(
  topic: { isAnonymous: boolean; user: { name: string } },
  viewerRole: string,
  anonymousLabel: string,
): string {
  if (canSeeForumTopicAuthor(topic.isAnonymous, viewerRole)) {
    return topic.user.name;
  }
  return anonymousLabel;
}

export function forumPostAuthorLabel(
  topic: { isAnonymous: boolean; userId: string },
  post: { userId: string; user: { name: string } },
  viewerRole: string,
  anonymousLabel: string,
): string {
  if (
    topic.isAnonymous &&
    post.userId === topic.userId &&
    !isStaffRole(viewerRole)
  ) {
    return anonymousLabel;
  }
  return post.user.name;
}
