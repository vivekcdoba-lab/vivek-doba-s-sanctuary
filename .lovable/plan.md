## Problem

The admin chooser at `/admin/apply-lgt` shows seekers like Aashlesha, Ajit, Smita, Snehal as "Not started" even though they already submitted the LGT form months ago via the old public `/apply-lgt` page.

**Root cause:** Those legacy submissions live in the `submissions` table (`form_type = 'lgt_application'`) and were never linked to a `seeker_id`. The new chooser only queries the `lgt_applications` table, so it has no idea those seekers already filled the form.

Verified in DB:
- `aashleshaent@gmail.com`, `ajit.gadewar@rediffmail.com`, `smitabhopale@gmail.com`, `snehalsawant@ss-greentech.com` all have `submissions.form_type = 'lgt_application'` rows matching their profile email.
- `crwanare@gmail.com` (Chandrakant) genuinely has no LGT submission yet — correctly shown.
- All 4 already have profiles (matched by email).

## Fix (two parts)

### 1. Backfill — link existing legacy submissions to seeker profiles

One-time data migration: for every `submissions` row where `form_type = 'lgt_application'` AND email matches a `profiles.role = 'seeker'` row AND no `lgt_applications` row exists yet for that seeker → insert a `lgt_applications` row with:
- `seeker_id` = matched profile id
- `status` = `'submitted'`
- `form_data` = the original `submissions.form_data`
- `filled_by_role` = `'seeker'` (legacy public submission)
- `submitted_at` = `submissions.created_at`

Email match is case-insensitive. If a seeker has multiple legacy submissions, keep the most recent one. Result: the 4 known seekers + any other historical matches get marked as "Submitted" and disappear from the default chooser view (and appear when "Show seekers who already submitted" is checked).

### 2. Forward-proof — also detect legacy email matches at query time

In `AdminApplyLgt.tsx`, after loading profiles + `lgt_applications`, also load all `submissions` where `form_type = 'lgt_application'`. Build an email→submission map. For each seeker without an `lgt_applications` row but with a matching legacy submission, treat them as "Submitted (legacy)" in the UI:
- Status badge: green "Submitted (legacy)" with the original submission date.
- Hidden by default; visible under "Show seekers who already submitted".
- "View / Edit" opens the form pre-filled from the legacy `form_data`, and on save creates a fresh `lgt_applications` row (so future loads use the structured table).

This protects against any legacy rows the backfill might miss (e.g. email casing differences or future cleanup).

## Files

**Migration (new)** — backfill `lgt_applications` from `submissions` where `form_type = 'lgt_application'`.

**Modified**
- `src/pages/admin/AdminApplyLgt.tsx` — load legacy submissions, merge into status calculation, show "Submitted (legacy)" badge, prefill form from legacy `form_data` on view/edit.

No schema changes. No edge function changes. The 5 seekers you listed will behave correctly: Chandrakant stays in the "Not started" list, the other 4 move into "Show seekers who already submitted".
