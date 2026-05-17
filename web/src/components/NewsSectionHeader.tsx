"use client";

import { NotificationBadge } from "@/components/NotificationBadge";
import { useNotifications } from "@/components/NotificationProvider";

export function NewsSectionHeader({
  title,
  className,
}: {
  title: string;
  className: string;
}) {
  const { counts } = useNotifications();

  return (
    <h2 className={`${className} flex items-center gap-2`}>
      {title}
      {counts.news > 0 && <NotificationBadge count={counts.news} />}
    </h2>
  );
}
