"use client";

import { deleteCommunityAddress } from "@/actions/addresses";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function DeleteAddressButton({ addressId }: { addressId: string }) {
  const router = useRouter();
  const t = useTranslations("addresses");
  const te = useTranslations("errors");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (!confirm(t("deleteConfirm"))) return;
    setLoading(true);
    setError(null);
    const res = await deleteCommunityAddress(addressId);
    setLoading(false);
    if (res && "error" in res && res.error) {
      setError(te(res.error));
      return;
    }
    router.refresh();
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="text-xs font-medium text-red-700 hover:underline disabled:opacity-50 dark:text-red-400"
      >
        {loading ? "…" : t("delete")}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
