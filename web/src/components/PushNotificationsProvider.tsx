"use client";

import { useRouter } from "@/i18n/navigation";
import { isCapacitorNative } from "@/lib/capacitorNative";
import { useEffect, useRef } from "react";

async function registerToken(token: string) {
  await fetch("/api/push/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, platform: "android" }),
  });
}

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

  useEffect(() => {
    if (!isCapacitorNative()) return;

    let cancelled = false;
    const listeners: { remove: () => void }[] = [];

    (async () => {
      try {
        const { PushNotifications } = await import(
          "@capacitor/push-notifications"
        );

        const perm = await PushNotifications.requestPermissions();
        if (perm.receive !== "granted" || cancelled) return;

        listeners.push(
          await PushNotifications.addListener("registration", (ev) => {
            tokenRef.current = ev.value;
            void registerToken(ev.value);
          }),
        );

        listeners.push(
          await PushNotifications.addListener("registrationError", (err) => {
            console.warn("[push] registrationError", err);
          }),
        );

        listeners.push(
          await PushNotifications.addListener(
            "pushNotificationActionPerformed",
            (action) => {
              const path = action.notification.data?.path;
              if (typeof path === "string" && path.startsWith("/")) {
                router.push(path);
              }
            },
          ),
        );

        await PushNotifications.register();
      } catch (e) {
        console.warn("[push] setup failed", e);
      }
    })();

    return () => {
      cancelled = true;
      for (const l of listeners) l.remove();
      const t = tokenRef.current;
      if (t) void unregisterToken(t);
    };
  }, [router]);

  return <>{children}</>;
}
