"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Card } from "@/components/Ui";
import { UserApproveSelect } from "@/components/UserApproveSelect";
import { UserEditForm } from "@/components/UserEditForm";
import { DeleteUserButton } from "@/components/DeleteUserButton";
import { formatAddressLine } from "@/lib/household";
import { Role, UserStatus } from "@/lib/enums";
import type { AddressOption } from "@/lib/communityAddresses";
import { useTranslations } from "next-intl";

export type ChairUserRow = {
  id: string;
  name: string;
  email: string;
  street: string;
  houseNumber: string;
  role: string;
  status: string;
  tenancyType: string;
  balanceUah: number;
  communityAddressId: string | null;
  phone: string | null;
};

function UserDetailModal({
  user,
  addresses,
  isChair,
  canManage,
  onClose,
}: {
  user: ChairUserRow;
  addresses: AddressOption[];
  isChair: boolean;
  canManage: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("chair");
  const tp = useTranslations("profile");
  const tr = useTranslations("categories.roles");
  const tt = useTranslations("categories.tenancy");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label={t("closeModal")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chair-user-modal-title"
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <h2
            id="chair-user-modal-title"
            className="pr-2 text-lg font-semibold leading-tight"
          >
            {user.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label={t("closeModal")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {user.email}
              </p>
              <p className="mt-2 text-sm">
                {formatAddressLine(user.street, user.houseNumber)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {tp("role")}{" "}
                {tr(user.role as "RESIDENT" | "MODERATOR" | "CHAIR")}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {t("tenancyColTitle")}:{" "}
                {tt(user.tenancyType as "OWNER" | "TENANT")}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="text-xs text-zinc-500">{t("addressStatus")}</p>
              <div className="mt-1">
                <UserApproveSelect userId={user.id} current={user.status} />
              </div>
            </div>
          </div>

          {canManage && (
            <UserEditForm
              userId={user.id}
              name={user.name}
              communityAddressId={user.communityAddressId}
              phone={user.phone}
              tenancyType={user.tenancyType}
              addresses={addresses}
            />
          )}

          {user.role === Role.RESIDENT && (
            <DeleteUserButton
              userId={user.id}
              userName={user.name}
              onDeleted={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function ChairUsersPanel({
  users,
  addresses,
  isChair,
  canManage,
}: {
  users: ChairUserRow[];
  addresses: AddressOption[];
  isChair: boolean;
  canManage: boolean;
}) {
  const t = useTranslations("chair");
  const ts = useTranslations("categories.userStatus");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = [...users].sort((a, b) => {
    const aPending = a.status === UserStatus.PENDING ? 0 : 1;
    const bPending = b.status === UserStatus.PENDING ? 0 : 1;
    if (aPending !== bPending) return aPending - bPending;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });

  const pendingCount = users.filter(
    (u) => u.role === Role.RESIDENT && u.status === UserStatus.PENDING,
  ).length;

  const selected = selectedId
    ? users.find((u) => u.id === selectedId) ?? null
    : null;

  const close = useCallback(() => setSelectedId(null), []);

  if (users.length === 0) {
    return (
      <Card>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {t("usersListEmpty")}
        </p>
      </Card>
    );
  }

  return (
    <>
      {pendingCount > 0 && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
          {t("pendingResidentsAlert", { count: pendingCount })}
        </div>
      )}
      <Card className="overflow-hidden p-0">
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {sorted.map((u) => {
            const address = formatAddressLine(u.street, u.houseNumber);
            const isPending =
              u.role === Role.RESIDENT && u.status === UserStatus.PENDING;
            return (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(u.id)}
                  className={`flex w-full items-baseline justify-between gap-3 border-l-4 px-4 py-3.5 text-left transition ${
                    isPending
                      ? "border-red-600 bg-red-50/80 hover:bg-red-100/80 dark:border-red-500 dark:bg-red-950/30 dark:hover:bg-red-950/50"
                      : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <span className="min-w-0 font-medium text-slate-900 dark:text-slate-100">
                    {u.name}
                    {u.status !== UserStatus.APPROVED && (
                      <span
                        className={`ml-2 text-xs font-semibold ${
                          isPending
                            ? "text-red-700 dark:text-red-300"
                            : "text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        · {ts(u.status as "PENDING" | "APPROVED" | "REJECTED")}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-sm text-zinc-500">{address}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      {selected && (
        <UserDetailModal
          user={selected}
          addresses={addresses}
          isChair={isChair}
          canManage={canManage}
          onClose={close}
        />
      )}
    </>
  );
}
