import { Role } from "@/lib/enums";
import { prisma } from "@/lib/prisma";
import { getAppBaseUrl } from "@/lib/push/appUrl";
import { sendPushToTokens, type PushPayload } from "@/lib/push/fcm";

const STATUS_UK: Record<string, string> = {
  NEW: "Нова",
  IN_PROGRESS: "В роботі",
  RESOLVED: "Вирішено",
};

type PushPref =
  | "pushNotifyNewTickets"
  | "pushNotifyTicketStatus"
  | "pushNotifyNews"
  | "pushNotifyDebt";

function userPrefFilter(pref: PushPref) {
  switch (pref) {
    case "pushNotifyNewTickets":
      return { pushNotifyNewTickets: true };
    case "pushNotifyTicketStatus":
      return { pushNotifyTicketStatus: true };
    case "pushNotifyNews":
      return { pushNotifyNews: true };
    case "pushNotifyDebt":
      return { pushNotifyDebt: true };
  }
}

async function tokensForUsers(
  userIds: string[],
  pref: PushPref,
): Promise<string[]> {
  if (userIds.length === 0) return [];

  const rows = await prisma.devicePushToken.findMany({
    where: {
      userId: { in: userIds },
      user: userPrefFilter(pref),
    },
    select: { token: true },
  });

  return rows.map((r) => r.token);
}

async function deliver(userIds: string[], pref: PushPref, payload: PushPayload) {
  const tokens = await tokensForUsers(userIds, pref);
  await sendPushToTokens(tokens, payload);
}

export async function notifyChairsNewTicket(params: {
  communityId: string;
  authorName: string;
  locale?: string;
}) {
  const locale = params.locale ?? "uk";
  const chairs = await prisma.user.findMany({
    where: {
      communityId: params.communityId,
      role: Role.CHAIR,
      status: "APPROVED",
    },
    select: { id: true },
  });

  await deliver(
    chairs.map((c) => c.id),
    "pushNotifyNewTickets",
    {
      title: "Happy Life",
      body: `Нова заявка від ${params.authorName}`,
      path: `/${locale}/requests`,
    },
  );
}

export async function notifyResidentTicketStatus(params: {
  userId: string;
  status: string;
  locale?: string;
}) {
  const locale = params.locale ?? "uk";
  const label = STATUS_UK[params.status] ?? params.status;

  await deliver([params.userId], "pushNotifyTicketStatus", {
    title: "Happy Life",
    body: `Ваша заявка: ${label}`,
    path: `/${locale}/requests`,
  });
}

export async function notifyResidentsNews(params: {
  communityId: string;
  title: string;
  authorId: string;
  locale?: string;
}) {
  const locale = params.locale ?? "uk";
  const residents = await prisma.user.findMany({
    where: {
      communityId: params.communityId,
      status: "APPROVED",
      role: { in: [Role.RESIDENT, Role.MODERATOR, Role.CHAIR] },
      id: { not: params.authorId },
    },
    select: { id: true },
  });

  const excerpt =
    params.title.length > 80 ? `${params.title.slice(0, 77)}…` : params.title;

  await deliver(
    residents.map((r) => r.id),
    "pushNotifyNews",
    {
      title: "Новина від голови",
      body: excerpt,
      path: `/${locale}/dashboard`,
    },
  );
}

export async function notifyResidentDebt(params: {
  userId: string;
  amountUah: number;
  locale?: string;
}) {
  const locale = params.locale ?? "uk";
  await deliver([params.userId], "pushNotifyDebt", {
    title: "Happy Life",
    body: `Нагадування: борг ${params.amountUah.toFixed(0)} ₴`,
    path: `/${locale}/payments`,
  });
}

/** For health checks / logging. */
export function pushDeepLink(path: string): string {
  return `${getAppBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
