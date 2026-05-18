"use client";

import { Link } from "@/i18n/navigation";
import { AvatarInitials, HubContentCard } from "@/components/hub/hubUi";
import { useTranslations } from "next-intl";

export type ConversationRow = {
  partnerId: string;
  partnerName: string;
  lastBody: string;
  lastAt: string;
  unread: number;
};

export function MessagesInbox({
  conversations,
}: {
  conversations: ConversationRow[];
}) {
  const t = useTranslations("messages");

  if (conversations.length === 0) {
    return (
      <HubContentCard>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("empty")}</p>
      </HubContentCard>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {conversations.map((c) => (
        <HubContentCard key={c.partnerId} href={`/messages/${c.partnerId}`}>
          <div className="flex items-center gap-3">
            <AvatarInitials name={c.partnerName} tone="cyan" />
            <span className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {c.partnerName}
              </p>
              <p className="truncate text-sm text-slate-500">{c.lastBody}</p>
            </span>
            <span className="shrink-0 text-right">
              <p className="text-xs text-slate-400">
                {new Date(c.lastAt).toLocaleString()}
              </p>
              {c.unread > 0 && (
                <span className="mt-1 inline-block rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-2 py-0.5 text-xs font-semibold text-white">
                  {c.unread}
                </span>
              )}
            </span>
          </div>
        </HubContentCard>
      ))}
    </div>
  );
}
