import { signIn, signOut } from "@/auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  demoAutoLoginPassword,
  demoEmailForRole,
  isDemoEnabled,
  type DemoRoleKey,
} from "@/lib/demo";

export type DemoEnterError =
  | "disabled"
  | "invalid_role"
  | "sign_in_failed"
  | "user_missing"
  | "password_mismatch"
  | "community_blocked";

export type DemoDbCheck = {
  userFound: boolean;
  bcryptOk: boolean;
  communityBlocked: boolean;
  status: string | null;
};

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export async function checkDemoDbForRole(
  role: DemoRoleKey,
): Promise<DemoDbCheck> {
  const email = demoEmailForRole(role);
  if (!email) {
    return {
      userFound: false,
      bcryptOk: false,
      communityBlocked: false,
      status: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { community: { select: { blockedAt: true } } },
  });

  if (!user) {
    return {
      userFound: false,
      bcryptOk: false,
      communityBlocked: false,
      status: null,
    };
  }

  const bcryptOk = await bcrypt.compare(
    demoAutoLoginPassword(),
    user.passwordHash,
  );

  return {
    userFound: true,
    bcryptOk,
    communityBlocked: Boolean(user.community?.blockedAt),
    status: user.status,
  };
}

/** Demo login via Auth.js (use from Route Handler GET so cookies attach correctly). */
export async function performDemoSignIn(
  role: DemoRoleKey,
  redirectTo: string,
): Promise<{ error?: DemoEnterError }> {
  if (!isDemoEnabled()) return { error: "disabled" };

  const email = demoEmailForRole(role);
  if (!email) return { error: "invalid_role" };

  const db = await checkDemoDbForRole(role);
  if (!db.userFound) return { error: "user_missing" };
  if (!db.bcryptOk) return { error: "password_mismatch" };
  if (db.communityBlocked) return { error: "community_blocked" };

  try {
    await signOut({ redirect: false });
  } catch {
    /* no session */
  }

  try {
    await signIn("credentials", {
      email,
      password: demoAutoLoginPassword(),
      redirectTo,
    });
    return {};
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    console.error("[demo] signIn failed:", error);
    return { error: "sign_in_failed" };
  }
}
