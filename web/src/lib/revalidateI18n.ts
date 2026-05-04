import { revalidatePath } from "next/cache";
import { routing } from "@/i18n/routing";

/** pathWithoutLocale: напр. "/requests" або "/community/forum/abc" */
export function revalidateAllLocales(pathWithoutLocale: string) {
  const p = pathWithoutLocale.startsWith("/")
    ? pathWithoutLocale
    : `/${pathWithoutLocale}`;
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}${p}`);
  }
}
