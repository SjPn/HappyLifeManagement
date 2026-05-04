"use client";

import { updateTicketStatus } from "@/actions/tickets";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

const statuses = ["NEW", "IN_PROGRESS", "RESOLVED"] as const;

export function TicketStatusForm({
  ticketId,
  current,
}: {
  ticketId: string;
  current: string;
}) {
  const router = useRouter();
  const t = useTranslations("requests");
  const ts = useTranslations("categories.ticketStatus");
  const [loading, setLoading] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value;
    setLoading(true);
    await updateTicketStatus(ticketId, status);
    setLoading(false);
    router.refresh();
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-zinc-500">{t("status")}:</span>
      <select
        defaultValue={current}
        disabled={loading}
        onChange={onChange}
        className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-900"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {ts(s)}
          </option>
        ))}
      </select>
    </label>
  );
}
