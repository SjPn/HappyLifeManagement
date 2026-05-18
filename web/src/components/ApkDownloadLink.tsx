"use client";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

const APK_DOWNLOAD = "/api/download/apk";

function isCapacitorNative(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (
    window as unknown as {
      Capacitor?: { isNativePlatform?: () => boolean };
    }
  ).Capacitor;
  return cap?.isNativePlatform?.() ?? false;
}

export function ApkDownloadLink() {
  const t = useTranslations("profile");
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${APK_DOWNLOAD}?meta=1`, { cache: "no-store" });
        const data = (await res.json()) as { available?: boolean };
        if (!cancelled) setAvailable(Boolean(data.available));
      } catch {
        if (!cancelled) setAvailable(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!available) {
        e.preventDefault();
        return;
      }
      if (isCapacitorNative()) {
        e.preventDefault();
        window.open(APK_DOWNLOAD, "_blank", "noopener,noreferrer");
      }
    },
    [available],
  );

  if (available === null) {
    return (
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        …
      </p>
    );
  }

  if (!available) {
    return (
      <p className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-center text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
        {t("apkUnavailable")}
      </p>
    );
  }

  return (
    <>
      <a
        href={APK_DOWNLOAD}
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-5 text-sm font-semibold text-blue-900 transition hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-100"
      >
        <Download className="h-4 w-4" />
        {t("downloadApp")}
      </a>
      {isCapacitorNative() && (
        <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          {t("apkOpenInBrowser")}
        </p>
      )}
    </>
  );
}
