# Test the new intake flow end-to-end

Goal: verify the full path we shipped today works — from a public seeker filling the short form on the home page, all the way to an admin filling the detailed intake and approving the seeker.

## What we're testing

```text
Home (/) → "Tell Us About Yourself" (/get-started)
     → submissions row created (form_type=lgt_application, source=tell_us_about_yourself)
     → Admin Applications page shows row with 🌱 New Seeker badge
     → Admin clicks "📋 Fill Detailed Intake"
     → /applications/:id/detailed-intake (long 18-section form, prefilled)
     → Save merges into submissions.form_data, sets detailed_intake_completed_at
     → Row now shows ✓ "Detailed info captured" + "Edit Detailed Intake"
     → Admin Approves → approve-application creates auth user + profile
     → Seeker can log in
```

## Test cases

### 1. Public short intake (`/get-started`)
- Open home, click the "Get Started" / "Tell Us About Yourself" CTA card → lands on `/get-started`.
- Submit valid data → success screen ("Thank you, {firstName}!").
- Verify row in `submissions` (DB read): `form_type=lgt_application`, `status=pending`, `form_data.source='tell_us_about_yourself'`, `form_data.intent` populated.
- Best-effort `send-notification` invocation does not block submit on failure.
- Validation: empty name / bad email / bad phone / empty intent / missing consent each block submit with toast.
- Duplicate guard: submit with an email already in `profiles` → toast "account already exists, please log in".
- Same with an existing phone.

### 2. Admin Applications dashboard (`/applications`)
- Login as admin, open Applications.
- New short-intake row appears with the 🌱 "New Seeker — Pending Review" badge.
- "📋 Fill Detailed Intake" button visible on that row.
- Approve / Reject / Request Info buttons still work as before (regression).

### 3. Admin Detailed Intake (`/applications/:id/detailed-intake`)
- Click "Fill Detailed Intake" → long form opens, scrolled to top.
- Header shows admin-mode framing; payment/consent section hidden.
- Pre-filled fields: Full Name, Email, Phone (split into code + number), City — pulled from the short submission.
- All 18 sections expand/collapse correctly; sliders, multi-selects, and char counters work.
- Sticky "💾 Save Detailed Intake" bar visible on scroll.
- Save with partial data → success toast, redirect back to `/applications`.
- DB check: `submissions.form_data` now contains the merged detailed keys + original `source` + `intent` + `detailed_intake_completed_at` ISO timestamp; `full_name` updated if changed.

### 4. Re-edit flow
- Re-open the same row → button now reads "✏️ Edit Detailed Intake" with green "✓ Detailed info captured" badge.
- Form re-opens fully prefilled with the merged data (not just the short-intake fields).
- Edit one field, Save → DB shows updated value; `source` still preserved; `detailed_intake_completed_at` refreshed.

### 5. Approval → seeker creation
- From Applications, click Approve on the now-detailed row.
- `approve-application` edge function runs → new auth user + `profiles` row exist.
- Verify a curated subset of detailed fields landed on `profiles` (dob, gender, city, state, pincode, company, designation, industry, etc.) — only those with matching profile columns.
- Status becomes `approved`. Seeker receives credentials email (best-effort).
- Try logging in with the new credentials → routed to seeker dashboard, must-change-password gate fires.

### 6. Public `/apply-lgt` (regression)
- The public long form still works for old links (SEO pages, Login page).
- Submitting it creates a `submissions` row (no `tell_us_about_yourself` source) and admin sees it without the "New Seeker" badge.
- No payment/admin save bar shown — original public flow unchanged.

### 7. Edge / negative
- Open `/applications/<bad-uuid>/detailed-intake` → toast "Submission not found", redirect to `/applications`.
- Non-admin user hitting `/applications/:id/detailed-intake` → blocked by `AuthGuard`, redirected per role.
- Admin save while offline / RLS error → error toast, no partial DB write.

## How I'll execute the test

1. Read live state via `supabase--read_query` against `submissions` to baseline.
2. Use the browser tool to drive the flow on the preview URL:
   - Submit `/get-started` as a fresh test seeker.
   - Log in as admin (`vivek@gmail.com` test account from memory).
   - Walk through Applications → Fill Detailed Intake → Save.
   - Re-open, edit, save again.
   - Approve and confirm `profiles` row.
3. After each write, query `submissions` / `profiles` to confirm shape.
4. Tail `approve-application` and `send-notification` edge function logs for the run.
5. Capture a short pass/fail checklist + any defects (screenshots for UI bugs).

## Deliverable

A single QA report covering all 7 test cases with: pass/fail, exact DB row shape after key steps, any bugs found, and recommended fixes (no code changes made unless you approve a follow-up).

## Notes / constraints

- I'll create a brand-new test email/phone for the seeker so it doesn't collide with existing profiles.
- I'll clean up (delete the test submission + auth user) at the end if you want — let me know.
- Approve the plan and I'll run the full test pass and report back.
