"use client";

import { setHouseholdPaid } from "@/actions/chair";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function PaymentPaidToggle({
  street,
  houseNumber,
  paid,
}: {
  street: string;
  houseNumber: string;
  paid: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("payments");
  const [loading, setLoading] = useState(false);

  async function onChange(next: boolean) {
    setLoading(true);
    const fd = new FormData();
    fd.set("street", street);
    fd.set("houseNumber", houseNumber);
    fd.set("paid", next ? "true" : "false");
    await setHouseholdPaid(fd);
    setLoading(false);
    router.refresh();
  }

  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
      <input
        type="checkbox"
        checked={paid}
        disabled={loading}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
      />
      {t("paidCheckbox")}
    </label>
  );
}
