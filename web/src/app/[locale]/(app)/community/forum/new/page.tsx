import { PageTitle } from "@/components/Ui";
import { ForumNewForm } from "@/components/ForumNewForm";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function ForumNewPage() {
  const session = await auth();
  if (session!.user!.role === "MODERATOR") {
    const locale = await getLocale();
    redirect(`/${locale}/chair`);
  }
  const t = await getTranslations("forum");
  return (
    <>
      <PageTitle title={t("newTitle")} />
      <ForumNewForm />
    </>
  );
}
