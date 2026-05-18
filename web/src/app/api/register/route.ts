import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role, UserStatus } from "@/lib/enums";
import { TenancyType } from "@/lib/audience";
import { resolveCommunityAddress } from "@/lib/communityAddresses";
import { normalizeInviteCode } from "@/lib/tenant";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  communityAddressId: z.string().min(1),
  phone: z.string().optional(),
  inviteCode: z.string().min(1),
  tenancyType: z.enum([TenancyType.OWNER, TenancyType.TENANT]),
  memorandumAccepted: z.literal(true),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте поля формы" },
      { status: 400 },
    );
  }

  const {
    email,
    password,
    name,
    communityAddressId,
    phone,
    inviteCode,
    tenancyType,
  } = parsed.data;
  const normalized = email.trim().toLowerCase();
  const code = normalizeInviteCode(inviteCode);

  const community = await prisma.community.findUnique({
    where: { inviteCode: code },
    select: { id: true, blockedAt: true, approvedAt: true },
  });
  if (!community || community.blockedAt || !community.approvedAt) {
    return NextResponse.json(
      { error: "invalidInvite" },
      { status: 400 },
    );
  }

  const address = await resolveCommunityAddress(
    communityAddressId,
    community.id,
  );
  if (!address) {
    return NextResponse.json(
      { error: "invalidAddress" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalized },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Этот email уже зарегистрирован" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const memorandumVersion = "MVP-2026-05-05";
  await prisma.user.create({
    data: {
      email: normalized,
      passwordHash,
      name: name.trim(),
      communityId: community.id,
      street: address.street,
      houseNumber: address.houseNumber,
      communityAddressId: address.id,
      phone: phone?.trim() || null,
      role: Role.RESIDENT,
      status: UserStatus.PENDING,
      tenancyType,
      memorandumAcceptedAt: new Date(),
      memorandumVersion,
    },
  });

  return NextResponse.json({ ok: true, status: UserStatus.PENDING });
}
