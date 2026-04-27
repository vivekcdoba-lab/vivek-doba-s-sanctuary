## Fix 2 RLS / data-exposure findings

Two low-risk, high-impact fixes from the security re-scan.

---

### Fix 1 — Drop `otp_codes.otp_code` plaintext column (severity: error)

The `otp_codes` table currently stores OTPs in BOTH `otp_code` (plaintext) and `code_enc` (encrypted). RLS already blocks user reads, but the plaintext copy is a latent leak risk for any service-role query / DB dump / future policy mistake.

**Edge function changes** (the only consumers of the column):

1. `supabase/functions/send-otp/index.ts` — stop writing `otp_code: otp` on insert; keep writing `code_enc` (already done via `encrypt_field` RPC). If `encrypt_field` write isn't already there, add it.
2. `supabase/functions/verify-otp/index.ts` — remove the plaintext fallback. Require `code_enc` and decrypt via `decrypt_field` RPC. If decryption fails → return "Invalid OTP".

**Migration**:
```sql
ALTER TABLE public.otp_codes DROP COLUMN otp_code;
```

---

### Fix 2 — Seekers can read their own signed session records (severity: warn)

`session_signatures` has admin SELECT + signer INSERT, but seekers cannot read back rows they signed themselves.

**Migration**:
```sql
CREATE POLICY "Seekers read own signatures"
ON public.session_signatures
FOR SELECT
TO authenticated
USING (
  signer_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);
```

(`get_session_signatures` SECURITY DEFINER RPC remains unchanged for the existing UI flow.)

---

### Verification steps after deploy
1. Trigger an OTP from the registration page → confirm it arrives and verifies successfully (proves `code_enc` path works end-to-end).
2. As a seeker who has signed a session, query `session_signatures` from the client → row(s) returned.
3. Re-run security scan → both findings cleared.

### Files touched
- `supabase/functions/send-otp/index.ts` (drop `otp_code` field on insert if present)
- `supabase/functions/verify-otp/index.ts` (remove plaintext fallback)
- New migration: drop column + add seeker SELECT policy

### Out of scope (deferred)
- Coach access to full `profiles` row — needs a restricted view (larger refactor).
- `leads` coach-access policy — pending product decision.
- `swot_competitors` non-admin SELECT — pending product decision.
- Notifications realtime channel naming audit.
