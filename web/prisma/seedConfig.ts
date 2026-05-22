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

export function seedPasswords() {
  return {
    admin: requireEnv("SEED_ADMIN_PASSWORD"),
    chair: requireEnv("SEED_CHAIR_PASSWORD"),
    mod: requireEnv("SEED_MOD_PASSWORD"),
    resident: requireEnv("SEED_RESIDENT_PASSWORD"),
  };
}
