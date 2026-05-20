"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { ElectricityTariffForm } from "@/components/ElectricityTariffForm";
import { ChairPaymentRequisitesForm } from "@/components/ChairPaymentRequisitesForm";

export function PaymentsTariffsRequisitesPanel({
  dayRateUah,
  nightRateUah,
  paymentRequisites,
}: {
  dayRateUah: number;
  nightRateUah: number;
  paymentRequisites: string | null;
}) {
  const t = useTranslations("payments");
  const [open, setOpen] = useState(false);

  return (
    <div className="hl-glass mb-4 overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-white/50 dark:hover:bg-white/5"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {t("tariffsAndRequisitesLink")}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open && (
        <div className="space-y-4 border-t border-zinc-100 px-4 py-4 dark:border-zinc-800">
          <ElectricityTariffForm
            dayRateUah={dayRateUah}
            nightRateUah={nightRateUah}
          />
          <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <ChairPaymentRequisitesForm initialRequisites={paymentRequisites} />
          </div>
        </div>
      )}
    </div>
  );
}
