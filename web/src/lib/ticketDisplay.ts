import type { TicketCategory } from "@/lib/enums";
import { TicketCategory as TicketCategoryEnum } from "@/lib/enums";

const ticketCategoryKeys = new Set<string>(Object.values(TicketCategoryEnum));

export function isTicketCategory(
  value: string,
): value is TicketCategory {
  return ticketCategoryKeys.has(value);
}

export function ticketCategoryLabel(
  tc: (key: TicketCategory) => string,
  category: string,
) {
  if (isTicketCategory(category)) return tc(category);
  return category;
}
