import { PageTitle, Card } from "@/components/Ui";
import { CommunityContentDisplay } from "@/components/CommunityContentDisplay";
import { getCommunityContentForViewer } from "@/lib/communityContent";
import { getTranslations } from "next-intl/server";

export default async function TariffsPage() {
  const t = await getTranslations("tariffs");
  const tp = await getTranslations("profile");
  const community = await getCommunityContentForViewer();

  return (
    <>
      <PageTitle
        title={t("title")}
        subtitle={t("subtitle")}
        backHref="/profile"
        backLabel={tp("title")}
      />
      <Card>
        <CommunityContentDisplay
          body={community?.tariffsBody}
          namespace="tariffs"
        />
      </Card>
    </>
  );
}
