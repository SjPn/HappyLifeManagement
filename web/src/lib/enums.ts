/** Строковые коды, совпадающие с БД (Postgres хранит как строки, без enum-типов) */

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
