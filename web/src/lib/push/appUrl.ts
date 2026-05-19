/** Public site origin for deep links in push payloads. */
export function getAppBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "https://hlm-nu.vercel.app";
  return raw.replace(/\/$/, "");
}
