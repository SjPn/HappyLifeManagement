import { Link } from "@/i18n/navigation";

export function PageTitle({
  title,
  subtitle,
  eyebrow,
}: {
  title: React.ReactNode;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <header className="mb-7 min-w-0 max-w-full">
      {eyebrow && (
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-600/90 dark:text-emerald-400/90">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-2 min-w-0 max-w-full text-2xl font-bold leading-snug tracking-tight break-words text-slate-900 [overflow-wrap:anywhere] sm:text-3xl dark:text-white">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 max-w-full text-sm leading-relaxed break-words text-slate-600 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </header>
  );
}

/** Привітання на головній: рядок «Вітаємо,» + ім’я на окремому рядку (мобільна вёрстка). */
export function DashboardGreeting({
  hello,
  name,
}: {
  hello: string;
  name: string;
}) {
  return (
    <>
      <span className="block text-lg font-semibold text-slate-600 sm:text-xl dark:text-slate-400">
        {hello}
      </span>
      <span className="mt-0.5 block break-words font-bold text-slate-900 dark:text-white">
        {name}
      </span>
    </>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`hl-glass rounded-2xl p-4 sm:p-5 ${className}`}>
      {children}
    </div>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const base =
    variant === "primary"
      ? "inline-flex h-11 min-h-[2.75rem] items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/30 active:scale-[0.98] dark:from-emerald-500 dark:to-teal-500 dark:shadow-emerald-900/40"
      : "inline-flex h-11 min-h-[2.75rem] items-center justify-center rounded-xl border border-slate-200/90 bg-white/90 px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/80 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/30";
  const cls = className ? `${base} ${className}` : base;
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
