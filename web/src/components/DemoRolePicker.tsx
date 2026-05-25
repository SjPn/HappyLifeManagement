"use client";

import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

const roles = [
  { key: "chair" },
  { key: "resident" },
  { key: "tenant" },
] as const;

export function DemoRolePicker({
  activeRole,
  variant = "landing",
}: {
  activeRole?: "chair" | "resident" | "tenant" | null;
  variant?: "landing" | "app";
}) {
  const t = useTranslations("demo");
  const locale = useLocale();
  const inApp = variant === "app";

  return (
    <div
      className={
        inApp
          ? "mb-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-3 dark:border-amber-900/50 dark:bg-amber-950/40"
          : "rounded-2xl border border-blue-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-blue-800/50 dark:bg-slate-900/70"
      }
    >
      <p
        className={`text-sm font-semibold ${inApp ? "text-amber-950 dark:text-amber-100" : "text-slate-900 dark:text-white"}`}
      >
        {inApp ? t("appBanner") : t("landingTitle")}
      </p>
      {!inApp && (
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {t("landingHint")}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {roles.map((r) => {
          const active = activeRole === r.key;
          const href = `/${locale}/demo/enter/${r.key}`;
          return (
            <a
              key={r.key}
              href={href}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold no-underline transition ${
                active
                  ? "bg-blue-600 text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              }`}
            >
              {t(`role_${r.key}`)}
            </a>
          );
        })}
      </div>
      {inApp && (
        <p className="mt-2 text-xs text-amber-900/80 dark:text-amber-200/90">
          <Link href="/demo/exit" className="font-medium underline">
            {t("exitDemo")}
          </Link>
        </p>
      )}
    </div>
  );
}
