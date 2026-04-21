

## Goal
Extend the previously-approved field-level encryption plan to also cover **password-related fields** and **all personal/identity details** beyond just email + phone.

## Clarification on "password"
Passwords are **never** encrypted with reversible AES — they must be **one-way hashed**. Supabase Auth already stores passwords as bcrypt hashes in `auth.users.encrypted_password` (managed by Supabase, not accessible to us). We will **not** touch that. What we WILL do:
- Enforce **HIBP leaked-password check** on signup/change (currently off).
- Add **password rotation reminder** (90-day recommendation banner — not forced) for admins/coaches.
- Encrypt any **password-adjacent secrets** we store ourselves (OTP codes in flight, password-reset tokens) using AES-256-GCM with short TTL.

## Expanded encryption scope

Adding to the previously-approved table list:

| Table | Additional encrypted columns | Searchable hash |
|---|---|---|
| `profiles` | `dob_enc`, `gender_enc`, `pincode_enc`, `whatsapp_enc`, `hometown_enc`, `linkedin_url_enc`, `blood_group_enc`, `address_enc`, `emergency_contact_enc`, `marriage_anniversary_enc`, `pan_enc`, `aadhaar_enc` (if/when added) | `whatsapp_hash`, `pan_hash`, `aadhaar_hash` |
| `clients` (intake) | `personal_history_enc`, `medical_history_enc`, `family_details_enc`, `relationship_status_enc`, `children_details_enc`, `parents_details_enc` | — |
| `business_profiles` | `gst_number_enc`, `pan_enc`, `bank_account_enc`, `ifsc_enc`, `revenue_enc` | `gst_hash`, `pan_hash` |
| `payments` (already in plan) | + `payer_pan_enc`, `payer_gst_enc`, `bank_ref_enc` | — |
| `otp_codes` (in-flight) | `code_enc` (AES, 10-min TTL) | — |
| `password_reset_tokens` | `token_hash` (SHA-256 only — never decryptable) | `token_hash` |
| `messages` (already in plan) | unchanged | — |
| `accounting_records`, `cashflow_records` (already in plan) | unchanged | — |

**Plaintext kept (intentionally)**:
- `profiles.email`, `profiles.phone`, `profiles.full_name` — required by Supabase Auth + RLS joins. Each gets a `*_hash` for duplicate checks; full encryption deferred to a Phase-6 Auth-migration project.
- Display-only first names on leaderboard (already privacy-trimmed).

## Password-handling additions

1. **HIBP check** — enable `password_hibp_enabled: true` on signup + password change.
2. **Password strength** — `src/lib/passwordValidation.ts` already enforces 12 chars + complexity; extend to reject top-1000 common passwords client-side as a fast pre-check.
3. **Password rotation reminder** — non-blocking banner for admins/coaches after 90 days since last change (tracked via new `profiles.password_changed_at` timestamp, set by an `auth.users` webhook). Seekers exempt.
4. **OTP codes** — encrypt at rest, auto-delete after 10 min via existing cron.
5. **Reset tokens** — store SHA-256 hash only (one-way), 30-min TTL.

## Architecture (unchanged from prior plan, extended scope)

```text
Supabase Vault (KEK, rotates every 30 days)
        │
        ▼
encryption_keys (wrapped DEKs, versioned)
        │
        ▼
AES-256-GCM field encryption
   • PII: dob, gender, address, whatsapp, blood_group...
   • Financial: PAN, GST, bank, revenue, payments
   • Intake: medical/family/relationship history
   • Short-lived secrets: OTP, reset tokens
        │
        ▼
SHA-256 hash columns (salted) for lookup-only fields
   • email_hash, phone_hash, pan_hash, gst_hash, whatsapp_hash
```

Performance, batched-decrypt RPC, TanStack cache strategy, and 30-day automatic KEK rotation are exactly as approved in the prior plan — no change.

## Implementation phases (revised)

**Phase 1 — Key infrastructure** (unchanged)
`pgcrypto`, `encryption_keys` table, Vault KEK, `encrypt_field` / `decrypt_field` / `hash_for_lookup` SECURITY DEFINER functions.

