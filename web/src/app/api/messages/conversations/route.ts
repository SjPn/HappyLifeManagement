import { auth } from "@/auth";
import { listConversations } from "@/lib/conversations";
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

  const conversations = await listConversations(
    communityId,
    session.user.id,
  );
  return NextResponse.json({ conversations });
}
