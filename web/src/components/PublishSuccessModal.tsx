"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { primaryButtonClass } from "@/lib/formStyles";

export function PublishSuccessModal({
  title,
  message,
  closeLabel,
  onClose,
}: {
  title: string;
  message: string;
  closeLabel: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="hl-glass w-full max-w-sm rounded-2xl p-6 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="h-8 w-8 text-white" strokeWidth={2.25} />
          </span>
          <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {message}
          </p>
          <button
            type="button"
            onClick={onClose}
            className={`mt-6 w-full ${primaryButtonClass}`}
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
