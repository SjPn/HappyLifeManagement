"use client";

import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export function PageBackLink({
  href,
  label,
}: {
  href: string;
  label?: string;
}) {
  const tc = useTranslations("common");

  return (
    <Link
      href={href}
      className="mb-4 inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/90 px-3 py-2 text-sm font-semibold text-blue-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/90 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-900/80 dark:text-blue-200 dark:hover:border-blue-800 dark:hover:bg-blue-950/40"
    >
      <ChevronLeft className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
      <span className="truncate">{label ?? tc("back")}</span>
    </Link>
  );
}
