"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { CapacitorApp } from "@/lib/capacitorApp";
import { isCapacitorNative } from "@/lib/capacitorNative";
import { getBackFallback, isTabRootPath } from "@/lib/backNavigation";

export function AndroidBackButtonHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isCapacitorNative()) return;

    let cancelled = false;
    let listenerRemove: (() => void) | undefined;

    void (async () => {
      if (cancelled) return;

      const handle = await CapacitorApp.addListener("backButton", () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
          return;
        }

        const fallback = getBackFallback(pathname);
        if (fallback) {
          router.push(fallback);
          return;
        }

        if (isTabRootPath(pathname)) {
          void CapacitorApp.minimizeApp();
          return;
        }

        router.push("/dashboard");
      });

      listenerRemove = () => handle.remove();
    })();

    return () => {
      cancelled = true;
      listenerRemove?.();
    };
  }, [pathname, router]);

  return null;
}
