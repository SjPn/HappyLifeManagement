import { performDemoSignIn, type DemoEnterError } from "@/lib/demoEnter";
import { isDemoEnabled, type DemoRoleKey } from "@/lib/demo";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const roles = new Set<string>(["chair", "resident", "tenant"]);

function failedUrl(
  request: NextRequest,
  locale: string,
  role: string,
  reason: DemoEnterError,
) {
  const url = new URL(`/${locale}/demo/enter-failed`, request.url);
  url.searchParams.set("role", role);
  url.searchParams.set("reason", reason);
  return url;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locale: string; role: string }> },
) {
  const { locale, role } = await context.params;

  if (!isDemoEnabled()) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  if (!roles.has(role)) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  const redirectTo = new URL(`/${locale}/dashboard`, request.url).toString();
  const result = await performDemoSignIn(role as DemoRoleKey, redirectTo);

  if (result.error) {
    return NextResponse.redirect(
      failedUrl(request, locale, role, result.error),
    );
  }

  return NextResponse.redirect(redirectTo);
}
