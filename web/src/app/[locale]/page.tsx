import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Leaf, Sparkles, Shield, MessagesSquare } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (session?.user?.status === "APPROVED") {
    redirect(`/${locale}/dashboard`);
  }
  if (session?.user && session.user.status === "PENDING") {
    redirect(`/${locale}/pending`);
  }

  const t = await getTranslations("landing");

  const feats = [
    {
      Icon: Sparkles,
      t: t("feat1t"),
      d: t("feat1d"),
    },
    { Icon: Shield, t: t("feat2t"), d: t("feat2d") },
    {
      Icon: MessagesSquare,
      t: t("feat3t"),
      d: t("feat3d"),
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute right-4 top-4 z-20 sm:right-8">
        <LanguageSwitcher />
      </div>
      <div className="pointer-events-none absolute inset-0 hl-grid opacity-80" />
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-teal-400/25 blur-3xl dark:bg-emerald-500/15" />
      <div className="pointer-events-none absolute -right-24 bottom-40 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl dark:bg-teal-600/10" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16 sm:px-8">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-900/70 dark:text-emerald-200">
          <Leaf className="h-3.5 w-3.5" />
          {t("badge")}
        </div>

        <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          {t("subtitle")}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 text-sm font-semibold text-white shadow-xl shadow-emerald-600/30 transition hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] dark:shadow-emerald-900/40"
          >
            {t("login")}
          </Link>
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200/90 bg-white/80 px-8 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:border-emerald-200 hover:bg-white active:scale-[0.98] dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-emerald-800"
          >
            {t("register")}
          </Link>
        </div>

        <ul className="mt-14 space-y-4">
          {feats.map(({ Icon, t: tit, d }) => (
            <li
              key={tit}
              className="flex gap-4 rounded-2xl border border-emerald-500/10 bg-white/60 p-4 shadow-sm backdrop-blur-md dark:border-emerald-400/10 dark:bg-slate-900/50"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/25">
                <Icon className="h-6 w-6" strokeWidth={2} />
              </span>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {tit}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {d}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-12 text-center text-sm text-slate-500 dark:text-slate-500">
          {t("demoLine")}{" "}
          <code className="rounded-lg bg-slate-200/80 px-2 py-1 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            neighbor@happylife.demo
          </code>{" "}
          /{" "}
          <code className="rounded-lg bg-slate-200/80 px-2 py-1 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            demo123
          </code>
        </p>
      </div>
    </div>
  );
}
