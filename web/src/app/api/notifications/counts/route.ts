import { auth } from "@/auth";
import { getNotificationCounts } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { requireCommunityId } from "@/lib/tenant";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let communityId: string;
  try {
    communityId = requireCommunityId(session.user);
  } catch {
    return NextResponse.json({ error: "no_community" }, { status: 403 });
  }

  const user = await prisma.user.findFirst({
    where: { id: session.user.id, communityId },
    select: {
      id: true,
      role: true,
      tenancyType: true,
      street: true,
      houseNumber: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const counts = await getNotificationCounts({ ...user, communityId });
  return NextResponse.json(counts);
}
