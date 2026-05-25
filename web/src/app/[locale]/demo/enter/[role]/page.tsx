import { DemoEnterFailed } from "./DemoEnterFailed";
import { performDemoEnter } from "@/lib/demoEnter";
import { isDemoEnabled, type DemoRoleKey } from "@/lib/demo";
import { getLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

const roles = new Set<string>(["chair", "resident", "tenant"]);

export default async function DemoEnterPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  if (!isDemoEnabled()) notFound();

  const { role } = await params;
  if (!roles.has(role)) notFound();

  const result = await performDemoEnter(role as DemoRoleKey);
  if (result.error === "sign_in_failed") {
    return <DemoEnterFailed />;
  }
  if (result.error) notFound();

  const locale = await getLocale();
  redirect(`/${locale}/dashboard`);
}
