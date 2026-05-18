"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  createCommunity,
  deleteCommunity,
  setCommunityBlocked,
} from "@/actions/platform";
import {
  CommunityDangerModal,
  type CommunityDangerAction,
} from "@/components/CommunityDangerModal";
import { Card } from "@/components/Ui";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/formStyles";
import { useTranslations } from "next-intl";

export type CommunityRow = {
  id: string;
  name: string;
  slug: string;
  inviteCode: string;
  defaultLocale: string;
  blockedAt: string | null;
  userCount: number;
};

type DangerModalState = {
  id: string;
  name: string;
  action: CommunityDangerAction;
  block: boolean;
};

export function PlatformCommunitiesPanel({
  communities,
}: {
  communities: CommunityRow[];
}) {
  const t = useTranslations("platform");
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [dangerModal, setDangerModal] = useState<DangerModalState | null>(null);

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

  function openBlockModal(c: CommunityRow) {
    setDangerModal({
      id: c.id,
      name: c.name,
      action: c.blockedAt ? "unblock" : "block",
      block: !c.blockedAt,
    });
  }

  function openDeleteModal(c: CommunityRow) {
    setDangerModal({
      id: c.id,
      name: c.name,
      action: "delete",
      block: false,
    });
  }

  async function onDangerConfirm(inviteCode: string) {
    if (!dangerModal) return { error: "inviteMismatch" };
    setPending(dangerModal.id);
    const res =
      dangerModal.action === "delete"
        ? await deleteCommunity(dangerModal.id, inviteCode)
        : await setCommunityBlocked(
            dangerModal.id,
            dangerModal.block,
            inviteCode,
          );
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
        {communities.map((c) => (
          <li key={c.id}>
            <Card className="space-y-2">
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
                {c.blockedAt ? (
                  <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950 dark:text-red-200">
                    {t("blocked")}
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                    {t("active")}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  disabled={pending === c.id}
                  onClick={() => openBlockModal(c)}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium dark:border-zinc-700"
                >
                  {c.blockedAt ? t("unblock") : t("block")}
                </button>
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
        ))}
      </ul>

      {dangerModal && (
        <CommunityDangerModal
          communityName={dangerModal.name}
          action={dangerModal.action}
          onClose={() => {
            if (pending !== dangerModal.id) setDangerModal(null);
          }}
          onConfirm={onDangerConfirm}
        />
      )}
    </div>
  );
}
