import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { RegisterForm } from "@/components/RegisterForm";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { listCommunityAddresses } from "@/lib/communityAddresses";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (session?.user?.status === "APPROVED")
    redirect(`/${locale}/dashboard`);

  const t = await getTranslations("auth");
  const addresses = await listCommunityAddresses();

  return (
    <div className="relative min-h-screen px-4 py-12">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher compact />
      </div>
      <div className="pointer-events-none absolute inset-0 hl-grid opacity-50" />
      <div className="relative z-10 mx-auto max-w-md">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("registerTitle")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {t("registerHint")}
        </p>
        <div className="mt-8 hl-glass rounded-2xl p-5 sm:p-6">
          <RegisterForm addresses={addresses} />
        </div>
        <p className="mt-8 text-center text-sm text-slate-500">
          {t("hasAccount")}{" "}
          <Link
            className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
            href="/login"
          >
            {t("toLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
