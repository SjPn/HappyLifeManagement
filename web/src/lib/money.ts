/** Оформлення суми в гривнях (Україна) */
export function formatUah(amount: number, locale: string) {
  const map: Record<string, string> = {
    uk: "uk-UA",
    ru: "ru-UA",
    en: "en-UA",
  };
  const tag = map[locale] ?? "uk-UA";
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency: "UAH",
  }).format(amount);
}
