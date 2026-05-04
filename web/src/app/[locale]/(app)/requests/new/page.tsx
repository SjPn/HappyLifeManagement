import { PageTitle } from "@/components/Ui";
import { TicketNewForm } from "@/components/TicketNewForm";
import { getTranslations } from "next-intl/server";

export default async function NewTicketPage() {
  const t = await getTranslations("requests");
  return (
    <>
      <PageTitle title={t("newTitle")} subtitle={t("newSubtitle")} />
      <TicketNewForm />
    </>
  );
}
