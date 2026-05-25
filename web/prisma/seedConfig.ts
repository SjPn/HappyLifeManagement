/** Значения только из .env — никаких секретов в репозитории. */

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to web/.env (файл в .gitignore). См. .env.example.`,
    );
  }
  return value;
}

export function seedInviteCode(): string {
  return requireEnv("INVITE_CODE");
}

function normalizeSecret(raw: string): string {
  let v = raw.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v.replace(/\r/g, "");
}

export function seedPasswords() {
  return {
    admin: normalizeSecret(requireEnv("SEED_ADMIN_PASSWORD")),
    chair: normalizeSecret(requireEnv("SEED_CHAIR_PASSWORD")),
    mod: normalizeSecret(requireEnv("SEED_MOD_PASSWORD")),
    resident: normalizeSecret(requireEnv("SEED_RESIDENT_PASSWORD")),
  };
}
