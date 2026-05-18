"use client";

import { updateMyEmail, updateMyPassword } from "@/actions/credentials";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { signIn, signOut } from "next-auth/react";
import { useState } from "react";

export function ProfileCredentialsForm({ currentEmail }: { currentEmail: string }) {
  const router = useRouter();
  const t = useTranslations("credentials");
  const te = useTranslations("errors");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  async function onEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);
    const form = e.currentTarget;
    const newEmail = (
      form.elements.namedItem("newEmail") as HTMLInputElement
    ).value.trim();
    const currentPassword = (
      form.elements.namedItem("currentPassword") as HTMLInputElement
    ).value;
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setEmailError(te("emailUnchanged"));
      return;
    }
    setEmailLoading(true);
    const res = await updateMyEmail(new FormData(form));
    setEmailLoading(false);
    if (res && "error" in res && res.error) {
      setEmailError(te(res.error));
      return;
    }
    setEmailSuccess(true);
    await signOut({ redirect: false });
    await signIn("credentials", {
      email: newEmail,
      password: currentPassword,
      redirect: false,
    });
    router.refresh();
  }

  async function onPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordError(null);
    const form = e.currentTarget;
    const newPassword = (
      form.elements.namedItem("newPassword") as HTMLInputElement
    ).value;
    const confirmPassword = (
      form.elements.namedItem("confirmPassword") as HTMLInputElement
    ).value;
    if (newPassword !== confirmPassword) {
      setPasswordError(te("passwordMismatch"));
      return;
    }
    setPasswordLoading(true);
    const res = await updateMyPassword(new FormData(form));
    setPasswordLoading(false);
    if (res && "error" in res && res.error) {
      setPasswordError(te(res.error));
      return;
    }
    form.reset();
    setPasswordError(null);
    setPasswordSuccess(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onEmailSubmit} className="flex flex-col gap-3">
        <p className="text-sm font-semibold">{t("emailTitle")}</p>
        <p className="text-xs text-zinc-500">
          {t("currentEmail")}: {currentEmail}
        </p>
        <label className="flex flex-col gap-1 text-sm">
          <span className={labelClass}>{t("newEmail")}</span>
          <input
            name="newEmail"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className={labelClass}>{t("currentPassword")}</span>
          <input
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </label>
        {emailError && (
          <p className="text-sm text-red-600 dark:text-red-400">{emailError}</p>
        )}
        {emailSuccess && (
          <p className="text-sm text-green-700 dark:text-green-400">
            {t("emailChanged")}
          </p>
        )}
        <button
          type="submit"
          disabled={emailLoading}
          className={primaryButtonClass}
        >
          {emailLoading ? t("saving") : t("saveEmail")}
        </button>
      </form>

      <form onSubmit={onPasswordSubmit} className="flex flex-col gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-700">
        <p className="text-sm font-semibold">{t("passwordTitle")}</p>
        <label className="flex flex-col gap-1 text-sm">
          <span className={labelClass}>{t("currentPassword")}</span>
          <input
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className={labelClass}>{t("newPassword")}</span>
          <input
            name="newPassword"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className={labelClass}>{t("confirmPassword")}</span>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={inputClass}
          />
        </label>
        {passwordError && (
          <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
        )}
        {passwordSuccess && (
          <p className="text-sm text-green-700 dark:text-green-400">
            {t("passwordChanged")}
          </p>
        )}
        <button
          type="submit"
          disabled={passwordLoading}
          className={primaryButtonClass}
        >
          {passwordLoading ? t("saving") : t("savePassword")}
        </button>
      </form>
    </div>
  );
}
