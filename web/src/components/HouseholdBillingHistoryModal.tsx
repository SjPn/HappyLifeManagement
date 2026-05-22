"use client";

import { fetchHouseholdBillingAudit } from "@/actions/billingAudit";
import { bindModalOverlay, bottomNavClearanceClass } from "@/lib/modalOverlay";
import { useLocale, useTranslations } from "next-intl";
import { History } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type AuditEntry = {
  id: string;
  actorName: string;
  action: string;
  details: unknown;
  createdAt: string;
};

function detailNum(v: unknown): number | null {
  if (v == null || typeof v !== "object") return null;
  const o = v as { from?: unknown; to?: unknown };
  if (typeof o.to === "number") return o.to;
  if (typeof o.from === "number") return o.from;
  return null;
}

export function HouseholdBillingHistoryLink({
  street,
  houseNumber,
  periodYear,
  periodMonth,
  addressLabel,
  periodLabel,
}: {
  street: string;
  houseNumber: string;
  periodYear: number;
  periodMonth: number;
  addressLabel: string;
  periodLabel: string;
}) {
  const t = useTranslations("payments");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:underline dark:text-sky-400"
      >
        <History className="h-3.5 w-3.5" aria-hidden />
        {t("auditHistoryLink")}
      </button>
      {open && (
        <HouseholdBillingHistoryDialog
          street={street}
          houseNumber={houseNumber}
          periodYear={periodYear}
          periodMonth={periodMonth}
          addressLabel={addressLabel}
          periodLabel={periodLabel}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function HouseholdBillingHistoryDialog({
  street,
  houseNumber,
  periodYear,
  periodMonth,
  addressLabel,
  periodLabel,
  onClose,
}: {
  street: string;
  houseNumber: string;
  periodYear: number;
  periodMonth: number;
  addressLabel: string;
  periodLabel: string;
  onClose: () => void;
}) {
  const t = useTranslations("payments");
  const ta = useTranslations("payments.audit");
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const fd = new FormData();
    fd.set("street", street);
    fd.set("houseNumber", houseNumber);
    fd.set("periodYear", String(periodYear));
    fd.set("periodMonth", String(periodMonth));
    const res = await fetchHouseholdBillingAudit(fd);
    setLoading(false);
    if (res && "entries" in res) {
      setEntries(res.entries as AuditEntry[]);
    } else {
      setEntries([]);
    }
  }, [street, houseNumber, periodYear, periodMonth]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const release = bindModalOverlay();
    return () => {
      window.removeEventListener("keydown", onKey);
      release();
    };
  }, [onClose]);

  function formatEntry(e: AuditEntry): string {
    const d = e.details as Record<string, unknown> | null;
    switch (e.action) {
      case "paid_marked":
        return ta("paid_marked");
      case "paid_unmarked":
        return ta("paid_unmarked");
      case "payment_sent": {
        const sub = detailNum(d?.subscriptionFeeUah);
        const elec = detailNum(d?.electricityUah);
        let msg = ta("payment_sent", {
          subscription: sub != null ? String(sub) : "—",
          electricity: elec != null ? String(elec) : "—",
        });
        if (d?.paidReset) msg += ` ${ta("paidResetNote")}`;
        if (d?.sentReset) msg += ` ${ta("sentResetNote")}`;
        return msg;
      }
      case "meter_saved":
        return ta("meter_saved", {
          day: String(detailNum(d?.dayReading) ?? "—"),
          night: String(detailNum(d?.nightReading) ?? "—"),
          electricity: String(detailNum(d?.electricityUah) ?? "—"),
          deltaDay: String(d?.deltaDay ?? "—"),
          deltaNight: String(d?.deltaNight ?? "—"),
        });
      case "copied_from_prev": {
        const sy = d?.sourcePeriodYear;
        const sm = d?.sourcePeriodMonth;
        const source =
          typeof sy === "number" && typeof sm === "number"
            ? `${String(sm).padStart(2, "0")}.${sy}`
            : "—";
        return ta("copied_from_prev", {
          source,
          subscription: String(d?.subscriptionFeeUah ?? "—"),
          electricity: String(d?.electricityUah ?? "—"),
        });
      }
      default:
        return e.action;
    }
  }

  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-4 pb-0 backdrop-blur-sm sm:items-center sm:pb-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="billing-history-title"
      onClick={onClose}
    >
      <div
        className={`hl-glass flex max-h-[min(85vh,32rem)] w-full max-w-md flex-col rounded-2xl shadow-2xl sm:rounded-3xl ${bottomNavClearanceClass} sm:max-h-[min(80vh,28rem)] sm:pb-6`}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="border-b border-zinc-200/80 px-4 py-3 dark:border-zinc-700">
          <h2
            id="billing-history-title"
            className="text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            {t("auditHistoryTitle", { address: addressLabel, period: periodLabel })}
          </h2>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {loading ? (
            <p className="text-sm text-zinc-500">{t("auditHistoryLoading")}</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("auditHistoryEmpty")}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className="rounded-xl border border-zinc-200/80 bg-white/60 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900/40"
                >
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {dateFmt.format(new Date(e.createdAt))} · {e.actorName}
                  </p>
                  <p className="mt-1 leading-snug text-zinc-800 dark:text-zinc-200">
                    {formatEntry(e)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-zinc-200/80 px-4 py-3 dark:border-zinc-700">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-zinc-800 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900"
          >
            {t("auditHistoryClose")}
          </button>
        </div>
      </div>
    </div>
  );
}
