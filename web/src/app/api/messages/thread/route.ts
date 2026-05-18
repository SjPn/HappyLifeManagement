import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";
import { communityWhere, requireCommunityId } from "@/lib/tenant";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (session.user.role === Role.MODERATOR) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let communityId: string;
  try {
    communityId = requireCommunityId(session.user);
  } catch {
    return NextResponse.json({ error: "no_community" }, { status: 403 });
  }

  const partnerId = new URL(req.url).searchParams.get("partnerId") ?? "";
  if (!partnerId) {
    return NextResponse.json({ error: "partnerId required" }, { status: 400 });
  }

  const userId = session.user.id;
  const partner = await prisma.user.findFirst({
    where: {
      id: partnerId,
      ...communityWhere(communityId),
      status: "APPROVED",
      role: { in: [Role.RESIDENT, Role.CHAIR] },
    },
    select: { id: true },
  });
  if (!partner) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const rows = await prisma.directMessage.findMany({
    where: {
      ...communityWhere(communityId),
      OR: [
        { senderId: userId, recipientId: partnerId },
        { senderId: partnerId, recipientId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  const messages = rows.map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    mine: m.senderId === userId,
  }));

  return NextResponse.json({ messages });
}
