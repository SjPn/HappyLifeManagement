"use client";

import { updateMyProfile } from "@/actions/profile";
import { TenancyType } from "@/lib/audience";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function ProfileEditForm(props: {
  name: string;
  street: string;
  houseNumber: string;
  phone: string | null;
  tenancyType: string;
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
    const res = await updateMyProfile(new FormData(e.currentTarget));
    setLoading(false);
    if (res && "error" in res && res.error) {
      setError(te(res.error));
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelClass}>{t("name")}</span>
        <input name="name" required defaultValue={props.name} className={inputClass} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className={labelClass}>{t("street")}</span>
          <input name="street" required defaultValue={props.street} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className={labelClass}>{t("house")}</span>
          <input
            name="houseNumber"
            required
            defaultValue={props.houseNumber}
            className={inputClass}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelClass}>{t("phone")}</span>
        <input
          name="phone"
          type="tel"
          defaultValue={props.phone ?? ""}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
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
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button type="submit" disabled={loading} className={primaryButtonClass}>
        {loading ? tc("loading") : tc("save")}
      </button>
    </form>
  );
}

