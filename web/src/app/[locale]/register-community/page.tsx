import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { RegisterCommunityForm } from "@/components/RegisterCommunityForm";

export default async function RegisterCommunityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (session?.user) redirect(`/${locale}/dashboard`);

  const t = await getTranslations("onboard");

  return (
    <div className="relative min-h-screen px-4 py-12">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher compact />
      </div>
      <div className="relative z-10 mx-auto max-w-md">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {t("subtitle")}
        </p>
        <div className="mt-8 hl-glass rounded-2xl p-5 sm:p-6">
          <RegisterCommunityForm />
        </div>
        <p className="mt-8 text-center text-sm text-zinc-500">
          <Link href="/register" className="font-semibold text-blue-700 hover:underline">
            {t("joinExisting")}
          </Link>
          {" · "}
          <Link href="/login" className="font-semibold text-blue-700 hover:underline">
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
