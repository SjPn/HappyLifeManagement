"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";
import {
  assertCommunityActive,
  communityWhere,
  requireCommunityId,
} from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import { revalidateAllLocales } from "@/lib/revalidateI18n";

export async function sendDirectMessage(recipientId: string, body: string) {
  const session = await auth();
  if (!session?.user) return { error: "auth" };

  const senderId = session.user.id;
  if (session.user.role === Role.MODERATOR) {
    return { error: "forbidden" };
  }

  const communityId = requireCommunityId(session.user);
  await assertCommunityActive(communityId);

  const text = body.trim();
  if (!text || text.length > 4000) return { error: "invalidBody" };

  const recipient = await prisma.user.findFirst({
    where: {
      id: recipientId,
      communityId,
      status: "APPROVED",
      role: { in: [Role.RESIDENT, Role.CHAIR] },
    },
  });
  if (!recipient || recipient.id === senderId) {
    return { error: "recipient" };
  }

  await prisma.directMessage.create({
    data: {
      communityId,
      senderId,
      recipientId,
      body: text,
    },
  });

  await revalidateAllLocales("/messages");
  revalidatePath(`/messages/${recipientId}`);
  return { ok: true };
}

export async function markMessagesRead(partnerId: string) {
  const session = await auth();
  if (!session?.user) return;

  const communityId = requireCommunityId(session.user);
  const userId = session.user.id;

  await prisma.directMessage.updateMany({
    where: {
      ...communityWhere(communityId),
      senderId: partnerId,
      recipientId: userId,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  await prisma.userSeenState.upsert({
    where: { userId },
    create: { userId, messagesAt: new Date() },
    update: { messagesAt: new Date() },
  });
}
