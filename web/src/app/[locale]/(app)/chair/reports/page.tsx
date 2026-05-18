import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function ChairReportsRedirectPage() {
  const locale = await getLocale();
  redirect(`/${locale}/chair/moderation`);
}
