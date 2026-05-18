import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Role } from "@/lib/enums";
import { Link } from "@/i18n/navigation";
import { SignOutButton } from "@/components/AppShell";
import { getTranslations } from "next-intl/server";

export default async function PlatformLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);
  if (session.user.role !== Role.PLATFORM_ADMIN) {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations("platform");

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            {t("eyebrow")}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{t("title")}</h1>
        </div>
        <SignOutButton />
      </header>
      <nav className="mb-6 flex gap-2 text-sm">
        <Link
          href="/platform/communities"
          className="rounded-lg bg-blue-50 px-3 py-2 font-medium text-blue-900 dark:bg-blue-950/50 dark:text-blue-100"
        >
          {t("communitiesNav")}
        </Link>
      </nav>
      {children}
    </div>
  );
}
