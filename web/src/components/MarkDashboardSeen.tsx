"use client";

import { markDashboardSeenAction } from "@/actions/entitySeen";
import { useNotifications } from "@/components/NotificationProvider";
import { NOTIFICATIONS_REFRESH_EVENT } from "@/lib/notificationRefresh";
import { useEffect, useRef } from "react";

/** Позначає прочитаним те, що житель уже бачить на головній (блок «Важливе» + стрічка новин). */
export function MarkDashboardSeen({
  newsIds,
  ticketIds,
  voteId,
}: {
  newsIds: string[];
  ticketIds: string[];
  voteId?: string | null;
}) {
  const { refresh } = useNotifications();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    const hasWork =
      newsIds.length > 0 || ticketIds.length > 0 || Boolean(voteId);
    if (!hasWork) return;
    done.current = true;

    (async () => {
      await markDashboardSeenAction({ newsIds, ticketIds, voteId });
      await refresh();
      window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT));
    })();
  }, [newsIds, ticketIds, voteId, refresh]);

  return null;
}
