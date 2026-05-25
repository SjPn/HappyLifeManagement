import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/LoginForm";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { isDemoEnabled } from "@/lib/demo";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (session?.user?.role === "PLATFORM_ADMIN")
    redirect(`/${locale}/platform/communities`);
  if (session?.user?.status === "APPROVED")
    redirect(`/${locale}/dashboard`);
  if (session?.user && session.user.status === "PENDING")
    redirect(`/${locale}/pending`);

  const t = await getTranslations("auth");
  const tDemo = await getTranslations("demo");

  return (
    <div className="relative min-h-screen px-4 py-16">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher compact />
      </div>
      <div className="pointer-events-none absolute inset-0 hl-grid opacity-50" />
      <div className="relative z-10 mx-auto max-w-md">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("loginTitle")}
        </h1>
        <div className="mt-8 hl-glass rounded-2xl p-5 sm:p-6">
          <LoginForm />
        </div>
        {isDemoEnabled() && (
          <p className="mt-6 text-center">
            <a
              href={`/${locale}/demo`}
              className="text-sm font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-2 hover:text-blue-600 dark:text-blue-400 dark:decoration-blue-400/40"
            >
              {tDemo("tryDemoLink")}
            </a>
            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
              {tDemo("tryDemoHint")}
            </span>
          </p>
        )}
        <p className="mt-8 text-center text-sm text-slate-500">
          {t("noAccount")}{" "}
          <Link
            className="font-semibold text-blue-700 hover:underline dark:text-blue-400"
            href="/register"
          >
            {t("toRegister")}
          </Link>
        </p>
        <p className="mt-4 text-center text-sm text-slate-500">
          <Link
            className="font-semibold text-blue-700 hover:underline dark:text-blue-400"
            href="/register-community"
          >
            {t("registerCommunity")}
          </Link>
        </p>
      </div>
    </div>
  );
}
