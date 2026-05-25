import { signIn, signOut } from "@/auth";
import {
  demoAutoLoginPassword,
  demoEmailForRole,
  isDemoEnabled,
  type DemoRoleKey,
} from "@/lib/demo";

export type DemoEnterError = "disabled" | "invalid_role" | "sign_in_failed";

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

/** Server-only demo login (no redirect — call redirect from the route page). */
export async function performDemoEnter(
  role: DemoRoleKey,
): Promise<{ error?: DemoEnterError }> {
  if (!isDemoEnabled()) return { error: "disabled" };

  const email = demoEmailForRole(role);
  if (!email) return { error: "invalid_role" };

  try {
    await signOut({ redirect: false });
  } catch {
    /* no session */
  }

  try {
    const result = await signIn("credentials", {
      email,
      password: demoAutoLoginPassword(),
      redirect: false,
    });
    if (result?.error) return { error: "sign_in_failed" };
    return {};
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    // Auth.js v5 throws on failed credentials instead of returning { error }.
    console.error("[demo] signIn failed:", error);
    return { error: "sign_in_failed" };
  }
}

export async function performDemoExit(): Promise<void> {
  try {
    await signOut({ redirect: false });
  } catch {
    /* ignore */
  }
}
