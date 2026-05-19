"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const localeLabels: Record<string, string> = {
  uk: "UA",
  ru: "RU",
  en: "EN",
};

export function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const t = useTranslations("lang");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className={`flex flex-wrap items-center gap-1 ${compact ? "" : "justify-center"}`}
      role="group"
      aria-label={t("label")}
    >
      {routing.locales.map((loc) => {
        const active = locale === loc;
        const short = localeLabels[loc] ?? loc.toUpperCase();
        return (
          <button
            key={loc}
            type="button"
            onClick={() => router.replace(pathname, { locale: loc })}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              active
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white/70 text-slate-600 hover:bg-white dark:bg-slate-800/80 dark:text-slate-300"
            }`}
            title={
              loc === "uk"
                ? t("uk")
                : loc === "ru"
                  ? t("ru")
                  : t("en")
            }
          >
            {short}
          </button>
        );
      })}
    </div>
  );
}
