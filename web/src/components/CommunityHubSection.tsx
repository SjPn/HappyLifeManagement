"use client";

import { CommunityHubList } from "./CommunityHubCard";
import { useNotifications } from "@/components/NotificationProvider";
import type { NotificationCounts } from "@/lib/notifications";

type CountKey = keyof Pick<NotificationCounts, "board" | "forum" | "reports">;

export function CommunityHubSection({
  items,
}: {
  items: {
    href: string;
    title: string;
    desc: string;
    countKey?: CountKey;
  }[];
}) {
  const { counts } = useNotifications();

  return (
    <CommunityHubList
      items={items.map((item) => ({
        href: item.href,
        title: item.title,
        desc: item.desc,
        count: item.countKey ? counts[item.countKey] : 0,
      }))}
    />
  );
}
