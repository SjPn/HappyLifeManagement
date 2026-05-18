import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PageTitle } from "@/components/Ui";
import { ChairManagementLinks } from "@/components/ChairManagementLinks";
import { getLocale, getTranslations } from "next-intl/server";

export default async function ChairHomePage() {
  const session = await auth();
  const locale = await getLocale();
  if (session!.user!.role !== "CHAIR" && session!.user!.role !== "MODERATOR") {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations("chair");
  const isChair = session!.user!.role === "CHAIR";

  return (
    <>
      <PageTitle
        title={t("title")}
        subtitle={isChair ? t("subtitleChair") : t("subtitleModerator")}
      />

      <div className="mb-8">
        <ChairManagementLinks isChair={isChair} />
      </div>

      <p className="text-center text-sm">
        <Link href="/profile" className="text-blue-700 hover:underline">
          {t("backProfile")}
        </Link>
      </p>
    </>
  );
}
