# Replace `/apply-lgt` with simplified intake flow

## Goal
Swap the long LGT application form on the homepage for a short, frictionless intake form. Submissions still flow into the existing admin **Incoming Applications** dashboard, where the admin manually qualifies, finalizes pricing offline, and approves to auto-create the seeker account (existing pipeline — no changes needed).

## What stays the same (already built — reuse)
- `submissions` table — already stores intake records with `form_type`, `status='pending'`, `form_data`.
- Admin page `/applications` (`ApplicationsPage.tsx`) — already lists, filters, approves, rejects, requests info.
- Edge function `approve-application` — on approve, creates auth user + seeker profile + sends credentials.
- `send-notification` edge function — already emails admin on new submission and emails applicant on status change.

## What changes

### 1. New page: `src/pages/TellUsAboutYourself.tsx` (route `/get-started`)
A single-screen form with these fields only:
- **Full Name** (required)
- **Email** (required, validated)
- **Phone** with country code (required, uses existing `PhoneInput` + `validatePhone`/`toE164`)
- **City / Location** (optional)
- **Short intent** — textarea, "What brings you here?" (1–2 lines, max 500 chars, required)
- **Consent** checkbox — "I agree to be contacted by the VDTS team"

On submit:
- Duplicate check via existing `check_profile_duplicate` RPC (prevents resubmission with an existing seeker email/phone).
- Insert into `submissions` with:
  - `form_type: 'lgt_application'` (so it appears under the existing "👑 LGT Applications" filter — no admin UI changes needed)
  - `status: 'pending'`
  - `full_name`, `email`, `mobile`, `country_code`
  - `form_data: { city, intent, source: 'tell_us_about_yourself' }`
- Invoke `send-notification` with `type: 'new_submission'` so admin gets email alert.
- Show success screen: "Thank you — Vivek Sir's team will reach out within 48 hours."

### 2. Home page (`src/pages/Index.tsx`)
- Update Card 3 ("Apply for Life's Golden Triangle"):
  - Title → **"Tell Us About Yourself"**
  - Description → short, low-friction copy ("Share a few details. We'll personally reach out to design the right path for you. Takes under a minute.")
  - CTA button → **"Get Started"** linking to `/get-started`
- Keep the gold→purple gradient and 👑 emoji as-is.

### 3. Routing (`src/App.tsx`)
- Add `<Route path="/get-started" element={<TellUsAboutYourself />} />`.
- **Keep** `/apply-lgt` route intact for now (other pages — `LoginPage`, `BusinessCoaching`, `_SeoLayout` — still link to it). Old long form remains accessible at the URL but is no longer surfaced on the homepage. We can deprecate those secondary links in a follow-up.

### 4. Admin clarity (small enhancement, optional)
In `ApplicationsPage.tsx`, when a submission has `form_data.source === 'tell_us_about_yourself'`, show a small badge **"New Seeker — Pending Review"** next to the existing status pill so the admin can quickly tell short-form intakes apart from full LGT applications. No filter changes.

## Approval flow (unchanged, confirms requirements)
1. Admin sees new entry under `/applications` with status **⏳ Pending Review**.
2. Admin contacts seeker (live/async), discusses Individual vs Couple, payment offline.
3. Admin can fill in additional profile data later via the existing seeker detail page (after approval).
4. Admin clicks **Approve** → `approve-application` edge function:
   - Creates Supabase auth user with a generated temp password.
   - Creates `profiles` row with `role='seeker'`, `must_change_password=true`.
   - `send-notification` emails the seeker with login credentials and onboarding instructions.

## Files touched
- `src/pages/TellUsAboutYourself.tsx` (new)
- `src/pages/Index.tsx` (Card 3 copy + link)
- `src/App.tsx` (add route)
- `src/pages/admin/ApplicationsPage.tsx` (small badge for `source === 'tell_us_about_yourself'`)

No DB migration, no edge function changes, no payment integration.
