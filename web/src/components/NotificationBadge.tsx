export function NotificationBadge({
  count,
  inline = false,
}: {
  count: number;
  inline?: boolean;
}) {
  if (count <= 0) return null;
  const label = count > 99 ? "99+" : String(count);
  const base =
    "flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-red-600 px-1 text-[0.625rem] font-bold leading-none text-white shadow-sm";
  const className = inline
    ? `${base} inline-flex`
    : `${base} absolute -right-1 -top-1 ring-2 ring-white dark:ring-zinc-900`;

  return (
    <span className={className} aria-label={label}>
      {label}
    </span>
  );
}
