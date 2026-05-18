import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PageTitle } from "@/components/Ui";
import { ReportModerationRow } from "@/components/ReportModerationRow";
import { getLocale, getTranslations } from "next-intl/server";
import { communityWhere, requireCommunityId } from "@/lib/tenant";

export default async function ChairReportsPage() {
  const session = await auth();
  const communityId = requireCommunityId(session!.user!);
  const locale = await getLocale();
  if (session!.user!.role !== "CHAIR" && session!.user!.role !== "MODERATOR") {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations("chair");
  const canSeeAuthor = session!.user!.role === "MODERATOR";

  const reports = await prisma.confidentialReport.findMany({
    where: communityWhere(communityId),
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });

  return (
    <>
      <PageTitle title={t("reportsModTitle")} subtitle={t("reportsModSubtitle")} />
      <div className="flex flex-col gap-4">
        {reports.map((r) => (
          <ReportModerationRow
            key={r.id}
            id={r.id}
            kind={r.kind}
            status={r.status}
            published={r.published}
            body={r.body}
            canSeeAuthor={canSeeAuthor}
            authorName={
              canSeeAuthor ? `${r.author.name} <${r.author.email}>` : undefined
            }
          />
        ))}
        {reports.length === 0 && (
          <p className="text-sm text-zinc-600">{t("reportsEmpty")}</p>
        )}
      </div>
    </>
  );
}
