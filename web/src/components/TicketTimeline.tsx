"use client";

import { useTranslations } from "next-intl";

export function TicketTimeline({
  status,
  createdAt,
  statusChangedAt,
  updatedAt,
}: {
  status: string;
  createdAt: string;
  statusChangedAt: string;
  updatedAt: string;
}) {
  const t = useTranslations("requests");
  const tst = useTranslations("categories.ticketStatus");

  const steps: { key: string; label: string; at: string; done: boolean }[] = [
    {
      key: "NEW",
      label: tst("NEW"),
      at: createdAt,
      done: true,
    },
    {
      key: "IN_PROGRESS",
      label: tst("IN_PROGRESS"),
      at: statusChangedAt,
      done: status === "IN_PROGRESS" || status === "RESOLVED",
    },
    {
      key: "RESOLVED",
      label: tst("RESOLVED"),
      at: status === "RESOLVED" ? statusChangedAt : updatedAt,
      done: status === "RESOLVED",
    },
  ];

  return (
    <div className="mt-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600/90 dark:text-blue-400/90">
        {t("timelineTitle")}
      </p>
      <ol className="mt-2 space-y-2">
        {steps.map((step) => (
          <li key={step.key} className="flex gap-3 text-sm">
            <span
              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                step.done
                  ? "bg-blue-600 dark:bg-blue-400"
                  : "border-2 border-zinc-300 bg-transparent dark:border-zinc-600"
              }`}
              aria-hidden
            />
            <span className="min-w-0 flex-1">
              <span
                className={
                  step.done
                    ? "font-medium text-slate-900 dark:text-slate-100"
                    : "text-slate-400 dark:text-slate-500"
                }
              >
                {step.label}
              </span>
              {step.done && (
                <span className="mt-0.5 block text-xs text-zinc-500">
                  {new Date(step.at).toLocaleString()}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
