"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReportKind } from "@/lib/enums";
import { revalidateAllLocales } from "@/lib/revalidateI18n";

const kinds = new Set<string>(Object.values(ReportKind));

export async function createConfidentialReport(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return { error: "noAccess" as const };
  }
  if (session.user.role === "MODERATOR") {
    return { error: "forbidden" as const };
  }

  const kindRaw = String(formData.get("kind") || "");
  const kind = kinds.has(kindRaw) ? kindRaw : "SUGGESTION";
  const category = String(formData.get("category") || "").trim() || "Загальне";
  const body = String(formData.get("body") || "").trim();
  if (!body) return { error: "noDescription" as const };

  await prisma.confidentialReport.create({
    data: {
      kind,
      category,
      body,
      authorId: session.user.id,
    },
  });

  revalidateAllLocales("/community/reports");
  revalidateAllLocales("/chair/reports");
  return { ok: true as const };
}

export async function updateReportStatus(
  reportId: string,
  status: string,
  published: boolean,
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "noAccess" as const };
  if (session.user.role !== "CHAIR" && session.user.role !== "MODERATOR") {
    return { error: "noAccess" as const };
  }

  const allowed = new Set(["NEW", "REVIEWING", "CLOSED"]);
  if (!allowed.has(status)) return { error: "badStatus" as const };

  await prisma.confidentialReport.update({
    where: { id: reportId },
    data: { status, published },
  });

  revalidateAllLocales("/community/reports");
  revalidateAllLocales("/chair/reports");
  return { ok: true };
}
