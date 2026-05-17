import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SignOutButton } from "@/components/AppShell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function PendingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }
  if (session.user.status === "APPROVED") {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations("pending");

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-4 py-16">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher compact />
      </div>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">{t("text")}</p>
      <p className="mt-4 text-sm text-slate-500">
        {t("signedInAs")}{" "}
        <strong className="text-slate-800 dark:text-slate-200">
          {session.user.email}
        </strong>
      </p>
      <div className="mt-10 flex flex-col gap-3">
        <SignOutButton />
        <Link
          href="/"
          className="text-center text-sm font-medium text-blue-700 hover:underline"
        >
          {t("homeLink")}
        </Link>
      </div>
    </div>
  );
}
