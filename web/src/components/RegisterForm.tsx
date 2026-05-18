"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { signIn } from "next-auth/react";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";
import { TenancyType } from "@/lib/audience";
import { Link } from "@/i18n/navigation";
import { AddressSelect } from "@/components/AddressSelect";
import type { AddressOption } from "@/lib/communityAddresses";

export function RegisterForm() {
  const router = useRouter();
  const t = useTranslations("auth");
  const te = useTranslations("errors");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<AddressOption[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteLookup, setInviteLookup] = useState<
    "idle" | "loading" | "valid" | "invalid" | "noAddresses"
  >("idle");

  const loadAddresses = useCallback(async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) {
      setAddresses([]);
      setInviteLookup("idle");
      return;
    }
    setAddressesLoading(true);
    setInviteLookup("loading");
    try {
      const res = await fetch(
        `/api/addresses?inviteCode=${encodeURIComponent(trimmed)}`,
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAddresses([]);
        setInviteLookup(
          data.error === "invalidInvite" || res.status === 404
            ? "invalid"
            : "idle",
        );
        return;
      }
      if (!Array.isArray(data.addresses)) {
        setAddresses([]);
        setInviteLookup("idle");
        return;
      }
      setAddresses(data.addresses);
      setInviteLookup(
        data.addresses.length === 0 ? "noAddresses" : "valid",
      );
    } catch {
      setAddresses([]);
      setInviteLookup("idle");
    } finally {
      setAddressesLoading(false);
    }
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    const passwordConfirm = (
      form.elements.namedItem("passwordConfirm") as HTMLInputElement
    ).value;
    if (password !== passwordConfirm) {
      setError(te("passwordMismatch"));
      setLoading(false);
      return;
    }

    const payload = {
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      password,
      passwordConfirm,
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      communityAddressId: (
        form.elements.namedItem("communityAddressId") as HTMLSelectElement
      ).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      inviteCode: (form.elements.namedItem("inviteCode") as HTMLInputElement)
        .value,
      tenancyType:
        form.querySelector<HTMLInputElement>('input[name="tenancyType"]:checked')
          ?.value ?? TenancyType.OWNER,
      memorandumAccepted:
        (form.elements.namedItem("memorandumAccepted") as HTMLInputElement)
          .checked ?? false,
    };
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      const code = typeof data.error === "string" ? data.error : "generic";
      setError(te(code as "generic"));
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
    router.push(data.status === "APPROVED" ? "/dashboard" : "/pending");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t("invite")}</span>
        <input
          name="inviteCode"
          required
          value={inviteCode}
          onChange={(e) => {
            const v = e.target.value.toUpperCase();
            setInviteCode(v);
            if (v.trim().length >= 4) loadAddresses(v);
            else {
              setAddresses([]);
              setInviteLookup("idle");
            }
          }}
          onBlur={() => loadAddresses(inviteCode)}
          className={inputClass}
          placeholder={t("invitePh")}
          autoComplete="off"
        />
        <span className="text-xs text-zinc-500">{t("inviteHint")}</span>
      </label>
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
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t("passwordConfirm")}</span>
        <input
          name="passwordConfirm"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      {addressesLoading || inviteLookup === "loading" ? (
        <p className="text-sm text-zinc-500">…</p>
      ) : inviteLookup === "invalid" ? (
        <p className="text-sm text-red-600 dark:text-red-400">
          {te("invalidInvite")}
        </p>
      ) : inviteLookup === "noAddresses" ? (
        <p className="text-sm text-amber-800 dark:text-amber-200">
          {t("noAddresses")}
        </p>
      ) : addresses.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {inviteCode.trim() ? t("noAddresses") : t("inviteEnterFirst")}
        </p>
      ) : (
        <AddressSelect addresses={addresses} />
      )}
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t("phone")}</span>
        <input name="phone" type="tel" className={inputClass} />
      </label>
      <fieldset className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
        <legend className={labelClass}>{t("tenancyLegend")}</legend>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="tenancyType"
            value={TenancyType.OWNER}
            defaultChecked
            required
            className="h-4 w-4"
          />
          {t("tenancyOwner")}
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="tenancyType"
            value={TenancyType.TENANT}
            required
            className="h-4 w-4"
          />
          {t("tenancyTenant")}
        </label>
      </fieldset>

      <label className="flex items-start gap-2 rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-700">
        <input
          type="checkbox"
          name="memorandumAccepted"
          required
          className="mt-0.5 h-4 w-4"
        />
        <span className="text-zinc-700 dark:text-zinc-300">
          {t("memorandumAcceptPrefix")}{" "}
          <Link
            href="/info/memorandum"
            target="_blank"
            className="font-semibold text-blue-700 hover:underline dark:text-blue-300"
          >
            {t("memorandumLinkText")}
          </Link>
          .
        </span>
      </label>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading || addresses.length === 0}
        className={`mt-2 ${primaryButtonClass}`}
      >
        {loading ? t("signingUp") : t("signUp")}
      </button>
    </form>
  );
}
