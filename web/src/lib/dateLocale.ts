/** BCP 47 locale for `toLocaleString` / `toLocaleDateString` from next-intl route locale. */
export function dateLocaleForUi(locale: string): string {
  if (locale === "uk") return "uk-UA";
  if (locale === "ru") return "ru-UA";
  return "en-GB";
}
