import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PageTitle } from "@/components/Ui";
import { ChairDashboardActions } from "@/components/ChairDashboardActions";
import { getChairDashboardStats } from "@/lib/chairDashboard";
import { requireCommunityId } from "@/lib/tenant";
import { getLocale, getTranslations } from "next-intl/server";

export default async function ChairHomePage() {
  const session = await auth();
  const locale = await getLocale();
  if (session!.user!.role !== "CHAIR" && session!.user!.role !== "MODERATOR") {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations("chair");
  const tDash = await getTranslations("dashboard");
  const isChair = session!.user!.role === "CHAIR";
  const communityId = requireCommunityId(session!.user!);
  const stats = await getChairDashboardStats(communityId);

  return (
    <>
      <PageTitle
        title={t("title")}
        subtitle={isChair ? t("subtitleChair") : t("subtitleModerator")}
        backHref="/profile"
        backLabel={t("backProfile")}
      />

      <ChairDashboardActions stats={stats} isChair={isChair} />

      <p className="mt-8 text-center text-sm">
        <Link href="/profile" className="text-blue-700 hover:underline">
          {t("backProfile")}
        </Link>
        {!isChair && (
          <>
            {" · "}
            <Link href="/dashboard" className="text-blue-700 hover:underline">
              {tDash("chairHub.backHome")}
            </Link>
          </>
        )}
      </p>
    </>
  );
}
