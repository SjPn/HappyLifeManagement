import { NextResponse } from "next/server";
import { listCommunityAddresses } from "@/lib/communityAddresses";

/** Публічний список адрес для форми реєстрації */
export async function GET() {
  const addresses = await listCommunityAddresses();
  return NextResponse.json({ addresses });
}
