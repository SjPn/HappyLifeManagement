"use client";

import { setUserBalance } from "@/actions/chair";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function BalanceEditForm({
  userId,
  balanceUah,
}: {
  userId: string;
  balanceUah: number;
}) {
  const router = useRouter();
  const t = useTranslations("chair");
  const tc = useTranslations("common");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("userId", userId);
    await setUserBalance(fd);
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="userId" value={userId} />
      <label className="flex flex-col gap-1 text-xs">
        {t("balance")}
        <input
          name="balanceUah"
          type="text"
          defaultValue={String(balanceUah)}
          className="w-28 rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
          aria-label={t("balance")}
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="h-8 rounded-lg bg-zinc-800 px-3 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900"
      >
        {loading ? tc("loading") : tc("save")}
      </button>
    </form>
  );
}
