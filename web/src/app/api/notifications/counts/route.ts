import { auth } from "@/auth";
import { getNotificationCounts } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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

  const counts = await getNotificationCounts(user);
  return NextResponse.json(counts);
}