**Phase 2 — Schema migration (expanded)**
Add `*_enc` (`bytea`) and `*_hash` (`text`) columns on: `profiles` (12 fields), `clients` (6 fields), `business_profiles` (5 fields), `payments` (3 extra fields), `otp_codes`, `password_reset_tokens`. Backfill existing rows. Update hooks/pages: `SeekerProfile.tsx`, `useBusinessProfile.ts`, `ClientIntakePage.tsx`, `usePayments.ts`, `AdminInvoices.tsx`, `AdminExportFinancials.tsx`, `CoachBusinessNotes.tsx`, `useDbMessages.ts`, OTP/reset edge functions.

**Phase 3 — Password hardening**
- Enable HIBP (`configure_auth`).
- Add `profiles.password_changed_at` column + Auth webhook to update it.
- Banner component on admin/coach layouts after 90 days.
- Extend `passwordValidation.ts` with top-1000 common-password reject list.

**Phase 4 — 30-day automatic KEK rotation** (unchanged)
`pg_cron` + `rotate-encryption-keys` edge function + `key-rotation-monitor` for admin alerts.

**Phase 5 — Performance** (unchanged)
Batched `decrypt_many(ids[])`, TanStack cache, AES-NI hardware accel → <50 ms added latency on 100-row pages.

**Phase 6 — Admin UI**
`/admin/encryption-status` page: current KEK version, next rotation date, rotation history, count of encrypted rows per table, password-change-age stats.

## Files to be created / modified

**New migrations**
- `<ts>_encryption_infrastructure.sql` — extension, keys table, helper functions
- `<ts>_encrypted_columns_pii.sql` — profiles + clients PII columns + backfill
- `<ts>_encrypted_columns_financial.sql` — business_profiles + payments + accounting + cashflow + backfill
- `<ts>_encrypted_columns_secrets.sql` — otp_codes + password_reset_tokens
- `<ts>_password_changed_at.sql` — profiles column + Auth webhook hookup
- `<ts>_rotation_cron.sql` — pg_cron monthly schedule

**New edge functions**
- `supabase/functions/rotate-encryption-keys/index.ts`
- `supabase/functions/key-rotation-monitor/index.ts`

**New / modified app files**
- `src/lib/encryption.ts` (new — client decrypt helpers)
- `src/lib/passwordValidation.ts` (extend with common-password list + age check)
- `src/components/PasswordRotationBanner.tsx` (new)
- `src/pages/admin/AdminEncryptionStatus.tsx` (new) + sidebar link under Settings
- Updates: `SeekerProfile`, `useBusinessProfile`, `ClientIntakePage`, `usePayments`, `AdminInvoices`, `AdminExportFinancials`, `CoachBusinessNotes`, `useDbMessages`, `send-otp`, `verify-otp`, `admin-reset-password`, `check_profile_duplicate` RPC

**Auth config**
- `password_hibp_enabled: true`

## Out of scope
- Encrypting `profiles.full_name`, `email`, `phone` plaintext columns (kept for Auth + RLS compatibility — deferred to a later Auth-schema migration project).
- Encrypting Supabase-managed `auth.users` table (already managed by Supabase).
- Forced password rotation (only reminder banner — UX decision; can be tightened later).
- Hardware HSM / external KMS (Supabase Vault sufficient for current scale).
- Re-encrypting public marketing content, leaderboard display names, badge metadata.

## Smoke test
1. Update seeker profile with DOB, blood group, LinkedIn → verify `*_enc` columns populated, plaintext columns nulled (except email/phone/full_name).
2. Create payment with PAN/GST → verify encrypted, list page renders correctly via batched decrypt.
3. Submit intake form → verify medical/family histories encrypted at rest (raw SQL select shows `\x...` bytea).
4. Trigger OTP → row in `otp_codes` is encrypted; verify-OTP edge function still validates correctly.
5. Run manual `SELECT rotate_encryption_keys()` → new KEK version, old rows still decrypt, new writes use new version.
6. Set fake `password_changed_at` to 100 days ago for an admin → banner appears on next login.
7. Try signup with `Password123!` (a known-pwned password) → HIBP rejects with friendly message.
8. Lighthouse on `/admin/payments`, `/seeker/profile`, `/coaching/intake` before vs after → latency delta < 50 ms per page.

