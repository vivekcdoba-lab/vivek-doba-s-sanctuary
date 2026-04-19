// Determines what to do immediately after a successful login,
// based on the profile flags set by the admin user-creation flow.
//
// - 'forced'  → user MUST change password (seekers with auto-generated temp pw)
// - 'prompt'  → one-time optional offer (admins/coaches on first login)
// - 'none'    → continue to the user's normal home route

export type FirstLoginAction = 'forced' | 'prompt' | 'none';

export interface FirstLoginProfile {
  role?: string | null;
  must_change_password?: boolean | null;
  password_change_prompted?: boolean | null;
}

export function checkFirstLoginAction(profile: FirstLoginProfile | null | undefined): FirstLoginAction {
  if (!profile) return 'none';
  if (profile.must_change_password === true) return 'forced';
  if ((profile.role === 'admin' || profile.role === 'coach') && profile.password_change_prompted !== true) {
    return 'prompt';
  }
  return 'none';
}
