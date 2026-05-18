"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { X } from "lucide-react";
import { Card } from "@/components/Ui";
import { TicketStatusForm } from "@/components/TicketStatusForm";
import { useTranslations } from "next-intl";

export type TicketRow = {
  id: string;
  category: string;
  description: string;
  photoUrl: string | null;
  locationNote: string | null;
  status: string;
  createdAt: string;
  userName: string;
  userStreet: string;
  userHouseNumber: string;
};

function ticketTitle(description: string, maxLen = 72) {
  const line = description.split("\n")[0]?.trim() || description.trim();
  if (line.length <= maxLen) return line;
  return `${line.slice(0, maxLen)}…`;
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "NEW":
      return "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200";
    case "RESOLVED":
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800";
  }
}

function TicketDetailModal({
  ticket,
  staff,
  onClose,
  onResolved,
}: {
  ticket: TicketRow;
  staff: boolean;
  onClose: () => void;
  onResolved?: () => void;
}) {
  const t = useTranslations("requests");
  const tc = useTranslations("categories.ticket");
  const tst = useTranslations("categories.ticketStatus");
  const tChair = useTranslations("chair");

  const createdLabel = new Date(ticket.createdAt).toLocaleString();

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
        aria-label={tChair("closeModal")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-modal-title"
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-medium uppercase text-blue-700 dark:text-blue-300">
              {tc(ticket.category as "ROADS" | "LIGHTING" | "SECURITY" | "WATER" | "TRASH" | "OTHER")}
            </p>
            <h2
              id="ticket-modal-title"
              className="mt-1 text-lg font-semibold leading-snug"
            >
              {ticketTitle(ticket.description, 120)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label={tChair("closeModal")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4">
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(ticket.status)}`}
          >
            {tst(ticket.status as "NEW" | "IN_PROGRESS" | "RESOLVED")}
          </span>

          <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
            {ticket.description}
          </p>

          {ticket.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ticket.photoUrl}
              alt=""
              className="mt-4 max-h-64 w-full rounded-xl object-cover ring-1 ring-black/5"
            />
          )}

          {ticket.locationNote && (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              {t("locationHint")}: {ticket.locationNote}
            </p>
          )}

          <p className="mt-3 text-xs text-zinc-500">
            {staff ? (
              <>
                {ticket.userName}, {ticket.userStreet} {ticket.userHouseNumber}
                {" · "}
              </>
            ) : null}
            {createdLabel}
          </p>

          {staff && (
            <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <p className="mb-2 text-xs text-zinc-500">{t("status")}</p>
              <TicketStatusForm
                ticketId={ticket.id}
                current={ticket.status}
                onStatusChange={(status) => {
                  if (status === "RESOLVED") onResolved?.();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function RequestsPanel({
  tickets,
  staff,
  emptyMessage,
  archiveHref,
  archiveCount,
  backHref,
  backLabel,
}: {
  tickets: TicketRow[];
  staff: boolean;
  emptyMessage: string;
  archiveHref?: string;
  archiveCount?: number;
  backHref?: string;
  backLabel?: string;
}) {
  const tst = useTranslations("categories.ticketStatus");
  const t = useTranslations("requests");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId
    ? tickets.find((tk) => tk.id === selectedId) ?? null
    : null;

  const close = useCallback(() => setSelectedId(null), []);

  return (
    <>
      {tickets.length === 0 ? (
        <Card>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {emptyMessage}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {tickets.map((tk) => (
              <li key={tk.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(tk.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                >
                  <span className="min-w-0 flex-1 font-medium text-slate-900 dark:text-slate-100">
                    {ticketTitle(tk.description)}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(tk.status)}`}
                  >
                    {tst(tk.status as "NEW" | "IN_PROGRESS" | "RESOLVED")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {archiveHref != null && (
        <p className="mt-4 text-center text-sm">
          <Link href={archiveHref} className="font-semibold text-blue-700 hover:underline">
            {t("archiveLink", { count: archiveCount ?? 0 })}
          </Link>
        </p>
      )}

      {backHref && backLabel && (
        <p className="mt-4 text-center text-sm">
          <Link href={backHref} className="text-blue-700 hover:underline">
            {backLabel}
          </Link>
        </p>
      )}

      {selected && (
        <TicketDetailModal
          ticket={selected}
          staff={staff}
          onClose={close}
          onResolved={close}
        />
      )}
    </>
  );
}
