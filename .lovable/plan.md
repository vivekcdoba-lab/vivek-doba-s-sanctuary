

## Goal (combined, final)
Ship the previously-approved security hardening **plus** an email-based digital signature workflow built around an **admin-managed Document Library** that coaches/admins attach to a seeker's journey and send for signing.

---

## Part A — Security hardening (unchanged from earlier approval)

1. **Role escalation lockdown** on `profiles` — harden `prevent_role_escalation()` to RAISE, add `WITH CHECK` on UPDATE policy so only admins can change `role`. Drop duplicate trigger.
2. **`submissions` INSERT** — replace `WITH CHECK (true)` with email regex + length caps + `status = 'pending'` forced.
3. **Signatures storage UPDATE/DELETE** — replace folder-name checks with row-ownership join to `session_signatures`.
4. Mark all three security findings as fixed.

---

## Part B — Document Library + Email Signature Workflow

### B1. Admin Document Library (new)
- New page `/admin/documents` — admin uploads PDFs (Coaching Agreement, NDA, Goal Commitment, custom docs). Each has: `title`, `description`, `category` (`agreement | nda | commitment | other`), `file_path` in `documents` bucket, `is_active`, `version`.
- New private storage bucket `documents` (admin write, signed-URL read for authorised users).
- Admin can replace/version a document; old versions retained for audit.
- Provision to upload **placeholder/sample PDFs now** and real PDFs later — empty library is allowed.

### B2. Send for Signature (from Seeker Journey)
- In the existing **Seeker Journey** view (admin `SeekerDetailPage` and coach `CoachSeekerDetail`), add a new tab/section **"Documents & Signatures"**.
  - Lists documents already sent + their status (Pending / Signed / Expired) with per-document download.
  - Button **"Send Document for Signature"** → modal:
    - Picker: choose document(s) from the library.
    - Optional: link to a specific session (else attach at seeker level).
    - Optional custom message for the email.
    - Send → creates one `signature_request` per selected document, emails the seeker.

### B3. Signer experience (public, token-gated)
- Email lands in seeker inbox: a warm congratulations message ("You're enrolled! Please sign the agreement to begin your transformation journey…") + `[Sign Document]` button → `/sign/<token>`.
- Public `/sign/:token` page (no login):
  - PDF preview of the document.
  - Form: **Full Name**, **Place**, **Date** (defaults to today), Consent checkbox.
  - Submit → `submit-signature` edge function:
    - Validates token (not expired, not used).
    - Captures IP + user-agent + UTC timestamp.
    - Stamps a Signature Page onto the PDF: cursive-rendered name, place, date, IP, timestamp, verification ID, "Electronically signed under IT Act 2000".
    - Compresses PDF (image downsample to 100 DPI, font subsetting, strip metadata; target <1 MB).
    - Stores signed PDF at `signatures/<seeker_id>/<request_id>-signed.pdf`.
    - Marks request `signed`.
    - Emails the **signed PDF as attachment** back to the seeker with a congratulations message, and notifies the coach + admin (in-app notification + email summary with download link).

### B4. Persistence
- Signed PDF stored in `signatures` bucket, metadata in DB.
- Compressed signed PDF kept indefinitely; original unsigned source stays in `documents` bucket.
- Per-document audit row (`document_signatures`) records: who signed, when, IP, verification ID, storage path, file size.

---

## Database changes

**New table: `documents`** (library)
- `id`, `title`, `description`, `category`, `storage_path`, `version int default 1`, `is_active boolean default true`, `uploaded_by`, `created_at`, `updated_at`.
- RLS: admins full CRUD; coaches SELECT active rows; seekers no direct access.

**New table: `signature_requests`**
- `id`, `seeker_id`, `document_id`, `session_id (nullable)`, `signer_email_encrypted`, `signer_name`, `token_hash`, `status` (`pending | signed | expired | cancelled`), `expires_at` (default `now() + 7 days`), `sent_at`, `signed_at`, `cancelled_at`, `custom_message`, `created_by`.
- Unique on `token_hash`.
- RLS: admin full; coach SELECT for own seekers; seeker no direct (uses public token endpoint).

**New table: `document_signatures`**
- `id`, `request_id → signature_requests`, `seeker_id`, `document_id`, `signed_pdf_path`, `typed_full_name`, `place`, `signature_date date`, `ip_address inet`, `user_agent text`, `verification_id text`, `file_size_bytes int`, `signed_at timestamptz default now()`.
- RLS: admin/coach SELECT; seeker SELECT own.

**New private storage bucket `documents`** with RLS:
- INSERT/UPDATE/DELETE: admins only.
- SELECT: admins, coaches, and the seeker the document was sent to (joined via `signature_requests`).

**Reuse `signatures` bucket** for the signed output, with the row-ownership policies from Part A.

---

## Edge functions (all `verify_jwt = false`, validate JWT inline)

