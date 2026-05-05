import { PageTitle, Card } from "@/components/Ui";
import { getTranslations } from "next-intl/server";

export default async function TariffsPage() {
  const t = await getTranslations("tariffs");
  return (
    <>
      <PageTitle title={t("title")} subtitle={t("subtitle")} />
      <Card>
        <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
          <p className="font-medium">{t("placeholderTitle")}</p>
          <p>{t("placeholderBody")}</p>
        </div>
      </Card>
    </>
  );
}

