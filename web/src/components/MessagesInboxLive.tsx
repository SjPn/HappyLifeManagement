"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MessagesInbox,
  type ConversationRow,
} from "@/components/MessagesInbox";
import { requestNotificationRefresh } from "@/lib/notificationRefresh";

export function MessagesInboxLive({
  initial,
}: {
  initial: ConversationRow[];
}) {
  const [conversations, setConversations] = useState(initial);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/conversations", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { conversations?: ConversationRow[] };
      if (Array.isArray(data.conversations)) {
        setConversations(data.conversations);
        requestNotificationRefresh();
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5_000);
    return () => clearInterval(id);
  }, [refresh]);

  return <MessagesInbox conversations={conversations} />;
}
