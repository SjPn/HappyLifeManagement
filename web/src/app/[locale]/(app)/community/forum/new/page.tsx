import { PageTitle } from "@/components/Ui";
import { ForumNewForm } from "@/components/ForumNewForm";
import { getTranslations } from "next-intl/server";

export default async function ForumNewPage() {
  const t = await getTranslations("forum");
  return (
    <>
      <PageTitle title={t("newTitle")} />
      <ForumNewForm />
    </>
  );
}
