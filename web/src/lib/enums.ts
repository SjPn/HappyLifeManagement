/** Строковые коды, совпадающие с БД (SQLite без enum) */

export const Role = {
  RESIDENT: "RESIDENT",
  MODERATOR: "MODERATOR",
  CHAIR: "CHAIR",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const UserStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const TicketCategory = {
  ROADS: "ROADS",
  LIGHTING: "LIGHTING",
  SECURITY: "SECURITY",
  WATER: "WATER",
  TRASH: "TRASH",
  OTHER: "OTHER",
} as const;
export type TicketCategory =
  (typeof TicketCategory)[keyof typeof TicketCategory];

export const TicketStatus = {
  NEW: "NEW",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
} as const;

export const VoteType = {
  YES_NO: "YES_NO",
  SINGLE_CHOICE: "SINGLE_CHOICE",
} as const;

export const BoardCategory = {
  SELL_GIVE: "SELL_GIVE",
  SERVICES: "SERVICES",
  RECOMMENDATIONS: "RECOMMENDATIONS",
  LOST_FOUND: "LOST_FOUND",
} as const;
export type BoardCategory =
  (typeof BoardCategory)[keyof typeof BoardCategory];

export const ReportKind = {
  COMPLAINT: "COMPLAINT",
  SUGGESTION: "SUGGESTION",
  VIOLATION: "VIOLATION",
  IDEA: "IDEA",
} as const;
export type ReportKind = (typeof ReportKind)[keyof typeof ReportKind];

export const ReportStatus = {
  NEW: "NEW",
  REVIEWING: "REVIEWING",
  CLOSED: "CLOSED",
} as const;

export const ticketCategoryLabel: Record<string, string> = {
  ROADS: "Дороги",
  LIGHTING: "Освещение",
  SECURITY: "Охрана",
  WATER: "Вода",
  TRASH: "Мусор",
  OTHER: "Другое",
};

export const ticketStatusLabel: Record<string, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  RESOLVED: "Решено",
};

export const boardCategoryLabel: Record<string, string> = {
  SELL_GIVE: "Продам / отдам",
  SERVICES: "Услуги",
  RECOMMENDATIONS: "Рекомендации",
  LOST_FOUND: "Потеряно / найдено",
};

export const reportKindLabel: Record<string, string> = {
  COMPLAINT: "Жалоба",
  SUGGESTION: "Предложение",
  VIOLATION: "Нарушение",
  IDEA: "Идея",
};

export const reportStatusLabel: Record<string, string> = {
  NEW: "Новое",
  REVIEWING: "На рассмотрении",
  CLOSED: "Закрыто",
};

export const roleLabel: Record<string, string> = {
  RESIDENT: "Житель",
  MODERATOR: "Модератор",
  CHAIR: "Председатель",
};
