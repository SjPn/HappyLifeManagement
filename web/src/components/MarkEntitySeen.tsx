"use client";

import { markEntitySeenAction } from "@/actions/entitySeen";
import { useNotifications } from "@/components/NotificationProvider";
import { NOTIFICATIONS_REFRESH_EVENT } from "@/lib/notificationRefresh";
import { useEffect, useRef } from "react";

export function MarkEntitySeen({
  entityType,
  entityId,
}: {
  entityType: "forum_topic" | "ticket";
  entityId: string;
}) {
  const { refresh } = useNotifications();
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !entityId) return;
    done.current = true;
    (async () => {
      await markEntitySeenAction(entityType, entityId);
      await refresh();
      window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT));
    })();
  }, [entityType, entityId, refresh]);

  return null;
}
