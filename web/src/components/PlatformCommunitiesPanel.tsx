"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  approveCommunity,
  createCommunity,
  deleteCommunity,
  deletePlatformChair,
  setCommunityBlocked,
  setPlatformChairSuspended,
} from "@/actions/platform";
import {
  CommunityDangerModal,
  type CommunityDangerAction,
} from "@/components/CommunityDangerModal";
import { Card } from "@/components/Ui";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";
import { UserStatus } from "@/lib/enums";
import { useTranslations } from "next-intl";

export type ChairRow = {
  id: string;
  name: string;
  email: string;
  status: string;
};

export type CommunityRow = {
  id: string;
  name: string;
  slug: string;
  inviteCode: string;
  defaultLocale: string;
  blockedAt: string | null;
  approvedAt: string | null;
  userCount: number;
  chairs: ChairRow[];
};

type DangerModalState = {
  communityId: string;
  communityName: string;
  action: CommunityDangerAction;
  block: boolean;
  chairId?: string;
  chairName?: string;
};

function communityStatus(c: CommunityRow) {
  if (!c.approvedAt) return "awaitingApproval" as const;
  if (c.blockedAt) return "blocked" as const;
  return "active" as const;
}

function chairStatusLabel(status: string, t: (k: string) => string) {
  if (status === UserStatus.APPROVED) return t("chairActive");
  if (status === UserStatus.REJECTED) return t("chairSuspended");
  return t("chairPending");
}

