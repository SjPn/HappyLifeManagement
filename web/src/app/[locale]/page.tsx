import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Leaf, Sparkles, Shield, MessagesSquare } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DemoRolePicker } from "@/components/DemoRolePicker";
import { isDemoEnabled } from "@/lib/demo";

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

  const pains = [
    t("pain1"),
    t("pain2"),
    t("pain3"),
    t("pain4"),
    t("pain5"),
  ] as const;

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
      <div className="pointer-events-auto absolute right-4 top-4 z-30 sm:right-8">
        <LanguageSwitcher />
      </div>
      <div className="pointer-events-none absolute inset-0 hl-grid opacity-80" />
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-sky-400/25 blur-3xl dark:bg-blue-500/15" />
      <div className="pointer-events-none absolute -right-24 bottom-40 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl dark:bg-sky-600/10" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-20 sm:px-8">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-500/20 bg-white/70 px-3 py-1 text-xs font-semibold text-blue-800 shadow-sm backdrop-blur dark:border-blue-400/20 dark:bg-slate-900/70 dark:text-blue-200">
          <Leaf className="h-3.5 w-3.5" />
          {t("badge")}
        </div>

        <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-lg text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          {t("subtitle")}
        </p>

        <section className="mt-8 rounded-2xl border border-blue-500/15 bg-white/70 p-5 shadow-sm backdrop-blur-md dark:border-blue-400/15 dark:bg-slate-900/60">
          <h2 className="text-sm font-bold uppercase tracking-wide text-blue-800 dark:text-blue-300">
            {t("whyTitle")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {t("whyLead")}
          </p>
          <ul className="mt-4 space-y-2.5">
            {pains.map((line) => (
              <li
                key={line}
                className="flex gap-2 text-sm text-slate-800 dark:text-slate-200"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400"
                  aria-hidden
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <ul className="mt-6 space-y-3">
          {feats.map(({ Icon, t: tit, d }) => (
            <li
              key={tit}
              className="flex gap-4 rounded-2xl border border-blue-500/10 bg-white/60 p-4 shadow-sm backdrop-blur-md dark:border-blue-400/10 dark:bg-slate-900/50"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-sky-600 text-white shadow-lg shadow-blue-600/25">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {tit}
                </p>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                  {d}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {t("notChat")}
        </p>

        {isDemoEnabled() && (
          <div className="mt-8">
            <DemoRolePicker />
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 px-8 text-sm font-semibold text-white shadow-xl shadow-blue-600/30 transition hover:from-blue-500 hover:to-sky-500 active:scale-[0.98] dark:shadow-blue-900/40"
          >
            {t("login")}
          </Link>
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200/90 bg-white/80 px-8 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:border-blue-200 hover:bg-white active:scale-[0.98] dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-blue-800"
          >
            {t("register")}
          </Link>
        </div>

        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
          <Link
            href="/register-community"
            className="font-semibold text-blue-700 hover:underline dark:text-blue-400"
          >
            {t("createCommunity")}
          </Link>
          <span className="mt-1 block text-xs text-slate-500">
            {t("createCommunityHint")}
          </span>
        </p>
      </div>
    </div>
  );
}
