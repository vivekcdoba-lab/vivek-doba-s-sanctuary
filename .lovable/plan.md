

## Goal
Activate the encryption infrastructure already in place by wiring `encryptField` / `decryptField` into the live write/read paths so all NEW sensitive data is stored as `*_enc` (AES-256-GCM, versioned, auto-rotated) instead of plaintext.

## Scope — what gets switched on

| Surface | Reads/writes affected | Encrypted columns now used |
|---|---|---|
| `SeekerProfile.tsx` (seeker profile editor) | save + load | `profiles.dob_enc`, `gender_enc`, `pincode_enc`, `whatsapp_enc`, `hometown_enc`, `linkedin_url_enc`, `blood_group_enc` |
| `useBusinessProfile.ts` | create + update + read | `business_profiles.gst_number_enc`, `pan_enc`, `bank_account_enc`, `ifsc_enc`, `revenue_enc` (+ `gst_hash`, `pan_hash`) |
| `usePayments.ts` (+ `AdminInvoices`, `AdminExportFinancials`) | create + list | `payments.transaction_id_enc`, `notes_enc`, `payer_pan_enc`, `payer_gst_enc`, `bank_ref_enc` |
| `useDbMessages.ts` | send + list | `messages.body_enc` |
| `supabase/functions/send-otp` | insert | `otp_codes.code_enc` (+ keep plaintext briefly for back-compat, removed in cleanup) |
| `supabase/functions/verify-otp` | lookup | reads `code_enc` via `decrypt_field` RPC |
| `supabase/functions/admin-reset-password` | token issue | `password_reset_tokens.token_hash` only (one-way SHA-256) |
| `ClientIntakePage.tsx` | save + load | `clients.personal_history_enc`, `medical_history_enc`, `family_details_enc`, `relationship_status_enc`, `children_details_enc`, `parents_details_enc` |
| `CoachBusinessNotes.tsx` | reads | decrypted business fields via batched RPC |

## Strategy — no perceptible latency

1. **Writes**: call `encryptField()` once per sensitive field in the mutation; numeric/financial values are stringified before encrypt, parsed back on decrypt.
2. **Reads**: add a server-side batched RPC `decrypt_many(payloads bytea[]) → text[]` so a list view does ONE round trip regardless of row count. Single-row pages use the existing `decrypt_field` RPC.
3. **Caching**: rely on existing TanStack Query cache — decrypted plaintext lives in memory, never re-fetched within session.
4. **Backward compatibility**: every read path falls back to the legacy plaintext column when `*_enc` is NULL (so existing rows keep working until the one-time backfill runs).

## Implementation phases

**Phase 1 — Server helpers**
- New RPC `decrypt_many(bytea[]) → text[]` (SECURITY DEFINER) for batched list-page decryption.
- New RPC `hash_token(text) → text` thin wrapper for password-reset token hashing.

**Phase 2 — Profile + Business writes**
- `SeekerProfile.handleSave`: encrypt 7 PII fields before update; load path decrypts via `decrypt_field`.
- `useBusinessProfile`: encrypt 5 financial fields on insert/update; populate `gst_hash`/`pan_hash` via `hash_for_lookup`.

**Phase 3 — Payments + Messages**
- `usePayments.createPayment`: encrypt `transaction_id`, `notes`, optional `payer_pan`, `payer_gst`, `bank_ref`.
- `usePayments` list query: hydrate decrypted values via `decrypt_many`.
- `AdminInvoices`, `AdminExportFinancials`, `CoachBusinessNotes`: consume the same decrypted hook output (no per-component decrypt).
- `useDbMessages.useSendMessage`: encrypt `body`; list query decrypts via `decrypt_many`.

**Phase 4 — Auth-adjacent secrets**
- `send-otp` edge function: write `code_enc` via `encrypt_field` RPC (service-role); keep ttl + rate limits unchanged.
- `verify-otp`: fetch row, call `decrypt_field` RPC, compare; bump attempts on failure as today.
- `admin-reset-password`: store SHA-256 hash of token only; verifier compares hashes.

**Phase 5 — Intake form**
- `ClientIntakePage.tsx`: encrypt 6 long-form medical/family text fields on save; decrypt on load. Coach-side viewer uses `decrypt_many`.

**Phase 6 — One-time backfill (optional, post-deploy)**
- Migration: for each touched table, `UPDATE ... SET col_enc = encrypt_field(col), col = NULL WHERE col_enc IS NULL AND col IS NOT NULL` in batches of 500. Safe because read paths already fall back.

## Files to be modified / created

**New migration**
- `<ts>_decrypt_many_rpc.sql` — batched decrypt helper
- `<ts>_backfill_encrypted_fields.sql` — Phase-6 one-time backfill (run after app code ships)

**Modified**
- `src/pages/seeker/SeekerProfile.tsx`
- `src/hooks/useBusinessProfile.ts`
- `src/hooks/usePayments.ts`
- `src/hooks/useDbMessages.ts`
- `src/lib/encryption.ts` (add `decryptMany`, `hashToken` helpers)
- `src/pages/admin/AdminInvoices.tsx` (consume decrypted hook output only)
- `src/pages/admin/AdminExportFinancials.tsx` (same)
- `src/pages/coaching/CoachBusinessNotes.tsx` (same)
- `src/pages/coaching/ClientIntakePage.tsx`
- `supabase/functions/send-otp/index.ts`
- `supabase/functions/verify-otp/index.ts`
- `supabase/functions/admin-reset-password/index.ts`

## Out of scope
- Encrypting `profiles.email` / `phone` / `full_name` plaintext columns (kept for Auth + RLS joins; hashes already maintained by trigger).
- Re-encrypting historical Supabase-managed `auth.users` data.
- Forced password rotation (banner already covers reminder).
- Touching public marketing, leaderboard names, badge metadata.

## Smoke test
1. Edit seeker profile (DOB, blood group, LinkedIn) → SQL `SELECT dob, dob_enc FROM profiles WHERE id=…` shows `dob_enc` populated; UI re-renders correct values.
2. Create payment with transaction id + notes → `transaction_id` NULL, `transaction_id_enc` `\x…`; admin invoices list still shows the id.
3. Send a message → `body_enc` populated; recipient sees plaintext via realtime.
4. Trigger OTP → `otp_codes.code_enc` populated; `verify-otp` succeeds with correct code, fails + increments attempts on wrong code.
5. Submit intake form → 6 medical/family text fields encrypted at rest; coach intake viewer renders plaintext.
6. Open admin payments page with 100 rows → network tab shows ONE `decrypt_many` RPC call; Lighthouse latency delta < 50 ms vs baseline.
7. Manually run `SELECT rotate_encryption_keys('manual')` → new key version; both old (v1) and new (v2) encrypted rows decrypt correctly.

