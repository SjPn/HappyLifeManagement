import { PageTitle, Card } from "@/components/Ui";
import { getTranslations } from "next-intl/server";
import { CircleHelp } from "lucide-react";

export default async function HelpPage() {
  const t = await getTranslations("help");
  const tp = await getTranslations("profile");

  const helps = [t("helps1"), t("helps2"), t("helps3"), t("helps4")] as const;
  const nav = [t("navHome"), t("navRequests"), t("navCommunity"), t("navMore")] as const;

  return (
    <>
      <PageTitle
        title={t("title")}
        subtitle={t("subtitle")}
        backHref="/profile"
        backLabel={tp("title")}
      />

      <Card className="mb-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 text-white shadow-md">
            <CircleHelp className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {t("why")}
          </p>
        </div>
      </Card>

      <Card className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {t("helpsTitle")}
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
          {helps.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Card>

      <Card className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {t("navTitle")}
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
          {nav.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{t("badge")}</p>
      </Card>

      <Card>
        <p className="text-sm text-slate-700 dark:text-slate-300">{t("notChat")}</p>
        <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-200">
          {t("questions")}
        </p>
      </Card>
    </>
  );
}
