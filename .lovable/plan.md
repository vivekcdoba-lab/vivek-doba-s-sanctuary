## Goal
Show how each signature was captured — **Email** (seeker signed via the link sent by email) vs **In-Person / Sign Here** (admin signed inline on the seeker's behalf) — as a new column in the `SeekerSignaturesTab` table.

## 1. Database — add `sign_method` to `signature_requests`
New migration:
```sql
ALTER TABLE public.signature_requests
  ADD COLUMN IF NOT EXISTS sign_method text
  CHECK (sign_method IN ('email','in_person')) DEFAULT 'email';

-- Backfill existing rows based on what created them:
-- 'in_person' if signed_at exists AND the matching document_signatures.place was captured in-app (Sign Here flow always sets place + signature_date),
-- 'email' otherwise.
UPDATE public.signature_requests sr
SET sign_method = 'in_person'
FROM public.document_signatures ds
WHERE ds.request_id = sr.id
  AND ds.place IS NOT NULL
  AND sr.custom_message IS NULL
  AND sr.sent_at = sr.signed_at;  -- inline flow stamps both at the same instant

UPDATE public.signature_requests
SET sign_method = 'email'
WHERE sign_method IS NULL;
```

## 2. Edge functions — set `sign_method` on insert
- **`supabase/functions/sign-document-inline/index.ts`** — when inserting into `signature_requests`, add `sign_method: 'in_person'`.
- **`supabase/functions/request-document-signature/index.ts`** — add `sign_method: 'email'` on insert.
- **`submit-signature`** and **`resend-document-signature`** — no change (they update existing rows; method is preserved).

## 3. Frontend — new "Method" column in `SeekerSignaturesTab.tsx`
- Extend the `Row` interface to include `sign_method: 'email' | 'in_person' | null`.
- Add `sign_method` to the `select(...)` query.
- Insert a new `<TableHead>Method</TableHead>` between **Status** and **Signed**.
- Render as a small badge:
  - `Email` → outline badge with `Mail` icon
  - `In-Person` → outline badge with `PenLine` icon
  - fallback `—` if null

No other UI/flow changes. Existing actions (Resend, Cancel, Download) continue to work identically.

## Files affected
- New migration file under `supabase/migrations/`
- `supabase/functions/sign-document-inline/index.ts`
- `supabase/functions/request-document-signature/index.ts`
- `src/components/SeekerSignaturesTab.tsx`

## Out of scope
- No changes to PDF templates, email templates, sender address, RLS, or duplicate-prevention logic (those remain as previously discussed/handled).
