import { NextResponse } from "next/server";
import { listCommunityAddresses } from "@/lib/communityAddresses";
import { prisma } from "@/lib/prisma";

/** Публічний список адрес для форми реєстрації */
export async function GET(req: Request) {
  const inviteCode = new URL(req.url).searchParams.get("inviteCode")?.trim();
  if (!inviteCode) {
    return NextResponse.json(
      { error: "inviteCode required" },
      { status: 400 },
    );
  }

  const community = await prisma.community.findUnique({
    where: { inviteCode },
    select: { id: true, blockedAt: true },
  });
  if (!community || community.blockedAt) {
    return NextResponse.json({ error: "invalidInvite" }, { status: 404 });
  }

  const addresses = await listCommunityAddresses(community.id);
  return NextResponse.json({ addresses });
}
