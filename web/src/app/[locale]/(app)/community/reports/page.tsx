import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function ReportsRedirectPage() {
  const locale = await getLocale();
  redirect(`/${locale}/community/forum`);
}
