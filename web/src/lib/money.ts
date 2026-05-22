/** Оформлення суми в гривнях (цілі гривні, без копійок). */
export function formatUah(amount: number, locale: string) {
  const map: Record<string, string> = {
    uk: "uk-UA",
    ru: "ru-UA",
    en: "en-GB",
  };
  const tag = map[locale] ?? "uk-UA";
  const n = Math.round(amount);
  const num = new Intl.NumberFormat(tag, { maximumFractionDigits: 0 }).format(
    n,
  );
  return `${num} ₴`;
}
