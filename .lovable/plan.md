## Goal
Eliminate plaintext storage of sensitive data (passwords, emails, mobiles, revenue, tokens) by reusing the existing server-side `encrypt_field` / `decrypt_field` / `hash_for_lookup` / `hash_token` system that already protects most PII.

## Audit Findings

What is **already** safe:
- `profiles`: dob, gender, pincode, whatsapp, hometown, linkedin, blood_group, address, emergency_contact, anniversary, PAN, Aadhaar — all stored in `*_enc` bytea columns + searchable via `*_hash`. (`email` and `phone` are intentionally kept plaintext for auth lookups but are also hashed.)
- `business_profiles`: gst_number, pan, bank_account, ifsc, **revenue** — all encrypted.
- `signature_requests.token_hash` — hashed, not raw.
- `submissions`: passwords are deleted from `form_data` after approval.

What is **NOT** safe and will be fixed:

| Table | Column(s) | Issue | Fix |
|---|---|---|---|
| `submissions.form_data` | `password` (jsonb key) | Plaintext password sits in row from submit until admin approval | Encrypt on insert, decrypt only inside `approve-application` edge function |
| `leads` | `email`, `phone` | Plaintext PII for every lead, no hash | Add `email_enc`, `phone_enc`, `email_hash`, `phone_hash`; drop plaintext after backfill |
| `business_profiles` | `revenue_range` | Plaintext revenue bracket | Add `revenue_range_enc`, drop plaintext |
| `email_unsubscribe_tokens` | `token`, `email` | Raw token + raw email stored; service-role only but still PII at rest | Replace `token` with `token_hash`; drop plaintext `email` (keep `email_hash` already present) |
| `lgt_applications` | `invite_token` | Raw invite token stored | Replace with `invite_token_hash` |

## Migration (single SQL migration)

1. **Leads PII**
   ```sql
   ALTER TABLE public.leads
     ADD COLUMN email_enc bytea,
     ADD COLUMN phone_enc bytea,
     ADD COLUMN email_hash text,
     ADD COLUMN phone_hash text;
   -- Backfill existing rows using encrypt_field / hash_for_lookup
   UPDATE public.leads SET
     email_enc  = public.encrypt_field(email),
     phone_enc  = public.encrypt_field(phone),
     email_hash = public.hash_for_lookup(email),
     phone_hash = public.hash_for_lookup(phone);
   ALTER TABLE public.leads DROP COLUMN email, DROP COLUMN phone;
   CREATE INDEX leads_email_hash_idx ON public.leads(email_hash);
   CREATE INDEX leads_phone_hash_idx ON public.leads(phone_hash);
   ```

2. **Business revenue bracket**
   ```sql
   ALTER TABLE public.business_profiles ADD COLUMN revenue_range_enc bytea;
   UPDATE public.business_profiles SET revenue_range_enc = public.encrypt_field(revenue_range);
   ALTER TABLE public.business_profiles DROP COLUMN revenue_range;
   ```

3. **Unsubscribe tokens** — store hash only
   ```sql
   ALTER TABLE public.email_unsubscribe_tokens ADD COLUMN token_hash text;
   UPDATE public.email_unsubscribe_tokens SET token_hash = public.hash_token(token);
   ALTER TABLE public.email_unsubscribe_tokens
     DROP COLUMN token,
     DROP COLUMN email;     -- email_hash already maintained by trigger
   CREATE UNIQUE INDEX email_unsubscribe_tokens_hash_key ON public.email_unsubscribe_tokens(token_hash);
   ```

4. **LGT invite tokens**
   ```sql
   ALTER TABLE public.lgt_applications ADD COLUMN invite_token_hash text;
   UPDATE public.lgt_applications SET invite_token_hash = public.hash_token(invite_token) WHERE invite_token IS NOT NULL;
   ALTER TABLE public.lgt_applications DROP COLUMN invite_token;
   CREATE UNIQUE INDEX lgt_applications_invite_token_hash_key ON public.lgt_applications(invite_token_hash) WHERE invite_token_hash IS NOT NULL;
   ```
   Update RPC `get_lgt_application_by_token` and `submit_lgt_application_by_token` to look up by `hash_token(_token)`.

5. **Submissions password** — encrypt the `password` field within `form_data` JSON
   - Add trigger `encrypt_submission_password` BEFORE INSERT/UPDATE on `submissions` that, if `form_data ? 'password'`, replaces it with `{ password_enc: encode(encrypt_field(...), 'hex') }` and removes the plaintext key.
   - Approve flow decrypts via `decrypt_field`.

## Code changes

- **`src/pages/RegisterPage.tsx`** — no client change needed (server trigger handles encryption transparently).
- **`src/hooks/useDbLeads.ts`** + any leads list/detail pages — switch reads to a new `get_leads_decrypted()` SECURITY DEFINER view/RPC that returns plaintext for admins only; on insert call `encrypt_field` via existing `encryptField()` helper or rely on a BEFORE INSERT trigger on `leads` (preferred — mirrors the profile pattern).
- **`src/pages/admin/AdminAddLead.tsx`**, **`AdminAllLeads.tsx`**, **`AdminHotLeads.tsx`**, **`LeadsPage.tsx`** — read decrypted values via the new RPC; write plain strings (trigger encrypts).
- **`src/hooks/useBusinessProfile.ts`** + **`CoachBusinessNotes.tsx`** + admin business pages — add `revenue_range` to the encrypted payload helper.
- **`supabase/functions/approve-application/index.ts`** — read `form_data.password_enc` and call `decrypt_field` RPC instead of `fd.password`.
- **`supabase/functions/send-notification/index.ts`** + unsubscribe flow — generate token, store only its `hash_token` digest; lookup by hash on click.
- **`supabase/functions/send-lgt-invite/index.ts`** + LGT pages — same hashed-token pattern.

## Triggers (added in same migration)
- `encrypt_submission_password` on `public.submissions`
- `maintain_leads_pii` on `public.leads` (mirrors `maintain_profile_hashes`, but also encrypts)

## Verification
After deploy:
- `SELECT email, phone FROM leads LIMIT 1;` → columns no longer exist.
- `SELECT form_data->'password' FROM submissions WHERE status='pending' LIMIT 1;` → null.
- `SELECT token FROM email_unsubscribe_tokens LIMIT 1;` → column no longer exists.
- Re-run security scan; expect zero "plaintext sensitive data" findings.

## Out of scope (intentional)
- `profiles.email` and `profiles.phone` plaintext — required by Supabase Auth lookups and existing unique constraints; their hashes already exist and RLS restricts read access. Leaving as-is unless you want a deeper refactor.
