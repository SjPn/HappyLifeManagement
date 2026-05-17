"use client";

import { markSeen } from "@/actions/notifications";
import type { NotificationScope } from "@/lib/notifications";
import { useNotifications } from "@/components/NotificationProvider";
import { useEffect, useRef } from "react";

export function MarkNotificationsSeen({
  scopes,
}: {
  scopes: NotificationScope[];
}) {
  const { refresh } = useNotifications();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    (async () => {
      for (const scope of scopes) {
        await markSeen(scope);
      }
      await refresh();
    })();
  }, [scopes, refresh]);

  return null;
}
