"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { NotificationCounts } from "@/lib/notifications";

const empty: NotificationCounts = {
  news: 0,
  votes: 0,
  tickets: 0,
  payments: 0,
  board: 0,
  forum: 0,
  reports: 0,
  home: 0,
  requests: 0,
  community: 0,
};

const NotificationContext = createContext<{
  counts: NotificationCounts;
  refresh: () => Promise<void>;
}>({ counts: empty, refresh: async () => {} });

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [counts, setCounts] = useState<NotificationCounts>(empty);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/counts", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as NotificationCounts;
        setCounts(data);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 45_000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  return (
    <NotificationContext.Provider value={{ counts, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
