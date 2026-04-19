// Shared password validation rules used by RegisterPage and admin user creation.
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%&*!?_\-+=]).{12,}$/;
export const PASSWORD_HELP =
  'Min 12 chars, 1 uppercase, 1 number, 1 special character (@#$%&*!?_-+=)';

export function validatePassword(pwd: string): string | null {
  if (!pwd) return 'Password is required';
  if (pwd.length < 12) return 'Password must be at least 12 characters';
  if (!PASSWORD_REGEX.test(pwd)) return PASSWORD_HELP;
  return null;
}
