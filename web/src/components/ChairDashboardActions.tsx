"use client";

import { ChairManagementLinks } from "@/components/ChairManagementLinks";

export function ChairDashboardActions({
  paymentsLabel,
}: {
  paymentsLabel: string;
}) {
  return (
    <div className="mt-3">
      <ChairManagementLinks isChair paymentsLabel={paymentsLabel} />
    </div>
  );
}
