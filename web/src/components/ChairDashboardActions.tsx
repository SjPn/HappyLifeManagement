"use client";

import { ButtonLink } from "@/components/Ui";
import { NotificationBadge } from "@/components/NotificationBadge";
import { useNotifications } from "@/components/NotificationProvider";
import { ChairManagementLinks } from "@/components/ChairManagementLinks";

export function ChairDashboardActions({
  paymentsLabel,
}: {
  paymentsLabel: string;
}) {
  const { counts } = useNotifications();

  return (
    <div className="mt-3 flex flex-col gap-3">
      <span className="relative block">
        <ButtonLink href="/payments" className="w-full justify-center">
          {paymentsLabel}
        </ButtonLink>
        {counts.payments > 0 && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <NotificationBadge count={counts.payments} />
          </span>
        )}
      </span>
      <ChairManagementLinks isChair />
    </div>
  );
}
