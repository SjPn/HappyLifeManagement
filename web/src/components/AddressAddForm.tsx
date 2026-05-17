"use client";

import { createCommunityAddress } from "@/actions/addresses";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function AddressAddForm() {
  const router = useRouter();
  const t = useTranslations("addresses");
  const te = useTranslations("errors");
  const tc = useTranslations("common");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await createCommunityAddress(new FormData(e.currentTarget));
    setLoading(false);
    if (res && "error" in res && res.error) {
      setError(te(res.error));
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className={labelClass}>{t("street")}</span>
          <input name="street" required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className={labelClass}>{t("house")}</span>
          <input name="houseNumber" required className={inputClass} />
        </label>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button type="submit" disabled={loading} className={primaryButtonClass}>
        {loading ? tc("loading") : t("add")}
      </button>
    </form>
  );
}
