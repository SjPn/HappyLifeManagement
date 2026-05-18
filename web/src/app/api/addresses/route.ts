import { NextResponse } from "next/server";
import { listCommunityAddresses } from "@/lib/communityAddresses";
import { prisma } from "@/lib/prisma";
import { normalizeInviteCode } from "@/lib/tenant";

/** Публічний список адрес для форми реєстрації */
export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("inviteCode") ?? "";
  const inviteCode = normalizeInviteCode(raw);
  if (!inviteCode) {
    return NextResponse.json(
      { error: "inviteCode required" },
      { status: 400 },
    );
  }

  const community = await prisma.community.findUnique({
    where: { inviteCode },
    select: { id: true, blockedAt: true, approvedAt: true },
  });
  if (!community || community.blockedAt || !community.approvedAt) {
    return NextResponse.json({ error: "invalidInvite" }, { status: 404 });
  }

  const addresses = await listCommunityAddresses(community.id);
  return NextResponse.json({ addresses });
}
