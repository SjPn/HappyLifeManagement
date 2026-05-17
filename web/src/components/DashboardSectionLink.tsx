"use client";

import { Link } from "@/i18n/navigation";
import { NotificationBadge } from "@/components/NotificationBadge";
import { useNotifications } from "@/components/NotificationProvider";
import type { NotificationCounts } from "@/lib/notifications";

type CountKey = keyof Pick<
  NotificationCounts,
  "votes" | "tickets" | "payments"
>;

export function DashboardSectionLink({
  href,
  children,
  countKey,
  className,
}: {
  href: "/votes" | "/requests" | "/payments";
  children: React.ReactNode;
  countKey: CountKey;
  className: string;
}) {
  const { counts } = useNotifications();
  const count = counts[countKey];

  return (
    <Link href={href} className={`${className} relative inline-flex items-center gap-2`}>
      {children}
      {count > 0 && <NotificationBadge count={count} inline />}
    </Link>
  );
}
