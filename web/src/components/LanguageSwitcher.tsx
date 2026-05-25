"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

const localeLabels: Record<string, string> = {
  uk: "UA",
  ru: "RU",
  en: "EN",
};

export function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const t = useTranslations("lang");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div
      className={`pointer-events-auto flex flex-wrap items-center gap-1.5 ${compact ? "" : "justify-center"}`}
      role="group"
      aria-label={t("label")}
    >
      {routing.locales.map((loc) => {
        const active = locale === loc;
        const short = localeLabels[loc] ?? loc.toUpperCase();
        return (
          <Link
            key={loc}
            href={pathname}
            locale={loc}
            prefetch={false}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold no-underline transition ${
              active
                ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30"
                : "border border-slate-200/90 bg-white text-slate-800 shadow-sm hover:border-blue-300 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-blue-700"
            }`}
            aria-current={active ? "true" : undefined}
            title={
              loc === "uk" ? t("uk") : loc === "ru" ? t("ru") : t("en")
            }
          >
            {short}
          </Link>
        );
      })}
    </div>
  );
}
