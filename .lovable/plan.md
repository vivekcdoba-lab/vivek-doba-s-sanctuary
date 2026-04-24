

## Goal
Three additions:
1. **Digital Signature flow** — add a "Sign Here" inline option alongside existing "Send Email for Signature", with custom email subject/body templates per spec.
2. **Country LOV on user/lead/seeker creation** — add Country selector defaulting to India (IN); when not India, lock State to "Default".
3. **Resolve `getClaims` runtime error** — already fixed in code (both edge functions use `getUser()`). Confirm via re-deploy + clear stale state.

---

## Part 1 — Digital Signature: "Sign Here" + "Send Email"

**File**: `src/components/SeekerSignaturesTab.tsx`
- Replace the single "Send Document for Signature" button with **two side-by-side buttons**:
  - **"✍️ Sign Here"** → opens new `SignHereDialog` (admin signs in person on behalf of/with the seeker).
  - **"📧 Send Email for Signature"** → existing `SendForSignatureDialog` (unchanged behaviour).

**New file**: `src/components/SignHereDialog.tsx`
- Multi-doc selector (re-uses the existing `documents` query pattern).
- Inline form: **Name** (default = seeker.full_name), **Place** (required), **Date** (default = today, editable), required consent checkbox.
- On submit → calls a new edge function `sign-document-inline` with `{ seeker_id, document_ids[], full_name, place, signature_date }`. The function:
  1. Creates a `signature_requests` row with status `signed` (no token email step).
  2. Generates the signed PDF using the same pdf-lib pipeline as `submit-signature`, but additionally renders **Coach signature on bottom-LEFT corner of last page** and **Seeker/Signer details on bottom-RIGHT corner of last page** (per spec).
  3. Stores PDF in `signatures` bucket; inserts `document_signatures` row with `verification_id`.
  4. Emails the seeker the signed copy using the **"Thank You for Signing the Agreement"** template provided.
- Closes dialog and refreshes the list on success.

**File**: `supabase/functions/submit-signature/index.ts` (existing email-link flow)
- Update PDF rendering on the appended signature page so:
  - **Bottom-LEFT corner**: "Coach Signature" label + "Vivek Doba" in script font + date.
  - **Bottom-RIGHT corner**: signer name + place + date + verification ID.
- Update the seeker email body to use the **"Thank You for Signing the Agreement"** template (subject + HTML body per spec).

**File**: `supabase/functions/request-document-signature/index.ts`
- Update outgoing email subject to **"Request to Sign Agreement Document"** and body to the spec template (preserve existing signing link/CTA inside the styled body).

**New file**: `supabase/functions/sign-document-inline/index.ts`
- Auth via `supabase.auth.getUser()` (admin/coach guard).
- Service-role client for inserts and storage upload.
- Same PDF generation logic as `submit-signature` (extracted as inline helper since edge functions can't share folders).
- Returns `{ verification_id, signed_path }`.

**Common rules enforced** (both flows):
- Coach signature → bottom-LEFT of last page.
- Seeker/signer block → bottom-RIGHT of last page.
- Signed PDF saved to `signatures/<seeker_id>/<request_id>-signed.pdf`.
- Seeker emailed a copy with the spec "Thank You" template.

---

## Part 2 — Country LOV on creation forms

**DB migration**: add `country` column to `profiles` (text, default `'IN'`). No data migration needed — existing rows default to India.

**New file**: `src/components/inputs/CountryStateInput.tsx`
- Wraps existing `StatePincodeInput`.
- Country `<Select>` with ~30 common countries (IN default, plus US, GB, AE, CA, AU, SG, NZ, MY, etc., and "Other").
- Behaviour:
  - Country = **IN** → renders existing State dropdown + 6-digit pincode (current behaviour).
  - Country = anything else → State auto-set to `"Default"` and rendered as **read-only** input; Pincode becomes free-text "Postal/ZIP".

**Files updated to use new component**:
- `src/pages/admin/AdminAddUser.tsx` — add Country to form state (default `IN`); replace `<StatePincodeInput>` with `<CountryStateInput>`; include `country` in the insert payload to `profiles`.
- `src/pages/admin/AdminAddLead.tsx` — add Country field to lead form (lead form already has phone country code; add the address country similarly). Save into `leads.country` if column exists; otherwise into `form_data.country` JSON. (Will check at implementation; if `leads.country` missing, add it in same migration.)
- `src/pages/RegisterPage.tsx` — add Country to the registration form; include in `application.form_data.country`.

**Migration also adds**: `country text default 'IN'` to `leads` if not already present, so admin lead form can persist it cleanly.

---

## Part 3 — Runtime error `supabase.auth.getClaims is not a function`

**Status**: Already fixed in code. Both `request-document-signature/index.ts` and `resend-document-signature/index.ts` now use `supabase.auth.getUser()`. The error reported (timestamp 1776868552856) is from before the fix was deployed.

**Verification**:
- `grep getClaims supabase/functions/` returns 0 matches.
- Edge functions auto-redeploy on save; confirm by tailing `request-document-signature` logs after a fresh test send (no `TypeError` should appear).
- No further code change needed for Part 3 — listed only to acknowledge the report.

---

## Verification (no records created)
1. `tsc --noEmit` and `vite build` after edits.
2. Static review of new edge function `sign-document-inline` against `submit-signature` to confirm RLS-safe service-role usage.
3. Confirm `getClaims` is gone from all edge function files (already verified).
4. Inspect Resend gateway call shape against the working `submit-signature` template.

## Files affected
- New migration: `profiles.country text default 'IN'`, `leads.country text default 'IN'`.
- Edited: `src/components/SeekerSignaturesTab.tsx` (two buttons).
- New: `src/components/SignHereDialog.tsx`.
- New: `src/components/inputs/CountryStateInput.tsx`.
- Edited: `src/pages/admin/AdminAddUser.tsx`, `src/pages/admin/AdminAddLead.tsx`, `src/pages/RegisterPage.tsx` (Country field + payload).
- Edited: `supabase/functions/submit-signature/index.ts` (left/right corner layout, new "Thank You" email).
- Edited: `supabase/functions/request-document-signature/index.ts` (new "Request to Sign" email template).
- New: `supabase/functions/sign-document-inline/index.ts` (in-person signing).

## Out of scope
- No deletion of existing `DigitalSignature.tsx` (used for session certification — separate canvas signature flow, preservation policy).
- No changes to `signatures` bucket RLS — current admin/seeker policies already cover the new flow.
- No change to coach visibility on signature_requests (admin-only restriction stays per prior security hardening).

