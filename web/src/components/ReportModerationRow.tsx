"use client";

import { updateReportStatus } from "@/actions/reports";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function ReportModerationRow({
  id,
  kind,
  status,
  published,
  body,
  authorName,
  canSeeAuthor,
}: {
  id: string;
  kind: string;
  status: string;
  published: boolean;
  body: string;
  authorName?: string;
  canSeeAuthor?: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("chair");
  const tKind = useTranslations("categories.reportKind");
  const tStatus = useTranslations("categories.reportStatus");
  const [loading, setLoading] = useState(false);

  async function apply(nextStatus: string, nextPublished: boolean) {
    setLoading(true);
    await updateReportStatus(id, nextStatus, nextPublished);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
      {canSeeAuthor && authorName ? (
        <p className="text-xs text-zinc-500">
          {t("authorOnly")}{" "}
          <strong className="text-zinc-800 dark:text-zinc-200">
            {authorName}
          </strong>
        </p>
      ) : null}
      <p className="mt-2 text-xs font-medium uppercase text-emerald-800 dark:text-emerald-200">
        {tKind(
          kind as "COMPLAINT" | "SUGGESTION" | "VIOLATION" | "IDEA"
        )}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm">{body}</p>
      <p className="mt-2 text-xs text-zinc-500">
        {t("modStatus")}{" "}
        {tStatus(status as "NEW" | "REVIEWING" | "CLOSED")}
        {published ? ` · ${t("modInFeed")}` : ` · ${t("modHidden")}`}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => apply("REVIEWING", published)}
          className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium dark:bg-zinc-800"
        >
          {t("modBtnReviewing")}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => apply("CLOSED", true)}
          className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
        >
          {t("modBtnCloseFeed")}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => apply("CLOSED", false)}
          className="rounded-lg bg-zinc-200 px-3 py-1.5 text-xs font-medium dark:bg-zinc-700"
        >
          {t("modBtnClose")}
        </button>
      </div>
    </div>
  );
}
