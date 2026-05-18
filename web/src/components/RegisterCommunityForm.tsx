"use client";

import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { registerCommunitySelfServe } from "@/actions/platform";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";

export function RegisterCommunityForm() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("onboard");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await registerCommunitySelfServe(new FormData(e.currentTarget));
    setLoading(false);

    if (!res || "error" in res) {
      setError(t(`errors.${res?.error ?? "generic"}`));
      return;
    }

    setInviteCode(res.inviteCode);

    const email = (
      e.currentTarget.elements.namedItem("email") as HTMLInputElement
    ).value;
    const password = (
      e.currentTarget.elements.namedItem("password") as HTMLInputElement
    ).value;

    const sign = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (sign?.error) {
      setError(t("errors.loginAfterCreate"));
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (inviteCode) {
    return (
      <div className="space-y-3 text-sm">
        <p className="font-semibold text-emerald-800 dark:text-emerald-200">
          {t("created")}
        </p>
        <p>
          {t("inviteLabel")}:{" "}
          <code className="rounded bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
            {inviteCode}
          </code>
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">{t("inviteHint")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t("communityName")}</span>
        <input name="communityName" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t("slug")}</span>
        <input name="slug" placeholder="my-village" className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t("chairName")}</span>
        <input name="name" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t("email")}</span>
        <input name="email" type="email" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t("password")}</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className={inputClass}
        />
      </label>
      <input type="hidden" name="defaultLocale" value={locale} />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button type="submit" disabled={loading} className={primaryButtonClass}>
        {loading ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
