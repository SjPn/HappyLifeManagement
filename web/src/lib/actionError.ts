/** Перевод кода ошибки server action (namespace `errors`). */
export function translateActionError(
  te: (key: string) => string,
  code: string | undefined,
): string {
  if (!code) return te("generic");
  const t = te as ((key: string) => string) & {
    has?: (key: string) => boolean;
  };
  if (typeof t.has === "function" && t.has(code)) {
    return te(code);
  }
  return te("generic");
}
