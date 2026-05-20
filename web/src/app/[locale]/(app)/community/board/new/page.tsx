import { PageTitle } from "@/components/Ui";
import { BoardNewForm } from "@/components/BoardNewForm";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function BoardNewPage() {
  const session = await auth();
  if (session!.user!.role === "MODERATOR") {
    const locale = await getLocale();
    redirect(`/${locale}/chair`);
  }
  const t = await getTranslations("board");
  return (
    <>
      <PageTitle
        title={t("newTitle")}
        backHref="/community/board"
        backLabel={t("title")}
      />
      <BoardNewForm />
    </>
  );
}
