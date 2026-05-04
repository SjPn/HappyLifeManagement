import { PageTitle } from "@/components/Ui";
import { BoardNewForm } from "@/components/BoardNewForm";
import { getTranslations } from "next-intl/server";

export default async function BoardNewPage() {
  const t = await getTranslations("board");
  return (
    <>
      <PageTitle title={t("newTitle")} />
      <BoardNewForm />
    </>
  );
}
