

## Problem

When approving an application in `ApplicationsPage.tsx`, the code only pushes the new seeker to an **in-memory mock array** (`SEEKERS.push(...)` on line 169). The `SeekersPage` reads from the **database** via `useSeekerProfiles()`. So the approved applicant never appears in the Seekers list because no database record is created.

## Plan

### 1. Update the approval logic in `ApplicationsPage.tsx`

Replace the mock `SEEKERS.push()` block (lines 130-170) with actual database inserts:

1. **Insert into `profiles` table** — Create a new profile record with `role: 'seeker'`, extracting `full_name`, `email`, `phone`, `city`, `company`, `occupation` from the submission data. Since profiles are linked to `auth.users`, we need to handle this carefully — either:
   - Create the profile directly (without an auth user) for admin-managed seekers, OR
   - Use `supabase.auth.admin` to create the user account (requires service role, so use an edge function)

   **Recommended approach**: Create a small edge function `approve-application` that:
   - Creates an auth user via `supabase.auth.admin.createUser()` with the applicant's email
   - The existing `handle_new_user` trigger will automatically create the profile
   - Then insert an enrollment record if a matching course exists

2. **Insert into `enrollments` table** — If a matching course is found, create an enrollment linking the new profile to that course.

3. **Remove the `SEEKERS` mock import** — No longer needed for the approval flow.

### 2. Create edge function `supabase/functions/approve-application/index.ts`

This function will:
- Accept `submission_id` and extract submission data
- Call `supabase.auth.admin.createUser({ email, email_confirm: true, user_metadata: { full_name, phone, role: 'seeker' } })`
- The `handle_new_user` trigger auto-creates the profile with city/company/occupation
- Optionally create an enrollment record
- Update the submission status to `approved`
- Return success with the new profile ID

### 3. Update `handle_new_user` trigger function

Add support for additional metadata fields (`city`, `company`, `occupation`) so they populate on the profile when the auth user is created. Current trigger only handles `full_name`, `role`, `phone`.

### Technical Details

- **Edge function** is needed because `auth.admin.createUser()` requires the service role key (not available client-side)
- The existing `handle_new_user` trigger fires on `auth.users` INSERT, auto-creating the profile
- Migration needed to add `city`, `company`, `occupation` columns to profiles if not present, and update the trigger function
- The `ApplicationsPage` will call the edge function instead of doing client-side mock operations
- On success, `useSeekerProfiles()` will pick up the new seeker automatically

