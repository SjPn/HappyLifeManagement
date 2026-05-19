/**
 * Native FCM in Capacitor requires google-services.json in the Android project.
 * Until Firebase is configured, keep this false to avoid crashes after permission grant.
 */
export function isNativePushEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_NATIVE_PUSH === "true";
}
