"use client";

import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";

export function RegisterForm() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");
  const te = useTranslations("errors");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const payload = {
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      password: (form.elements.namedItem("password") as HTMLInputElement)
        .value,
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      street: (form.elements.namedItem("street") as HTMLInputElement).value,
      houseNumber: (form.elements.namedItem("houseNumber") as HTMLInputElement)
        .value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      inviteCode: (form.elements.namedItem("inviteCode") as HTMLInputElement)
        .value,
    };
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : te("generic"));
      return;
    }
    const sign = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });
    if (sign?.error) {
      setError(te("generic"));
      return;
    }
    router.push(
      data.status === "APPROVED"
        ? `/${locale}/dashboard`
        : `/${locale}/pending`,
    );
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t("name")}</span>
        <input name="name" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t("email")}</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t("passwordMin")}</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>{t("street")}</span>
          <input name="street" required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>{t("house")}</span>
          <input name="houseNumber" required className={inputClass} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t("phone")}</span>
        <input name="phone" type="tel" className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t("invite")}</span>
        <input
          name="inviteCode"
          className={inputClass}
          placeholder={t("invitePh")}
        />
      </label>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className={`mt-2 ${primaryButtonClass}`}
      >
        {loading ? t("signingUp") : t("signUp")}
      </button>
    </form>
  );
}
