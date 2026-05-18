export const MIN_PASSWORD_LENGTH = 6;

export function passwordsMatch(
  password: string,
  confirm: string,
): boolean {
  return password === confirm;
}

export function isPasswordStrongEnough(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}
