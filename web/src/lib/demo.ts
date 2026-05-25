import { Role, UserStatus } from "@/lib/enums";
import { TenancyType } from "@/lib/audience";

export const DEMO_COMMUNITY_ID = "cm_demo_preview";

export type DemoRoleKey = "chair" | "resident" | "tenant";

const DEMO_EMAILS: Record<DemoRoleKey, string> = {
  chair: "demo-chair@preview.happylife.estate",
  resident: "demo-owner@preview.happylife.estate",
  tenant: "demo-tenant@preview.happylife.estate",
};

/** Включено, если явно не DEMO_ENABLED=false */
export function isDemoEnabled(): boolean {
  return process.env.DEMO_ENABLED !== "false";
}

function normalizeDemoPassword(raw: string | undefined): string {
  if (!raw) return "";
  let v = raw.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v.replace(/\r/g, "");
}

export function demoAutoLoginPassword(): string {
  const fromEnv = normalizeDemoPassword(process.env.DEMO_AUTO_LOGIN_PASSWORD);
  if (fromEnv) return fromEnv;
  return "happylife-demo-preview-local";
}

/** Safe hints for the failed-demo page (no full secret). */
export function demoPasswordDiagnostics() {
  const raw = process.env.DEMO_AUTO_LOGIN_PASSWORD;
  const normalized = normalizeDemoPassword(raw);
  const usingFallback = !normalized;
  const pwd = demoAutoLoginPassword();
  return {
    usingFallback,
    configured: Boolean(raw?.trim()),
    length: pwd.length,
    prefix: pwd.slice(0, 2),
    suffix: pwd.slice(-2),
  };
}

export function demoEmailForRole(role: string): string | null {
  if (role === "chair" || role === "resident" || role === "tenant") {
    return DEMO_EMAILS[role];
  }
  return null;
}

export function isDemoEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return Object.values(DEMO_EMAILS).includes(email.toLowerCase());
}

export function isDemoCommunityId(communityId: string | null | undefined): boolean {
  return communityId === DEMO_COMMUNITY_ID;
}

export function isDemoSessionUser(user: {
  email?: string | null;
  communityId?: string | null;
}): boolean {
  return (
    isDemoEmail(user.email) || isDemoCommunityId(user.communityId ?? null)
  );
}

export const demoUserSpecs = [
  {
    key: "chair" as const,
    email: DEMO_EMAILS.chair,
    name: "Олена Председателева",
    role: Role.CHAIR,
    tenancyType: TenancyType.OWNER,
    street: "Лісова",
    houseNumber: "1",
  },
  {
    key: "resident" as const,
    email: DEMO_EMAILS.resident,
    name: "Сергій Власник",
    role: Role.RESIDENT,
    tenancyType: TenancyType.OWNER,
    street: "Лісова",
    houseNumber: "8",
  },
  {
    key: "tenant" as const,
    email: DEMO_EMAILS.tenant,
    name: "Марія Орендар",
    role: Role.RESIDENT,
    tenancyType: TenancyType.TENANT,
    street: "Березова",
    houseNumber: "12",
  },
] as const;

export function demoRoleFromEmail(
  email: string | null | undefined,
): DemoRoleKey | null {
  if (!email) return null;
  const e = email.toLowerCase();
  for (const spec of demoUserSpecs) {
    if (spec.email === e) return spec.key;
  }
  return null;
}

export function isDemoApprovedUser(user: {
  email?: string | null;
  status?: string | null;
}): boolean {
  return isDemoEmail(user.email) && user.status === UserStatus.APPROVED;
}
