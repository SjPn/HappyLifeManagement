"use client";

import { useRouter } from "@/i18n/navigation";
import { isCapacitorNative } from "@/lib/capacitorNative";
import { isNativePushEnabled } from "@/lib/push/nativePushEnabled";
import { setupNativePush } from "@/lib/push/setupNativePush";
import { useEffect, useRef } from "react";

async function unregisterToken(token: string) {
  await fetch("/api/push/register", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token }),
  });
}

export function PushNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const tokenRef = useRef<string | null>(null);
  const teardownRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isCapacitorNative() || !isNativePushEnabled()) return;

    let cancelled = false;

    (async () => {
      try {
        const teardown = await setupNativePush(router, (token) => {
          tokenRef.current = token;
        });
        if (cancelled) {
          teardown();
          return;
        }
        teardownRef.current = teardown;
      } catch (e) {
        console.warn("[push] setup failed", e);
      }
    })();

    return () => {
      cancelled = true;
      teardownRef.current?.();
      teardownRef.current = null;
      const t = tokenRef.current;
      if (t) void unregisterToken(t);
    };
  }, [router]);

  return <>{children}</>;
}
