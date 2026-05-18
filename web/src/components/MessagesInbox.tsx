"use client";

import { Link } from "@/i18n/navigation";
import { Card } from "@/components/Ui";
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
      <Card>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("empty")}</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {conversations.map((c) => (
          <li key={c.partnerId}>
            <Link
              href={`/messages/${c.partnerId}`}
              className="flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{c.partnerName}</p>
                <p className="truncate text-sm text-zinc-500">{c.lastBody}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-zinc-400">
                  {new Date(c.lastAt).toLocaleString()}
                </p>
                {c.unread > 0 && (
                  <span className="mt-1 inline-block rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                    {c.unread}
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
