"use client";

import { HubActionCard } from "@/components/hub/hubUi";
import { useNotifications } from "@/components/NotificationProvider";
import { CreditCard } from "lucide-react";

export function PaymentsReminderCard({
  title,
  description,
  periodLabel,
}: {
  title: string;
  description: string;
  periodLabel: string;
}) {
  const { counts } = useNotifications();

  return (
    <div className="mt-5">
      <HubActionCard
        href="/payments"
        icon={CreditCard}
        title={title}
        description={`${periodLabel} · ${description}`}
        badge={counts.payments}
        tone="emerald"
      />
    </div>
  );
}
