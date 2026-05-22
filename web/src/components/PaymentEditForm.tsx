"use client";

import { setHouseholdPayments } from "@/actions/chair";
import { PublishSuccessModal } from "@/components/PublishSuccessModal";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function PaymentEditForm({
  street,
  houseNumber,
  periodYear,
  periodMonth,
  subscriptionFeeUah,
  electricityUah,
  addressLabel,
  residentNames,
  paymentSent,
  onPaymentSent,
}: {
  street: string;
  houseNumber: string;
  periodYear: number;
  periodMonth: number;
  subscriptionFeeUah: number;
  electricityUah: number;
  addressLabel: string;
  residentNames: string;
  paymentSent: boolean;
  onPaymentSent?: () => void;
}) {
  const router = useRouter();
  const t = useTranslations("chair");
  const tp = useTranslations("payments");
  const tc = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [electricity, setElectricity] = useState(String(electricityUah));
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setElectricity(String(electricityUah));
  }, [electricityUah]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const res = await setHouseholdPayments(new FormData(e.currentTarget));
    setLoading(false);
    if (res && "error" in res) return;
    onPaymentSent?.();
    setShowSuccess(true);
    router.refresh();
  }

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="street" value={street} />
        <input type="hidden" name="houseNumber" value={houseNumber} />
        <input type="hidden" name="periodYear" value={periodYear} />
        <input type="hidden" name="periodMonth" value={periodMonth} />
        {paymentSent && (
          <p className="mb-1 w-full text-xs font-medium text-amber-800 dark:text-amber-300">
            {tp("sentToResidentHint")}
          </p>
        )}
        <label className="flex flex-col gap-1 text-xs">
          {t("subscriptionFee")}
          <input
            name="subscriptionFeeUah"
            type="text"
            inputMode="decimal"
            defaultValue={String(subscriptionFeeUah)}
            className="w-28 rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
            aria-label={t("subscriptionFee")}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          {t("electricityFee")}
          <input
            name="electricityUah"
            type="text"
            inputMode="decimal"
            value={electricity}
            onChange={(e) => setElectricity(e.target.value)}
            className="w-28 rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
            aria-label={t("electricityFee")}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="h-8 rounded-lg bg-zinc-800 px-3 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900"
        >
          {loading ? tc("loading") : tp("sendPayment")}
        </button>
      </form>

      {showSuccess && (
        <PublishSuccessModal
          title={tp("sendSuccessTitle")}
          message={tp("sendSuccessMessage", {
            address: addressLabel,
            residents: residentNames || "—",
          })}
          closeLabel={tp("sendSuccessClose")}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </>
  );
}
