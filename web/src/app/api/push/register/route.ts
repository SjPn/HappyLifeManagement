import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { token?: string; platform?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const token = body.token?.trim();
  if (!token || token.length > 512) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const platform = body.platform === "ios" ? "ios" : "android";

  await prisma.devicePushToken.upsert({
    where: { token },
    create: {
      token,
      userId: session.user.id,
      platform,
    },
    update: {
      userId: session.user.id,
      platform,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const token = body.token?.trim();
  if (token) {
    await prisma.devicePushToken.deleteMany({
      where: { token, userId: session.user.id },
    });
  }

  return NextResponse.json({ ok: true });
}
