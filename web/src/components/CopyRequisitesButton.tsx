"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyRequisitesButton({ text }: { text: string }) {
  const t = useTranslations("payments");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  if (!text.trim()) return null;

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-900 transition hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-100"
    >
      {copied ? (
        <Check className="h-4 w-4" aria-hidden />
      ) : (
        <Copy className="h-4 w-4" aria-hidden />
      )}
      {copied ? t("requisitesCopied") : t("copyRequisites")}
    </button>
  );
}