export function PlatformCommunitiesPanel({
  communities,
}: {
  communities: CommunityRow[];
}) {
  const t = useTranslations("platform");
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [dangerModal, setDangerModal] = useState<DangerModalState | null>(null);

  const sorted = [...communities].sort((a, b) => {
    const aPending = !a.approvedAt ? 0 : 1;
    const bPending = !b.approvedAt ? 0 : 1;
    if (aPending !== bPending) return aPending - bPending;
    return 0;
  });

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending("create");
    const res = await createCommunity(new FormData(e.currentTarget));
    setPending(null);
    if (res && "ok" in res && res.ok) {
      e.currentTarget.reset();
      router.refresh();
    }
  }

  async function onApprove(id: string, name: string) {
    if (!window.confirm(t("confirmApprove", { name }))) return;
    setPending(id);
    await approveCommunity(id);
    setPending(null);
    router.refresh();
  }

  function openBlockModal(c: CommunityRow) {
    setDangerModal({
      communityId: c.id,
      communityName: c.name,
      action: c.blockedAt ? "unblock" : "block",
      block: !c.blockedAt,
    });
  }

  function openDeleteModal(c: CommunityRow) {
    setDangerModal({
      communityId: c.id,
      communityName: c.name,
      action: "delete",
      block: false,
    });
  }

  function openChairModal(
    c: CommunityRow,
    chair: ChairRow,
    action: "suspendChair" | "restoreChair" | "deleteChair",
  ) {
    setDangerModal({
      communityId: c.id,
      communityName: c.name,
      action,
      block: action === "suspendChair",
      chairId: chair.id,
      chairName: chair.name,
    });
  }

  async function onDangerConfirm(inviteCode: string) {
    if (!dangerModal) return { error: "inviteMismatch" };
    const key = dangerModal.chairId
      ? `chair:${dangerModal.chairId}`
      : dangerModal.communityId;
    setPending(key);

    let res: { ok?: boolean; error?: string } | undefined;

    if (dangerModal.chairId) {
      if (dangerModal.action === "deleteChair") {
        res = await deletePlatformChair(
          dangerModal.communityId,
          dangerModal.chairId,
          inviteCode,
        );
      } else {
        res = await setPlatformChairSuspended(
          dangerModal.communityId,
          dangerModal.chairId,
          dangerModal.action === "suspendChair",
          inviteCode,
        );
      }
    } else if (dangerModal.action === "delete") {
      res = await deleteCommunity(dangerModal.communityId, inviteCode);
    } else {
      res = await setCommunityBlocked(
        dangerModal.communityId,
        dangerModal.block,
        inviteCode,
      );
    }

    setPending(null);
    if (res && "ok" in res && res.ok) {
      router.refresh();
      return {};
    }
    if (res && "error" in res) return { error: res.error };
    return { error: "inviteMismatch" };
  }

  return (
    <div className="space-y-8">
      <Card>
        <p className="mb-4 text-sm font-semibold">{t("createTitle")}</p>
        <form onSubmit={onCreate} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className={labelClass}>{t("communityName")}</span>
            <input name="name" required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>{t("slug")}</span>
            <input name="slug" placeholder="my-village" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>{t("defaultLocale")}</span>
            <select name="defaultLocale" className={inputClass} defaultValue="uk">
              <option value="uk">uk</option>
              <option value="ru">ru</option>
              <option value="en">en</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={pending === "create"}
            className={primaryButtonClass}
          >
            {t("createBtn")}
          </button>
        </form>
      </Card>

      <ul className="space-y-3">
        {sorted.map((c) => {
          const status = communityStatus(c);
          return (
            <li key={c.id}>
              <Card className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-zinc-500">
                      {c.slug} · {t("users", { count: c.userCount })}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {t("inviteCode")}:{" "}
                      <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
                        {c.inviteCode}
                      </code>
                    </p>
                  </div>
                  {status === "awaitingApproval" ? (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                      {t("awaitingApproval")}
                    </span>
                  ) : status === "blocked" ? (
                    <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950 dark:text-red-200">
                      {t("blocked")}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                      {t("active")}
                    </span>
                  )}
                </div>

                {c.chairs.length > 0 && (
                  <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-950/50">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      {t("chairsHeading")}
                    </p>
                    <ul className="mt-2 space-y-2">
                      {c.chairs.map((chair) => {
                        const chairKey = `chair:${chair.id}`;
                        const suspended = chair.status === UserStatus.REJECTED;
                        return (
                          <li
                            key={chair.id}
                            className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-2.5 dark:border-zinc-700 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0 text-sm">
                              <p className="font-medium">{chair.name}</p>
                              <p className="truncate text-xs text-zinc-500">
                                {chair.email}
                              </p>
                              <p className="mt-0.5 text-xs text-zinc-500">
                                {chairStatusLabel(chair.status, t)}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {suspended ? (
                                <button
                                  type="button"
                                  disabled={pending === chairKey}
                                  onClick={() =>
                                    openChairModal(c, chair, "restoreChair")
                                  }
                                  className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium dark:border-zinc-700"
                                >
                                  {t("restoreChair")}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={pending === chairKey}
                                  onClick={() =>
                                    openChairModal(c, chair, "suspendChair")
                                  }
                                  className="rounded-lg border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-800 dark:border-amber-900 dark:text-amber-200"
                                >
                                  {t("suspendChair")}
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={pending === chairKey}
                                onClick={() =>
                                  openChairModal(c, chair, "deleteChair")
                                }
                                className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 dark:border-red-900"
                              >
                                {t("deleteChair")}
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {status === "awaitingApproval" && (
                    <button
                      type="button"
                      disabled={pending === c.id}
                      onClick={() => onApprove(c.id, c.name)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                      {t("approve")}
                    </button>
                  )}
                  {status !== "awaitingApproval" && (
                    <button
                      type="button"
                      disabled={pending === c.id}
                      onClick={() => openBlockModal(c)}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium dark:border-zinc-700"
                    >
                      {c.blockedAt ? t("unblock") : t("block")}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={pending === c.id}
                    onClick={() => openDeleteModal(c)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 dark:border-red-900"
                  >
                    {t("delete")}
                  </button>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>

      {dangerModal && (
        <CommunityDangerModal
          communityName={dangerModal.communityName}
          subjectName={dangerModal.chairName}
          action={dangerModal.action}
          onClose={() => {
            const key = dangerModal.chairId
              ? `chair:${dangerModal.chairId}`
              : dangerModal.communityId;
            if (pending !== key) setDangerModal(null);
          }}
          onConfirm={onDangerConfirm}
        />
      )}
    </div>
  );
}
