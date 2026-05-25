"use client";

import { Link } from "@/i18n/navigation";
import { HubContentCard, HubSection } from "@/components/hub/hubUi";
import { useTranslations } from "next-intl";
import { ClipboardList, Wallet, Vote } from "lucide-react";
import { ticketCategoryLabel } from "@/lib/ticketDisplay";

export type DashboardGlanceTicket = {
  id: string;
  category: string;
  description: string;
  status: string;
  unread?: boolean;
};

export function DashboardGlance({
  tickets,
  payment,
  vote,
}: {
  tickets: DashboardGlanceTicket[];
  payment: {
    periodLabel: string;
    totalLabel: string;
    paid: boolean;
    /** Показать в «Важном» только неоплаченное начисление. */
    showInImportant: boolean;
  };
  vote: { id: string; title: string } | null;
}) {
  const t = useTranslations("dashboard.glance");
  const tst = useTranslations("categories.ticketStatus");
  const tc = useTranslations("categories.ticket");

  const hasAny =
    tickets.length > 0 || payment.showInImportant || vote != null;
  if (!hasAny) return null;

  function ticketTitle(description: string, maxLen = 48) {
    const line = description.split("\n")[0]?.trim() || description.trim();
    if (line.length <= maxLen) return line;
    return `${line.slice(0, maxLen)}…`;
  }

  return (
    <HubSection title={t("title")} className="!mt-4">
      <div className="flex flex-col gap-2.5">
        {tickets.map((tk) => (
          <HubContentCard key={tk.id} href={`/requests`} badge={tk.unread ? 1 : 0}>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 text-white shadow-md">
                <ClipboardList className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <span className="min-w-0 flex-1 pr-6">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {ticketTitle(tk.description)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {ticketCategoryLabel(tc, tk.category)} ·{" "}
                  {tst(tk.status as "NEW" | "IN_PROGRESS" | "RESOLVED")}
                </p>
              </span>
            </div>
          </HubContentCard>
        ))}

        {payment.showInImportant && (
          <HubContentCard href="/payments">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
                <Wallet className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <span className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {payment.periodLabel}
                </p>
                <p className="mt-1 text-xs font-medium text-amber-800 dark:text-amber-200">
                  {t("paymentDue", { amount: payment.totalLabel })}
                </p>
              </span>
            </div>
          </HubContentCard>
        )}

        {vote && (
          <HubContentCard href={`/votes/${vote.id}`}>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md">
                <Vote className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <span className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {vote.title}
                </p>
                <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                  {t("voteAction")}
                </p>
              </span>
            </div>
          </HubContentCard>
        )}

        <p className="text-center text-xs text-slate-500">
          <Link href="/requests" className="font-medium text-blue-700 hover:underline">
            {t("allRequests")}
          </Link>
        </p>
      </div>
    </HubSection>
  );
}
