"use client";

import { Link } from "@/i18n/navigation";
import { Card } from "@/components/Ui";
import { NotificationBadge } from "@/components/NotificationBadge";
import { useNotifications } from "@/components/NotificationProvider";

export function PaymentsReminderCard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { counts } = useNotifications();

  return (
    <Link href="/payments" className="mt-3 block">
      <Card className="relative transition hover:border-blue-300 hover:bg-blue-50/30 dark:hover:border-blue-800 dark:hover:bg-blue-950/20">
        {counts.payments > 0 && (
          <span className="absolute right-3 top-3">
            <NotificationBadge count={counts.payments} />
          </span>
        )}
        {children}
      </Card>
    </Link>
  );
}