1. **`request-document-signature`** (admin/coach)
   - Input: `{ seeker_id, document_ids: string[], session_id?, custom_message? }`
   - For each doc: insert `signature_requests`, generate raw token + hash, send email via Resend with `[Sign Document]` button.
   - Subject: `"Action required: Sign your <document title>"`.

2. **`get-signature-request`** (public)
   - Input: `{ token }` → returns request metadata + signed URL of unsigned PDF preview. Refuses if expired/signed/cancelled.

3. **`submit-signature`** (public)
   - Input: `{ token, full_name, place, signature_date, consent: true, user_agent }`
   - Validates, stamps PDF (using `pdf-lib` in Deno), compresses, uploads to `signatures/`, writes `document_signatures`, marks request `signed`.
   - Emails seeker the signed PDF as attachment with congratulations copy; emails coach + all admins a summary with download link; inserts in-app notifications.
   - Returns `{ verification_id, signed_pdf_url }`.

4. **`resend-document-signature`** (admin/coach)
   - Re-sends email; bumps `expires_at` if expired.

---

## Frontend changes

- **New page** `src/pages/admin/AdminDocuments.tsx` — library CRUD (upload, list, version, activate/deactivate, preview).
- **New section** "Documents & Signatures" tab in `SeekerDetailPage.tsx` and `CoachSeekerDetail.tsx`:
  - Status table + "Send Document for Signature" modal (multi-select from library + optional session link + custom message).
  - Resend / cancel actions per pending request.
- **New public page** `src/pages/SignDocument.tsx` (route `/sign/:token`, no auth):
  - PDF preview iframe + form (Full Name / Place / Date / consent) + success screen with verification ID and "Check your email for the signed copy."
  - Friendly error states for expired / already-signed / invalid tokens.
- **Existing** `DigitalSignature.tsx` (drawn/typed canvas) is **retained read-only** to display historical signatures on old sessions (preservation policy) — no longer offered as a new entry path.
- Add nav link in admin sidebar: "Documents".
- Notification bell surfaces "Signature received" events.

---

## Email content

- **Request email** (to seeker): warm congratulations + "You're enrolled in your transformation journey. Please sign the attached <document name> to begin your sessions." + `[Open Signing Page]` button + 7-day expiry note.
- **Completion email** (to seeker): "Thank you! Your <document title> is signed and saved. We're honored to walk this path with you." + signed PDF attached + verification ID.
- **Internal notice** (to coach + admins): "Seeker <name> signed <document title> at <IST timestamp>. Verification ID: …" + link to signed PDF.

All emails sent via existing Resend setup using `app_settings.email_from`.

---

## PDF compression strategy
- `pdf-lib` for stamping + assembly in the edge function.
- After stamping: re-encode embedded images at 100 DPI, subset fonts, strip metadata, save with `useObjectStreams: true`.
- Target: 200–800 KB; hard cap 1 MB. If source already large, prefer legibility over size.

---

## Provision for "PDFs to be shared later"
- The library starts empty. Admin can use `/admin/documents` to upload real PDFs whenever ready — no code change needed.
- We seed two placeholder rows ("Coaching Agreement — placeholder", "Goal Commitment — placeholder") pointing to a tiny sample PDF generated server-side, so the UI is testable end-to-end before real docs arrive. Admin can replace files in place via the upload UI.

---

## Out of scope
- No Aadhaar eSign / DSC / certified-CA signatures.
- No inline per-page initials placement.
- No bulk-send across multiple seekers in one click.

## Verification
1. Admin uploads a PDF in `/admin/documents` → appears in library.
2. From a seeker's journey, admin selects that document → "Send for Signature" → seeker receives congratulations email with signing link.
3. Open `/sign/<token>` incognito → PDF preview + form. Submit name/place/date → success page; seeker inbox receives signed PDF (<1 MB) attached; coach + admins receive notification email + in-app alert.
4. Re-opening the same token shows "already signed".
5. `signatures` bucket contains the compressed signed PDF; `document_signatures` row holds verification ID + IP + size.
6. Security findings: seeker/coach role-edit blocked; anonymous submission with bad email/`status='approved'` rejected; user A cannot UPDATE/DELETE user B's signature object. All three findings closed.

## Files affected (high-level)
- DB: 4 migrations (Part A policies + triggers; `documents`, `signature_requests`, `document_signatures` tables + bucket + RLS).
- Edge: `request-document-signature`, `get-signature-request`, `submit-signature`, `resend-document-signature` (all new).
- Frontend: `src/pages/admin/AdminDocuments.tsx` (new), `src/pages/SignDocument.tsx` (new + public route in `App.tsx`), updates to `SeekerDetailPage.tsx`, `CoachSeekerDetail.tsx`, `AdminLayout` sidebar.
- Email: 3 templates via existing Resend.

