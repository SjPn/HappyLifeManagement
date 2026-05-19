/** True when running inside the Capacitor Android/iOS shell (not mobile browser). */
export function isCapacitorNative(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (
    window as unknown as {
      Capacitor?: { isNativePlatform?: () => boolean };
    }
  ).Capacitor;
  return cap?.isNativePlatform?.() ?? false;
}
