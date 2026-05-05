"use client";

import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";

export function LoginForm() {
  const router = useRouter();
  const locale = useLocale();
  const search = useSearchParams();
  const raw = search.get("callbackUrl") ?? "";
  const supportedLocales = ["uk", "ru", "en"] as const;
  const toLocalizedPath = (input: string): string => {
    let value = input.trim();
    if (!value) return `/${locale}/dashboard`;

    // next-auth may pass an absolute URL; normalize to a path.
    if (value.startsWith("http://") || value.startsWith("https://")) {
      try {
        const u = new URL(value);
        value = `${u.pathname}${u.search}${u.hash}`;
      } catch {
        return `/${locale}/dashboard`;
      }
    }

    if (!value.startsWith("/") || value.startsWith("/api")) {
      return `/${locale}/dashboard`;
    }

    // Guard against accidental double-prefix like /ru/ru/dashboard
    const doublePrefix = `/${locale}/${locale}/`;
    if (value.startsWith(doublePrefix)) {
      value = `/${locale}/` + value.slice(doublePrefix.length);
    }

    const alreadyLocalized = supportedLocales.some(
      (l) => value === `/${l}` || value.startsWith(`/${l}/`),
    );
    return alreadyLocalized ? value : `/${locale}${value}`;
  };

  const callback = toLocalizedPath(raw);
  const t = useTranslations("auth");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement)
      .value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(t("errorLogin"));
      return;
    }
    router.push(callback);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
        <span className={labelClass}>{t("password")}</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
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
        {loading ? t("signingIn") : t("signIn")}
      </button>
    </form>
  );
}
