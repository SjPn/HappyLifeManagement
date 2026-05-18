import { getTranslations } from "next-intl/server";

export async function CommunityContentDisplay({
  body,
  version,
  namespace,
}: {
  body: string | null | undefined;
  version?: string | null;
  namespace: "memorandum" | "tariffs";
}) {
  const t = await getTranslations(namespace);
  const text = body?.trim();

  if (!text) {
    return (
      <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
        <p className="font-medium">{t("placeholderTitle")}</p>
        <p>{t("placeholderBody")}</p>
        {namespace === "memorandum" && (
          <p className="text-xs text-zinc-500">{t("versionLine")}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
      <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
      {namespace === "memorandum" && version && (
        <p className="text-xs text-zinc-500">
          {t("versionLabel", { version })}
        </p>
      )}
    </div>
  );
}
