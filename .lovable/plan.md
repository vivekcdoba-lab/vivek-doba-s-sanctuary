# Move the detailed LGT form into the admin panel

## Where the long form is right now

The original `/apply-lgt` form **still exists** as a route and a file (`src/pages/ApplyLGT.tsx`, ~750 lines, 18 sections covering personal, business, health, relationships, mental, spiritual, wheel-of-life, goals, commitments, payment prefs). It is just no longer surfaced on the home page — Card 3 now goes to the short `/get-started` form (`TellUsAboutYourself`).

A few SEO / login pages still link to `/apply-lgt` publicly:
- `src/pages/seo/_SeoLayout.tsx`
- `src/pages/seo/BusinessCoaching.tsx`
- `src/pages/LoginPage.tsx`

## What you're asking for

When a short intake comes in via "Tell Us About Yourself", the admin should be able to **fill in the full detailed profile from inside the admin panel** (not send the seeker back to a long public form). The admin captures the rich data during the qualification call.

## Proposed solution

### 1. New admin page: "Detailed Seeker Intake"
- **Route**: `/applications/:submissionId/detailed-intake` (admin-only, under `AdminLayout`)
- **Component**: `src/pages/admin/AdminDetailedIntake.tsx`
- Reuses the same 18-section form structure as `ApplyLGT.tsx`, but:
  - Pre-fills Full Name / Email / Mobile / City / Intent from the parent `submissions` row (the short intake).
  - No "Apply" / payment language — framed as "Seeker Intake Form (Admin Filled)".
  - Removes commitments + consent checkboxes (those will be collected from the seeker after approval, via DocuSign-style flow you already have).
  - Save button writes the detailed answers back into the same `submissions.form_data` JSON, merging with existing keys, plus sets `form_data.detailed_intake_completed_at`.
  - Allows partial save (Save Draft) and final Save (marks intake complete).

### 2. Refactor `ApplyLGT.tsx` into a reusable component
- Extract the form body from `src/pages/ApplyLGT.tsx` into `src/components/intake/DetailedIntakeForm.tsx`.
- Two thin wrappers consume it:
  - `src/pages/ApplyLGT.tsx` — public route (kept for the SEO/Login links that still point to it; submits to `submissions` as today).
  - `src/pages/admin/AdminDetailedIntake.tsx` — admin route, loads existing submission, prefills, saves back.
- Keeps a single source of truth — no copy-paste maintenance.

### 3. Hook from Applications dashboard
In `src/pages/admin/ApplicationsPage.tsx`, on every short-intake row (where `form_data.source === 'tell_us_about_yourself'`), add a button:
- **"📋 Fill Detailed Intake"** → navigates to `/applications/:id/detailed-intake`
- If the submission already has detailed data, label becomes **"✏️ Edit Detailed Intake"** with a green "Detailed info captured" badge.

The existing Approve / Reject / Request Info actions stay unchanged. Admin typically: short intake comes in → call seeker → fill detailed intake → Approve (existing `approve-application` edge function creates the auth user + profile).

### 4. Where the detailed data lives
- All answers are stored in `submissions.form_data` (JSONB) — **no schema migration needed**. The existing column already accepts arbitrary keys.
- On approve, the existing `approve-application` edge function creates the seeker profile. We extend it (small change) to copy a curated subset of `form_data` keys into the new `profiles` row: `dob`, `gender`, `marital_status`, `blood_group`, `address1`, `state`, `pincode`, `company`, `designation`, `industry`, `emergency_contact_name`, `emergency_contact_phone`, etc. — only fields that already have matching columns on `profiles`. The rest stays on the submission record for reference.

### 5. Minor cleanup
- Add a sidebar entry under Admin → "Applications" so this is discoverable (it's already there as `/applications`).
- Update the SEO/Login links from `/apply-lgt` → `/get-started` in a follow-up so the public surface is consistent. Old route stays functional during the transition.

## Files touched

| File | Change |
|---|---|
| `src/components/intake/DetailedIntakeForm.tsx` | **New** — extracted form body, accepts `initialValues`, `mode: 'public' \| 'admin'`, `onSave` callback |
| `src/pages/ApplyLGT.tsx` | Refactored to thin wrapper using `DetailedIntakeForm` |
| `src/pages/admin/AdminDetailedIntake.tsx` | **New** — loads submission, renders `DetailedIntakeForm` in admin mode, saves to `submissions.form_data` |
| `src/pages/admin/ApplicationsPage.tsx` | Add "Fill Detailed Intake" button + "Detailed info captured" badge |
| `src/App.tsx` | Add `/applications/:id/detailed-intake` route inside admin layout |
| `supabase/functions/approve-application/index.ts` | Extend to copy curated `form_data` fields onto the new profile (additive, safe) |

## What does NOT change
- No DB migration.
- `submissions` table, `approve-application` flow, short `/get-started` form, RLS — all unchanged in shape.
- Public `/apply-lgt` URL keeps working for any external links / bookmarks.

## Result
- Seekers fill a 60-second form on the home page.
- Admin opens the intake in the admin panel, calls the seeker, and fills the rich 18-section profile right there.
- On Approve, the seeker account is created with the full profile already populated — no second form for the seeker.
