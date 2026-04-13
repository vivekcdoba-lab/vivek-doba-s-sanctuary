

# Plan: Route Registration Through Admin Approval

## Summary
Change the `/register` page so that instead of immediately creating an auth user, it inserts a submission into the `submissions` table (like the other forms). The admin reviews it in "Applications Review", and upon approval the existing `approve-application` edge function creates the user account. Email and WhatsApp notifications are sent on status changes.

## What Changes

### 1. Update RegisterPage.tsx — Submit to `submissions` table instead of `supabase.auth.signUp`
- Remove the `supabase.auth.signUp` call and the duplicate-check RPC
- Instead, insert into `submissions` with `form_type: 'registration'`
- Store password securely in `form_data` (it will be used by the edge function during approval to create the auth user with the user's chosen password)
- Show success message: "Your application has been submitted for review. You will receive an email and WhatsApp message once approved."
- Navigate to `/login` after submission

### 2. Update `approve-application` edge function — Handle `registration` form_type
- When the submission's `form_type` is `'registration'`, use the password from `form_data` instead of generating a random one
- The rest of the flow (create auth user, create profile, enrollment) already works

### 3. Update ApplicationsPage.tsx — Show registration submissions
- Add `'registration'` to the type badge map so it displays as "📝 Registration"
- Add it to the filter buttons with a pending count

### 4. Update `send-notification` edge function — Send WhatsApp on status update
- After sending the email, also invoke the existing `send-whatsapp` edge function to notify the applicant via WhatsApp about their approval/rejection status

### 5. Add `registration` to submissions RLS (if needed)
- The existing `submissions` table already allows anonymous inserts (used by BookAppointment, etc.) — verify this works for registration too; if not, add an anon insert policy

## Files Modified
1. `src/pages/RegisterPage.tsx` — Replace signUp with submissions insert
2. `supabase/functions/approve-application/index.ts` — Handle registration form_type with user's chosen password
3. `src/pages/admin/ApplicationsPage.tsx` — Add registration type badge and filter
4. `supabase/functions/send-notification/index.ts` — Add WhatsApp notification on status update

## What Does NOT Change
- No database schema changes (submissions table already exists)
- No deletion of existing pages, logic, or features
- All other registration forms (BookAppointment, Workshop, LGT) remain unchanged
- Login page remains unchanged

## Technical Note
The user's chosen password is stored temporarily in the `form_data` JSON field of the submission. Upon approval, the edge function uses it to create the auth account. This avoids generating random passwords and gives the user their expected credentials from day one.

