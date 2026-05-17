"use client";

import { inputClass, labelClass } from "@/lib/formStyles";
import { useTranslations } from "next-intl";
import type { AddressOption } from "@/lib/communityAddresses";

export function AddressSelect({
  addresses,
  defaultValue,
  required = true,
  labelNs = "auth",
}: {
  addresses: AddressOption[];
  defaultValue?: string;
  required?: boolean;
  labelNs?: "auth" | "profileEdit";
}) {
  const t = useTranslations(labelNs);

  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelClass}>{t("addressSelect")}</span>
      <select
        name="communityAddressId"
        required={required}
        defaultValue={defaultValue ?? ""}
        className={inputClass}
      >
        <option value="" disabled>
          {t("addressSelectPh")}
        </option>
        {addresses.map((a) => (
          <option key={a.id} value={a.id}>
            {a.label}
          </option>
        ))}
      </select>
    </label>
  );
}
