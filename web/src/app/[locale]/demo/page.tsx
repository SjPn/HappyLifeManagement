import { DemoRolePicker } from "@/components/DemoRolePicker";
import { Link } from "@/i18n/navigation";
import { isDemoEnabled } from "@/lib/demo";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

export default async function DemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (!isDemoEnabled()) notFound();

  const { locale } = await params;
  const { auth } = await import("@/auth");
  const s = await auth();
  if (s?.user?.status === "APPROVED") {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations("demo");

  return (
    <div className="relative min-h-screen px-4 py-16">
      <div className="pointer-events-none absolute inset-0 hl-grid opacity-50" />
      <div className="relative z-10 mx-auto max-w-md">
        <p className="text-center text-[0.65rem] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
          Demo
        </p>
        <h1 className="mt-2 text-center text-2xl font-bold text-slate-900 dark:text-white">
          {t("pageTitle")}
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          {t("pageSubtitle")}
        </p>

        <div className="mt-8">
          <DemoRolePicker activeRole="resident" variant="landing" />
        </div>

        <a
          href={`/${locale}/demo/enter/resident`}
          className="mt-4 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 text-sm font-semibold text-white no-underline shadow-lg shadow-blue-600/25 transition hover:from-blue-500 hover:to-sky-500 active:scale-[0.98]"
        >
          {t("continueAsResident")}
        </a>

        <p className="mt-8 text-center text-sm text-slate-500">
          <Link
            href="/login"
            className="font-semibold text-blue-700 hover:underline dark:text-blue-400"
          >
            {t("backToLogin")}
          </Link>
          {" · "}
          <Link
            href="/"
            className="font-semibold text-blue-700 hover:underline dark:text-blue-400"
          >
            {t("backToHome")}
          </Link>
        </p>
      </div>
    </div>
  );
}
