"use client";

import { Link } from "@/i18n/navigation";
import { Card } from "@/components/Ui";
import { NotificationBadge } from "@/components/NotificationBadge";
export function CommunityHubCard({
  href,
  title,
  desc,
  count,
}: {
  href: string;
  title: string;
  desc: string;
  count: number;
}) {
  return (
    <Link href={href}>
      <Card className="relative transition hover:border-emerald-300">
        {count > 0 && (
          <span className="absolute right-3 top-3">
            <NotificationBadge count={count} />
          </span>
        )}
        <p className="font-semibold text-emerald-800 dark:text-emerald-200">
          {title}
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{desc}</p>
      </Card>
    </Link>
  );
}

export function CommunityHubList({
  items,
}: {
  items: { href: string; title: string; desc: string; count: number }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <CommunityHubCard
          key={item.href}
          href={item.href}
          title={item.title}
          desc={item.desc}
          count={item.count}
        />
      ))}
    </div>
  );
}
