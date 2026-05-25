"use server";

import { signIn, signOut } from "@/auth";
import {
  demoEmailForRole,
  demoAutoLoginPassword,
  isDemoEnabled,
  type DemoRoleKey,
} from "@/lib/demo";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export async function enterDemoAsRole(role: DemoRoleKey) {
  if (!isDemoEnabled()) {
    return { error: "disabled" as const };
  }

  const email = demoEmailForRole(role);
  if (!email) {
    return { error: "invalid_role" as const };
  }

  const locale = await getLocale();

  try {
    await signOut({ redirect: false });
  } catch {
    /* no session */
  }

  const result = await signIn("credentials", {
    email,
    password: demoAutoLoginPassword(),
    redirect: false,
  });

  if (result?.error) {
    return { error: "sign_in_failed" as const };
  }

  redirect(`/${locale}/dashboard`);
}

export async function exitDemoToLanding() {
  const locale = await getLocale();
  try {
    await signOut({ redirect: false });
  } catch {
    /* ignore */
  }
  redirect(`/${locale}`);
}
