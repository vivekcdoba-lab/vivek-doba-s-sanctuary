

## Goal
Run the Phase-6 one-time backfill: encrypt all existing plaintext data in the sensitive columns into their `*_enc` counterparts so historical rows are protected to the same standard as new writes.

## What gets backfilled

For every touched table, run `UPDATE ... SET col_enc = encrypt_field(col) WHERE col_enc IS NULL AND col IS NOT NULL` — done in a single migration (row counts are small enough that batching is unnecessary; the AES-GCM call is ~1µs per field).

| Table | Columns backfilled |
|---|---|
| `profiles` | `dob`, `gender`, `pincode`, `whatsapp`, `hometown`, `linkedin_url`, `blood_group` |
| `clients` | `personal_history`, `medical_history`, `family_details`, `relationship_status`, `children_details`, `parents_details` |
| `business_profiles` | `gst_number`, `pan`, `bank_account`, `ifsc`, `revenue` (+ populate `gst_hash`, `pan_hash`) |
| `payments` | `transaction_id`, `notes`, `payer_pan`, `payer_gst`, `bank_ref` |
| `accounting_records` | `revenue`, `expenses`, `taxes`, `notes` |
| `cashflow_records` | `amount`, `description` |
| `messages` | `body` |

## Plaintext retention strategy

- **Keep** the legacy plaintext columns NOT-NULL in this migration. Read paths already prefer `*_enc` and fall back to plaintext, so nothing breaks. This makes the backfill **fully reversible** if a decrypt issue surfaces.
- A follow-up cleanup migration (separate, after one full week of monitoring) will null out the legacy plaintext columns once we've confirmed every `*_enc` value decrypts correctly.

## Safety guards inside the migration

1. Wrap each table update in its own `DO $$ ... $$` block so a failure in one table doesn't abort the others.
2. Skip rows where the source column is NULL or empty.
3. Skip rows where `*_enc` is already populated (idempotent — safe to re-run).
4. Log per-table row counts via `RAISE NOTICE` so the migration output shows exactly what was encrypted.
5. Verify with a final `SELECT` block that returns counts of `enc IS NOT NULL` per table for spot-checking.

## Files to be created

- `<ts>_backfill_encrypted_fields.sql` — the single backfill migration described above.

## Out of scope (deferred)

- Nulling-out of legacy plaintext columns (separate migration after monitoring window).
- Re-encrypting `auth.users` data (Supabase-managed).
- `otp_codes` / `password_reset_tokens` — short-lived, expire naturally; no historical backfill needed.
- `profiles.email` / `phone` / `full_name` — kept plaintext by design (Auth + RLS joins); hashes already maintained.

## Smoke test (after migration)

1. `SELECT count(*) FROM profiles WHERE dob IS NOT NULL AND dob_enc IS NULL` → 0.
2. `SELECT decrypt_field(dob_enc) FROM profiles WHERE dob_enc IS NOT NULL LIMIT 5` → matches original values.
3. Open `/seeker/profile` for an existing seeker → DOB / blood group render correctly (now sourced from `*_enc`).
4. Open `/admin/payments` for historical rows → transaction IDs and notes still display.
5. Open `/admin/encryption-status` → encryption-coverage counters show the backfilled rows.
6. Re-run the same migration → second run reports 0 rows updated per table (idempotency confirmed).

