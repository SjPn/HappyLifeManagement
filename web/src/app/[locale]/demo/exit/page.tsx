import { performDemoExit } from "@/lib/demoEnter";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function DemoExitPage() {
  await performDemoExit();
  const locale = await getLocale();
  redirect(`/${locale}`);
}
