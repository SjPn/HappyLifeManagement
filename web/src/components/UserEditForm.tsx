"use client";

import { updateUserProfile } from "@/actions/chair";
import { AddressSelect } from "@/components/AddressSelect";
import { TenancyType } from "@/lib/audience";
import type { AddressOption } from "@/lib/communityAddresses";
import { inputClass, labelClass } from "@/lib/formStyles";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function UserEditForm(props: {
  userId: string;
  name: string;
  communityAddressId: string | null;
  phone: string | null;
  tenancyType: string;
  addresses: AddressOption[];
}) {
  const router = useRouter();
  const t = useTranslations("profileEdit");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const tt = useTranslations("categories.tenancy");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("userId", props.userId);
    const res = await updateUserProfile(fd);
    setLoading(false);
    if (res && "error" in res && res.error) {
      setError(te(res.error));
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 grid gap-2 md:grid-cols-2">
      <input type="hidden" name="userId" value={props.userId} />
      <label className="flex flex-col gap-1 text-xs md:col-span-2">
        <span className={labelClass}>{t("name")}</span>
        <input name="name" required defaultValue={props.name} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className={labelClass}>{t("phone")}</span>
        <input name="phone" type="tel" defaultValue={props.phone ?? ""} className={inputClass} />
      </label>
      <div className="md:col-span-2">
        <AddressSelect
          addresses={props.addresses}
          defaultValue={props.communityAddressId ?? undefined}
          labelNs="profileEdit"
        />
      </div>
      <label className="flex flex-col gap-1 text-xs md:col-span-2">
        <span className={labelClass}>{t("tenancy")}</span>
        <select
          name="tenancyType"
          defaultValue={
            props.tenancyType === TenancyType.TENANT
              ? TenancyType.TENANT
              : TenancyType.OWNER
          }
          className={inputClass}
        >
          <option value={TenancyType.OWNER}>{tt("OWNER")}</option>
          <option value={TenancyType.TENANT}>{tt("TENANT")}</option>
        </select>
      </label>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 md:col-span-2">
          {error}
        </p>
      )}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="h-10 rounded-xl bg-zinc-800 px-4 text-xs font-semibold text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-200 dark:text-zinc-900"
        >
          {loading ? tc("loading") : tc("save")}
        </button>
      </div>
    </form>
  );
}
