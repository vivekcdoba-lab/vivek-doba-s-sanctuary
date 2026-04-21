// Shared password validation rules used by RegisterPage and admin user creation.
// Server-side: HIBP (Have I Been Pwned) check is enforced via Supabase Auth's
// `password_hibp_enabled` setting, which rejects any password that has appeared
// in known breaches. The list below is a fast, client-side pre-check for the
// most common weak passwords so users get instant feedback before the network
// round-trip.

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%&*!?_\-+=]).{12,}$/;
export const PASSWORD_HELP =
  'Min 12 chars, 1 uppercase, 1 number, 1 special character (@#$%&*!?_-+=)';

// Top common-password fragments — reject if password (lowercased) equals any
// of these or starts with one of these followed by simple suffixes.
const COMMON_BASES = [
  'password', 'passw0rd', 'qwerty', 'qwertyuiop', '123456', '12345678', '123456789',
  '1234567890', 'admin', 'administrator', 'welcome', 'letmein', 'monkey', 'dragon',
  'sunshine', 'princess', 'iloveyou', 'football', 'baseball', 'master', 'superman',
  'batman', 'trustno1', 'login', 'starwars', 'whatever', 'shadow', 'michael',
  'jennifer', 'jordan', 'harley', 'ranger', 'hunter', 'buster', 'thomas',
  'tigger', 'robert', 'soccer', 'killer', 'george', 'asshole', 'andrew',
  'charlie', 'andrea', 'matrix', 'cheese', 'bailey', 'silver', 'orange',
  'merlin', 'phoenix', 'mickey', 'chelsea', 'biteme', 'qazwsx', 'mustang',
  'access', 'yankees', 'dallas', 'austin', 'thunder', 'taylor', 'matthew',
  'mother', 'fucker', 'banana', 'lakers', 'pepper', 'panties', 'asdfgh',
  'samsung', 'india123', 'iloveindia', 'krishna', 'shivashiva', 'omnamah',
  'vivekdoba', 'lovable', 'lovable123', 'changeme', 'temp1234', 'newuser',
  'guest123', 'demo1234', 'test1234', 'pass1234', 'welcome123', 'welcome1',
];

// Recommended max age (days) before a password-rotation reminder is shown.
export const PASSWORD_AGE_REMINDER_DAYS = 90;

export function isCommonPassword(pwd: string): boolean {
  const lower = pwd.toLowerCase();
  if (COMMON_BASES.includes(lower)) return true;
  // Reject "<base><digits>" or "<base>!" / "<base>@" / "<base>#" patterns
  for (const base of COMMON_BASES) {
    if (lower.startsWith(base) && lower.length - base.length <= 4) {
      const suffix = lower.slice(base.length);
      if (/^[\d!@#$_-]*$/.test(suffix)) return true;
    }
  }
  return false;
}

export function validatePassword(pwd: string): string | null {
  if (!pwd) return 'Password is required';
  if (pwd.length < 12) return 'Password must be at least 12 characters';
  if (!PASSWORD_REGEX.test(pwd)) return PASSWORD_HELP;
  if (isCommonPassword(pwd)) {
    return 'This password is too common or easily guessed. Please choose a more unique password.';
  }
  return null;
}

/** Days since the password was last changed, or null if unknown. */
export function passwordAgeDays(passwordChangedAt: string | null | undefined): number | null {
  if (!passwordChangedAt) return null;
  const ms = Date.now() - new Date(passwordChangedAt).getTime();
  if (Number.isNaN(ms)) return null;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function shouldRemindPasswordRotation(passwordChangedAt: string | null | undefined): boolean {
  const age = passwordAgeDays(passwordChangedAt);
  return age !== null && age >= PASSWORD_AGE_REMINDER_DAYS;
}
