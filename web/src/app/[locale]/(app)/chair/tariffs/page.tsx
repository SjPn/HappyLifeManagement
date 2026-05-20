import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PageTitle, Card } from "@/components/Ui";
import { CommunityContentEditor } from "@/components/CommunityContentEditor";
import { updateCommunityTariffs } from "@/actions/chair";
import { getCommunityContentById } from "@/lib/communityContent";
import { requireCommunityId } from "@/lib/tenant";
import { getLocale, getTranslations } from "next-intl/server";
import { Role } from "@/lib/enums";

export default async function ChairTariffsEditPage() {
  const session = await auth();
  const locale = await getLocale();
  if (session?.user?.role !== Role.CHAIR) {
    redirect(`/${locale}/dashboard`);
  }

  const communityId = requireCommunityId(session.user);
  const community = await getCommunityContentById(communityId);
  const t = await getTranslations("chair");
  const tt = await getTranslations("tariffs");

  return (
    <>
      <PageTitle
        title={tt("title")}
        subtitle={t("tariffsEditSubtitle")}
        backHref="/chair"
        backLabel={t("backPanel")}
      />
      <Card>
        <CommunityContentEditor
          kind="tariffs"
          initialBody={community?.tariffsBody ?? null}
          saveAction={updateCommunityTariffs}
          publicHref="/info/tariffs"
        />
      </Card>
    </>
  );
}
