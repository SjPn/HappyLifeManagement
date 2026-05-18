import { auth } from "@/auth";
import { SignOutButton } from "@/components/AppShell";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCommunityForSession } from "@/lib/tenant";

export default async function BlockedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const community = await getCommunityForSession(session.user);
  if (!community?.blockedAt) {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations("blocked");

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        {t("text", { name: community.name })}
      </p>
      <div className="mt-10 flex justify-center">
        <SignOutButton />
      </div>
    </div>
  );
}
