import type { Prisma } from "@prisma/client";

/** Хто може бачити / брати участь у голосуванні чи темі форуму */
export const AudienceScope = {
  ALL: "ALL",
  OWNERS_ONLY: "OWNERS_ONLY",
  TENANTS_ONLY: "TENANTS_ONLY",
} as const;
export type AudienceScope =
  (typeof AudienceScope)[keyof typeof AudienceScope];

export function parseAudienceScope(raw: string): AudienceScope {
  const v = raw.trim();
  if (
    v === AudienceScope.OWNERS_ONLY ||
    v === AudienceScope.TENANTS_ONLY ||
    v === AudienceScope.ALL
  ) {
    return v;
  }
  return AudienceScope.ALL;
}

/** Резидент: власник або орендар */
export const TenancyType = {
  OWNER: "OWNER",
  TENANT: "TENANT",
} as const;
export type TenancyType = (typeof TenancyType)[keyof typeof TenancyType];

export function isStaffRole(role: string): boolean {
  return role === "CHAIR" || role === "MODERATOR";
}

/** Чи резидент (або персонал) потрапляє під обмеження аудиторії */
export function userMatchesAudience(
  role: string,
  tenancyType: string | null | undefined,
  audience: string,
): boolean {
  if (isStaffRole(role)) return true;
  const t = tenancyType ?? TenancyType.OWNER;
  if (audience === AudienceScope.ALL) return true;
  if (audience === AudienceScope.OWNERS_ONLY) return t === TenancyType.OWNER;
  if (audience === AudienceScope.TENANTS_ONLY) return t === TenancyType.TENANT;
  return true;
}

/** Фільтр Prisma для списків голосів за видимістю */
export function voteAudienceWhere(sessionUser: {
  role: string;
  tenancyType?: string | null;
}): Prisma.VoteWhereInput {
  if (isStaffRole(sessionUser.role)) return {};
  const t = sessionUser.tenancyType ?? TenancyType.OWNER;
  const or: Prisma.VoteWhereInput[] = [{ audience: AudienceScope.ALL }];
  if (t === TenancyType.OWNER) {
    or.push({ audience: AudienceScope.OWNERS_ONLY });
  }
  if (t === TenancyType.TENANT) {
    or.push({ audience: AudienceScope.TENANTS_ONLY });
  }
  return { OR: or };
}

/** Фільтр Prisma для списку тем форуму */
export function forumTopicAudienceWhere(sessionUser: {
  role: string;
  tenancyType?: string | null;
}): Prisma.ForumTopicWhereInput {
  if (isStaffRole(sessionUser.role)) return {};
  const t = sessionUser.tenancyType ?? TenancyType.OWNER;
  const or: Prisma.ForumTopicWhereInput[] = [{ audience: AudienceScope.ALL }];
  if (t === TenancyType.OWNER) {
    or.push({ audience: AudienceScope.OWNERS_ONLY });
  }
  if (t === TenancyType.TENANT) {
    or.push({ audience: AudienceScope.TENANTS_ONLY });
  }
  return { OR: or };
}
