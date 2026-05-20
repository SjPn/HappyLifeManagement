import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PageTitle, Card } from "@/components/Ui";
import { CommunityContentEditor } from "@/components/CommunityContentEditor";
import { updateCommunityMemorandum } from "@/actions/chair";
import { getCommunityContentById } from "@/lib/communityContent";
import { requireCommunityId } from "@/lib/tenant";
import { getLocale, getTranslations } from "next-intl/server";
import { Role } from "@/lib/enums";

export default async function ChairMemorandumEditPage() {
  const session = await auth();
  const locale = await getLocale();
  if (session?.user?.role !== Role.CHAIR) {
    redirect(`/${locale}/dashboard`);
  }

  const communityId = requireCommunityId(session.user);
  const community = await getCommunityContentById(communityId);
  const t = await getTranslations("chair");
  const tm = await getTranslations("memorandum");

  return (
    <>
      <PageTitle
        title={tm("title")}
        subtitle={t("memorandumEditSubtitle")}
        backHref="/chair"
        backLabel={t("backPanel")}
      />
      <Card>
        <CommunityContentEditor
          kind="memorandum"
          initialBody={community?.memorandumBody ?? null}
          initialVersion={community?.memorandumVersion ?? null}
          saveAction={updateCommunityMemorandum}
          publicHref="/info/memorandum"
        />
      </Card>
    </>
  );
}
