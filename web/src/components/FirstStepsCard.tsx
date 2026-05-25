"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { CircleCheck, X } from "lucide-react";

const storageKey = (role: "CHAIR" | "RESIDENT") =>
  `hl_first_steps_v1_${role === "CHAIR" ? "chair" : "resident"}`;

export function FirstStepsCard({ role }: { role: "CHAIR" | "RESIDENT" }) {
  const t = useTranslations("firstSteps");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(storageKey(role)) !== "1");
    } catch {
      setVisible(true);
    }
  }, [role]);

  function dismiss() {
    try {
      localStorage.setItem(storageKey(role), "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  const steps =
    role === "CHAIR"
      ? ([1, 2, 3, 4, 5] as const).map((n) => t(`chair${n}`))
      : ([1, 2, 3, 4] as const).map((n) => t(`resident${n}`));

  return (
    <div className="mb-5 rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/95 to-sky-50/80 p-4 shadow-sm dark:border-blue-900/50 dark:from-blue-950/40 dark:to-slate-900/40">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-blue-950 dark:text-blue-100">
          {t("title")}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg p-1 text-slate-500 hover:bg-white/60 dark:hover:bg-slate-800"
          aria-label={t("dismiss")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <ul className="mt-3 space-y-2">
        {steps.map((text, i) => (
          <li
            key={i}
            className="flex gap-2 text-sm text-slate-700 dark:text-slate-300"
          >
            <CircleCheck
              className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400"
              aria-hidden
            />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm">
        <Link
          href="/help"
          className="font-medium text-blue-700 hover:underline dark:text-blue-300"
        >
          {t("moreLink")} →
        </Link>
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
      >
        {t("dismiss")}
      </button>
    </div>
  );
}
