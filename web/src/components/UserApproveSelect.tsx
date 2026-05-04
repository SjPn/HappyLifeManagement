"use client";

import { setUserStatus } from "@/actions/chair";
import { UserStatus } from "@/lib/enums";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function UserApproveSelect({
  userId,
  current,
}: {
  userId: string;
  current: string;
}) {
  const router = useRouter();
  const t = useTranslations("categories.userStatus");
  const [loading, setLoading] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value;
    setLoading(true);
    await setUserStatus(userId, status);
    setLoading(false);
    router.refresh();
  }

  return (
    <select
      defaultValue={current}
      disabled={loading}
      onChange={onChange}
      className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-900"
    >
      {[UserStatus.PENDING, UserStatus.APPROVED, UserStatus.REJECTED].map(
        (s) => (
          <option key={s} value={s}>
            {t(s as "PENDING" | "APPROVED" | "REJECTED")}
          </option>
        ),
      )}
    </select>
  );
}
