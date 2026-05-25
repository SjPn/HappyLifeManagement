"use client";

import { HubActionCard } from "@/components/hub/hubUi";
import { useNotifications } from "@/components/NotificationProvider";
import { Check, Wallet } from "lucide-react";

export function PaymentsReminderCard({
  title,
  description,
  periodLabel,
  paid,
}: {
  title: string;
  description: string;
  periodLabel: string;
  paid: boolean;
}) {
  const { counts } = useNotifications();

  return (
    <div className="mt-5">
      <HubActionCard
        href="/payments"
        icon={Wallet}
        title={title}
        description={
          paid ? (
            <span className="inline-flex flex-wrap items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-300">
              <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
              <span>
                {periodLabel} · {description}
              </span>
            </span>
          ) : (
            `${periodLabel} · ${description}`
          )
        }
        badge={paid ? 0 : counts.payments}
        tone={paid ? "emerald" : "amber"}
      />
    </div>
  );
}
