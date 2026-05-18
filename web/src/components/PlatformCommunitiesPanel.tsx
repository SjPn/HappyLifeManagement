"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  createCommunity,
  deleteCommunity,
  setCommunityBlocked,
} from "@/actions/platform";
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

export function PlatformCommunitiesPanel({
  communities,
}: {
  communities: CommunityRow[];
}) {
  const t = useTranslations("platform");
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

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

  async function onBlock(id: string, block: boolean) {
    const msg = block ? t("confirmBlock") : t("confirmUnblock");
    if (!window.confirm(msg)) return;
    const confirm = window.prompt(t("typeYes")) ?? "";
    if (confirm !== "yes") return;
    setPending(id);
    await setCommunityBlocked(id, block, "yes");
    setPending(null);
    router.refresh();
  }

  async function onDelete(id: string, name: string) {
    if (!window.confirm(t("confirmDelete", { name }))) return;
    const confirm = window.prompt(t("typeYes")) ?? "";
    if (confirm !== "yes") return;
    setPending(id);
    await deleteCommunity(id, "yes");
    setPending(null);
    router.refresh();
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
                  onClick={() => onBlock(c.id, !c.blockedAt)}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium dark:border-zinc-700"
                >
                  {c.blockedAt ? t("unblock") : t("block")}
                </button>
                <button
                  type="button"
                  disabled={pending === c.id}
                  onClick={() => onDelete(c.id, c.name)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 dark:border-red-900"
                >
                  {t("delete")}
                </button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
