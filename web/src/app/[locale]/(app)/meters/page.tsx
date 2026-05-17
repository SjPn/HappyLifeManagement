import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

/** Старий маршрут — редірект на «Мої платежі». */
export default async function MetersRedirectPage() {
  const locale = await getLocale();
  redirect(`/${locale}/payments`);
}
