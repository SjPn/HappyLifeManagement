"use client";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";

const APK_URL =
  process.env.NEXT_PUBLIC_APK_URL?.trim() || "/downloads/happylife.apk";

export function ApkDownloadLink() {
  const t = useTranslations("profile");

  return (
    <a
      href={APK_URL}
      download
      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-5 text-sm font-semibold text-blue-900 transition hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-100"
    >
      <Download className="h-4 w-4" />
      {t("downloadApp")}
    </a>
  );
}
