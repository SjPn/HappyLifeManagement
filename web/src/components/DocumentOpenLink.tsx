"use client";

import { markEntitySeenAction } from "@/actions/entitySeen";
import { EntitySeenType } from "@/lib/entitySeen";
import { NOTIFICATIONS_REFRESH_EVENT } from "@/lib/notificationRefresh";
import { useNotifications } from "@/components/NotificationProvider";

export function DocumentOpenLink({
  documentId,
  href,
  children,
  className,
}: {
  documentId: string;
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { refresh } = useNotifications();

  async function onClick() {
    await markEntitySeenAction(EntitySeenType.document, documentId);
    await refresh();
    window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT));
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => void onClick()}
    >
      {children}
    </a>
  );
}
