import { enterDemoAsRole } from "@/actions/demo";
import { isDemoEnabled, type DemoRoleKey } from "@/lib/demo";
import { notFound } from "next/navigation";

const roles = new Set<string>(["chair", "resident", "tenant"]);

export default async function DemoEnterPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  if (!isDemoEnabled()) notFound();

  const { role } = await params;
  if (!roles.has(role)) notFound();

  const result = await enterDemoAsRole(role as DemoRoleKey);
  if (result?.error === "sign_in_failed") {
    throw new Error(
      "Demo login failed. Run: npm run db:seed (and set DEMO_AUTO_LOGIN_PASSWORD if used on server).",
    );
  }
  if (result?.error) notFound();
}
