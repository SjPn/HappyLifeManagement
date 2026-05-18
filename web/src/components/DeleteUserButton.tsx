"use client";

import { deleteUser } from "@/actions/chair";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function DeleteUserButton({
  userId,
  userName,
  onDeleted,
}: {
  userId: string;
  userName: string;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const t = useTranslations("chair");
  const te = useTranslations("errors");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (!confirm(t("deleteUserConfirm", { name: userName }))) return;
    setLoading(true);
    setError(null);
    const res = await deleteUser(userId);
    setLoading(false);
    if (res && "error" in res && res.error) {
      setError(te(res.error));
      return;
    }
    onDeleted?.();
    router.refresh();
  }

  return (
    <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="text-sm font-medium text-red-700 hover:underline disabled:opacity-50 dark:text-red-400"
      >
        {loading ? "…" : t("deleteUser")}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
