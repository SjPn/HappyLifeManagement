"use client";

import { ChairDashboardHub } from "@/components/ChairDashboardHub";
import type { ChairDashboardStats } from "@/lib/chairDashboard";

export function ChairDashboardActions({
  stats,
  paymentsLabel,
  isChair = true,
}: {
  stats: ChairDashboardStats;
  paymentsLabel?: string;
  isChair?: boolean;
}) {
  return (
    <ChairDashboardHub
      stats={stats}
      isChair={isChair}
      paymentsLabel={paymentsLabel}
    />
  );
}
