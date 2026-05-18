"use server";

import { auth } from "@/auth";
import {
  markNotificationSeen,
  NotificationScope,
  type NotificationScope as Scope,
} from "@/lib/notifications";
import { revalidateAllLocales } from "@/lib/revalidateI18n";

const allowed = new Set<string>(Object.values(NotificationScope));

export async function markSeen(scope: string) {
  const session = await auth();
  if (!session?.user?.id || !allowed.has(scope)) {
    return { error: "forbidden" as const };
  }
  await markNotificationSeen(session.user.id, scope as Scope);
  const paths: Record<string, string[]> = {
    news: ["/dashboard", "/community/news"],
    votes: ["/dashboard", "/votes"],
    tickets: ["/dashboard", "/requests"],
    payments: ["/dashboard", "/payments"],
    board: ["/community", "/community/board"],
    forum: ["/community", "/community/forum"],
    reports: ["/community", "/community/reports", "/chair/reports"],
  };
  for (const p of paths[scope] ?? []) {
    revalidateAllLocales(p);
  }
  return { ok: true as const };
}
