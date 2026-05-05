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
  const toPathForIntlRouter = (input: string): string => {
    let value = input.trim();
    if (!value) return "/dashboard";

    // next-auth may pass an absolute URL; normalize to a path.
    if (value.startsWith("http://") || value.startsWith("https://")) {
      try {
        const u = new URL(value);
        value = `${u.pathname}${u.search}${u.hash}`;
      } catch {
        return "/dashboard";
      }
    }

    if (!value.startsWith("/") || value.startsWith("/api")) {
      return "/dashboard";
    }

    // Guard against accidental double-prefix like /ru/ru/dashboard
    const doublePrefix = `/${locale}/${locale}/`;
    if (value.startsWith(doublePrefix)) {
      value = `/${locale}/` + value.slice(doublePrefix.length);
    }

    const hasAnyLocalePrefix = supportedLocales.some(
      (l) => value === `/${l}` || value.startsWith(`/${l}/`),
    );
    // IMPORTANT: next-intl router adds the locale prefix itself.
    // So we must pass an unprefixed, locale-agnostic path to avoid /ru/ru/...
    if (hasAnyLocalePrefix) {
      const parts = value.split("/");
      const maybeLocale = parts[1] as (typeof supportedLocales)[number] | undefined;
      if (maybeLocale && supportedLocales.includes(maybeLocale)) {
        const rest = "/" + parts.slice(2).join("/");
        return rest === "/" ? "/dashboard" : rest;
      }
    }

    return value || "/dashboard";
  };

  const callback = toPathForIntlRouter(raw);
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
