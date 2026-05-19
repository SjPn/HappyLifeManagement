"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Construction,
  Droplets,
  HelpCircle,
  Lightbulb,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/Ui";
import { TicketCategory } from "@/lib/enums";
import { ticketCategoryLabel } from "@/lib/ticketDisplay";
import { TicketStatusForm } from "@/components/TicketStatusForm";
import { TicketCommentForm } from "@/components/TicketCommentForm";
import { TicketTimeline } from "@/components/TicketTimeline";
import { TicketRatingForm } from "@/components/TicketRatingForm";
import { useTranslations } from "next-intl";

export type TicketCommentRow = {
  id: string;
  body: string;
  imageUrl: string | null;
  createdAt: string;
  authorName: string;
  authorRole: string;
};

export type TicketRow = {
  id: string;
  category: string;
  description: string;
  photoUrl: string | null;
  locationNote: string | null;
  status: string;
  statusChangedAt: string;
  updatedAt: string;
  rating: number | null;
  createdAt: string;
  userName: string;
  userStreet: string;
  userHouseNumber: string;
  ownerId: string;
  comments: TicketCommentRow[];
};

function ticketTitle(description: string, maxLen = 72) {
  const line = description.split("\n")[0]?.trim() || description.trim();
  if (line.length <= maxLen) return line;
  return `${line.slice(0, maxLen)}…`;
}

const ticketCategoryIcon: Record<string, LucideIcon> = {
  [TicketCategory.ROADS]: Construction,
  [TicketCategory.LIGHTING]: Lightbulb,
  [TicketCategory.SECURITY]: Shield,
  [TicketCategory.WATER]: Droplets,
  [TicketCategory.TRASH]: Trash2,
  [TicketCategory.OTHER]: HelpCircle,
};

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
  currentUserId,
  onClose,
  onResolved,
}: {
  ticket: TicketRow;
  staff: boolean;
  currentUserId: string;
  onClose: () => void;
  onResolved?: () => void;
}) {
  const t = useTranslations("requests");
  const tc = useTranslations("categories.ticket");
  const tst = useTranslations("categories.ticketStatus");
  const tr = useTranslations("categories.roles");
  const tChair = useTranslations("chair");

  const createdLabel = new Date(ticket.createdAt).toLocaleString();
  const canReply = staff || ticket.ownerId === currentUserId;

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
        className="hl-glass relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-medium uppercase text-blue-700 dark:text-blue-300">
              {ticketCategoryLabel(tc, ticket.category)}
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

          <TicketTimeline
            status={ticket.status}
            createdAt={ticket.createdAt}
            statusChangedAt={ticket.statusChangedAt}
            updatedAt={ticket.updatedAt}
          />

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

          {ticket.comments.length > 0 && (
            <div className="mt-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600/90 dark:text-blue-400/90">
                {t("commentsTitle")}
              </p>
              {ticket.comments.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40"
                >
                  <p className="text-xs text-zinc-500">
                    {c.authorName} ·{" "}
                    {tr(c.authorRole as "RESIDENT" | "MODERATOR" | "CHAIR")} ·{" "}
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                  {c.body && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
                      {c.body}
                    </p>
                  )}
                  {c.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.imageUrl}
                      alt=""
                      className="mt-3 max-h-48 w-full rounded-lg object-cover ring-1 ring-black/5"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

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

          {canReply && <TicketCommentForm ticketId={ticket.id} />}

          {ticket.status === "RESOLVED" &&
            ticket.ownerId === currentUserId && (
              <TicketRatingForm
                ticketId={ticket.id}
                initialRating={ticket.rating}
              />
            )}
        </div>
      </div>
    </div>
  );
}

export function RequestsPanel({
  tickets,
  staff,
  currentUserId,
  emptyMessage,
  archiveHref,
  archiveCount,
  backHref,
  backLabel,
}: {
  tickets: TicketRow[];
  staff: boolean;
  currentUserId: string;
  emptyMessage: string;
  archiveHref?: string;
  archiveCount?: number;
  backHref?: string;
  backLabel?: string;
}) {
  const tst = useTranslations("categories.ticketStatus");
  const tc = useTranslations("categories.ticket");
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
        <div className="flex flex-col gap-2.5">
          {tickets.map((tk) => {
            const Icon = ticketCategoryIcon[tk.category] ?? HelpCircle;
            return (
              <button
                key={tk.id}
                type="button"
                onClick={() => setSelectedId(tk.id)}
                className="hl-glass group flex w-full items-center gap-3 rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300/50 hover:shadow-lg"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 text-white shadow-md shadow-blue-500/25">
                  <Icon className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-slate-900 group-hover:text-blue-800 dark:text-slate-100">
                    {ticketTitle(tk.description)}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {ticketCategoryLabel(tc, tk.category)}
                    {tk.comments.length > 0
                      ? ` · ${t("commentsCount", { count: tk.comments.length })}`
                      : ""}
                    {" · "}
                    {t("updatedAt", {
                      date: new Date(tk.updatedAt).toLocaleDateString(),
                    })}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(tk.status)}`}
                >
                  {tst(tk.status as "NEW" | "IN_PROGRESS" | "RESOLVED")}
                </span>
              </button>
            );
          })}
        </div>
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
          currentUserId={currentUserId}
          onClose={close}
          onResolved={close}
        />
      )}
    </>
  );
}
