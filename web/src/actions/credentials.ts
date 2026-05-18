"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  isPasswordStrongEnough,
  passwordsMatch,
} from "@/lib/credentials";
import { revalidateAllLocales } from "@/lib/revalidateI18n";

export async function updateMyEmail(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "noAccess" as const };

  const newEmail = String(formData.get("newEmail") ?? "")
    .trim()
    .toLowerCase();
  const currentPassword = String(formData.get("currentPassword") ?? "");

  if (!newEmail || !newEmail.includes("@")) {
    return { error: "invalidEmail" as const };
  }
  if (!currentPassword) return { error: "wrongPassword" as const };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, passwordHash: true },
  });
  if (!user) return { error: "noAccess" as const };

  if (user.email === newEmail) return { ok: true as const, email: newEmail };

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return { error: "wrongPassword" as const };

  const taken = await prisma.user.findUnique({
    where: { email: newEmail },
    select: { id: true },
  });
  if (taken && taken.id !== user.id) {
    return { error: "emailTaken" as const };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { email: newEmail },
  });

  revalidateAllLocales("/profile");
  return { ok: true as const, email: newEmail };
}

export async function updateMyPassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "noAccess" as const };

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword) return { error: "wrongPassword" as const };
  if (!isPasswordStrongEnough(newPassword)) {
    return { error: "passwordTooShort" as const };
  }
  if (!passwordsMatch(newPassword, confirmPassword)) {
    return { error: "passwordMismatch" as const };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user) return { error: "noAccess" as const };

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return { error: "wrongPassword" as const };

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  });

  revalidateAllLocales("/profile");
  return { ok: true as const };
}
