import { Link } from "@/i18n/navigation";
import type { demoPasswordDiagnostics } from "@/lib/demo";
import { getTranslations } from "next-intl/server";

export async function DemoEnterFailed({
  diagnostics,
}: {
  diagnostics: ReturnType<typeof demoPasswordDiagnostics>;
}) {
  const t = await getTranslations("demo");

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-lg font-semibold text-slate-900 dark:text-white">
        {t("enterFailedTitle")}
      </p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {t("enterFailedBody")}
      </p>
      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-xs leading-relaxed text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-100">
        {t("enterFailedHint")}
      </p>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {t("enterFailedRedeploy")}
      </p>
      <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        {diagnostics.usingFallback
          ? t("enterFailedDiagFallback")
          : t("enterFailedDiagEnv", {
              len: diagnostics.length,
              prefix: diagnostics.prefix,
              suffix: diagnostics.suffix,
            })}
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-blue-700"
      >
        {t("enterFailedBack")}
      </Link>
    </main>
  );
}
