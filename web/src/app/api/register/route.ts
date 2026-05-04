import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role, UserStatus } from "@/lib/enums";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  street: z.string().min(1),
  houseNumber: z.string().min(1),
  phone: z.string().optional(),
  inviteCode: z.string().optional(),
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

  const { email, password, name, street, houseNumber, phone, inviteCode } =
    parsed.data;
  const normalized = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalized },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Этот email уже зарегистрирован" },
      { status: 409 },
    );
  }

  const invite = process.env.INVITE_CODE?.trim();
  const status =
    invite && inviteCode?.trim() === invite
      ? UserStatus.APPROVED
      : UserStatus.PENDING;

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email: normalized,
      passwordHash,
      name: name.trim(),
      street: street.trim(),
      houseNumber: houseNumber.trim(),
      phone: phone?.trim() || null,
      role: Role.RESIDENT,
      status,
    },
  });

  return NextResponse.json({ ok: true, status });
}
