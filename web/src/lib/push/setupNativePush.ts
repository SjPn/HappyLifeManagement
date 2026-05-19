export type PushTeardown = () => void;

type AppRouter = { push: (href: string) => void };

async function registerToken(token: string) {
  await fetch("/api/push/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, platform: "android" }),
  });
}

/** Request permission, register FCM token, listen for notification taps. */
export async function setupNativePush(
  router: AppRouter,
  onToken: (token: string) => void,
): Promise<PushTeardown> {
  const { PushNotifications } = await import("@capacitor/push-notifications");

  const listeners: { remove: () => void }[] = [];

  listeners.push(
    await PushNotifications.addListener("registration", (ev) => {
      onToken(ev.value);
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

  const perm = await PushNotifications.requestPermissions();
  if (perm.receive === "granted") {
    await PushNotifications.register();
  }

  return () => {
    for (const l of listeners) l.remove();
  };
}
