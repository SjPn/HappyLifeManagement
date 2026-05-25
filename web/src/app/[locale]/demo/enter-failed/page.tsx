import { DemoEnterFailed } from "../enter/[role]/DemoEnterFailed";
import {
  checkDemoDbForRole,
  type DemoEnterError,
} from "@/lib/demoEnter";
import { demoPasswordDiagnostics, type DemoRoleKey } from "@/lib/demo";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const roles = new Set<string>(["chair", "resident", "tenant"]);
const reasons = new Set<string>([
  "sign_in_failed",
  "user_missing",
  "password_mismatch",
  "community_blocked",
  "disabled",
  "invalid_role",
]);

export default async function DemoEnterFailedPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ role?: string; reason?: string }>;
}) {
  await params;
  const { locale } = await params;
  const sp = await searchParams;
  const role = sp.role ?? "chair";
  const reason = (sp.reason ?? "sign_in_failed") as DemoEnterError;

  if (!roles.has(role)) notFound();
  if (!reasons.has(reason)) notFound();

  if (reason === "disabled" || reason === "invalid_role") {
    redirect(`/${locale}`);
  }

  const dbCheck = await checkDemoDbForRole(role as DemoRoleKey);

  return (
    <DemoEnterFailed
      reason={reason}
      diagnostics={demoPasswordDiagnostics()}
      dbCheck={dbCheck}
    />
  );
}
