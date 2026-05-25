import { signOut } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locale: string }> },
) {
  const { locale } = await context.params;
  const home = new URL(`/${locale}`, request.url);

  try {
    await signOut({ redirectTo: home.toString() });
  } catch (error) {
    if (isNextRedirect(error)) throw error;
  }

  return NextResponse.redirect(home);
}
