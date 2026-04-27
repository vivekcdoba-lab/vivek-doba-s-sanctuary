## Goal

Enhance the admin-only `/admin/apply-lgt` page so the admin can:

1. **Pick an approved seeker** (from a dropdown) who has NOT yet filled the LGT detailed application.
2. **Auto-populate** the form with that seeker's known profile data (name, email, phone, city, state, country, dob, company, occupation).
3. Optionally **email the seeker a personal link** so the seeker can complete the form themselves (instead of the admin filling it in person).
4. The seeker opens the link, signs in (or uses a token), fills the form, and submits — same form, just opened from their own account.

## Database changes

### New table: `lgt_applications`

The existing `submissions` table is keyed by anonymous public intake (no seeker_id). We need a tracked, seeker-linked LGT application record.

```sql
CREATE TABLE public.lgt_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending', -- pending | submitted
  form_data jsonb,
  invite_token text UNIQUE,                -- secure random token (nullable)
  invite_token_expires_at timestamptz,     -- 14-day expiry
  invited_by uuid REFERENCES auth.users(id),
  invited_at timestamptz,
  invite_email_sent_at timestamptz,
  filled_by_role text,                     -- 'admin' | 'seeker'
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (seeker_id)                       -- one application per seeker
);

ALTER TABLE public.lgt_applications ENABLE ROW LEVEL SECURITY;
```

### RLS policies
- **Admins**: SELECT/INSERT/UPDATE all rows (`is_admin(auth.uid())`).
- **Seekers**: SELECT/UPDATE only rows where `seeker_id = (their profile id)` AND `status = 'pending'`.
- **Public token access**: handled via SECURITY DEFINER RPC `get_lgt_application_by_token(_token text)` and `submit_lgt_application_by_token(_token text, _form_data jsonb)` so an unauthenticated email link works without exposing the table.

### Indexes
- `lgt_applications_seeker_id_idx`, `lgt_applications_invite_token_idx`, `lgt_applications_status_idx`.

## Frontend changes

### 1. New admin landing component for `/admin/apply-lgt`

`src/pages/admin/AdminApplyLgt.tsx` (new)

Default view (no seeker selected) shows a small chooser panel:

```
┌─ LGT Application — Admin Entry ───────────────────────────┐
│  Select an approved seeker who has NOT filled this form:   │
│  [ Searchable dropdown of approved seekers ▾ ]             │
│                                                            │
│  — OR —                                                    │
│                                                            │
│  ✉️  Email the form link to the seeker instead             │
└────────────────────────────────────────────────────────────┘
```

- Dropdown source: `profiles` where `role = 'seeker'` AND profile.id NOT IN (SELECT seeker_id FROM lgt_applications WHERE status = 'submitted'). Search by name/email.
- On selection: render existing `<ApplyLGT adminMode initialData={…} />` with profile data pre-mapped into form fields (`fullName`, `email`, `mobile`, `mobileCode`, `city`, `state`, `country`, `dob`, `company`, `designation` → occupation).
- "Save Intake" button persists to `lgt_applications` (upsert by seeker_id) instead of `submissions`. Add a small wrapper hook so existing `ApplyLGT` form continues to work — extend `ApplyLGTProps` to optionally accept `seekerId` and `applicationId`, and branch save logic.
- "Send invite email" button: generates a secure `invite_token` (server-side via edge function), sets 14-day expiry, calls Resend (already configured) with a templated email containing `https://vivekdoba.com/lgt-form/{token}`. Updates `invited_at` and `invite_email_sent_at`.

### 2. New public token page

`src/pages/SeekerLgtForm.tsx` (new) — route `/lgt-form/:token`

- Calls SECURITY DEFINER RPC `get_lgt_application_by_token` (no auth required).
- If valid + not expired + status != 'submitted': renders `<ApplyLGT />` in seeker mode with prefilled data and a banner "Welcome, {name} — Vivek Sir invited you to complete this form." Submit calls `submit_lgt_application_by_token`.
- If invalid/expired/already-submitted: shows friendly error + WhatsApp/back-to-home links.

### 3. Extend `ApplyLGT` props

Add optional fields to `ApplyLGTProps`:
- `applicationId?: string` (lgt_applications row id)
- `seekerId?: string`
- `tokenMode?: { token: string }` (for public submit)
- `onSubmittedByToken?: () => void`

Branch in `handleAdminSave` / `handleSubmit`: if `applicationId` is present → upsert `lgt_applications` row. If `tokenMode` is present → call `submit_lgt_application_by_token` RPC. Otherwise keep existing `submissions` insert (preserves legacy public flow at the redirected `/apply-lgt` → `/login`, which is now disconnected anyway).

### 4. Routing (`src/App.tsx`)

- Replace current `/admin/apply-lgt` → `<ApplyLGT />` with `<AdminApplyLgt />`.
- Add public route: `<Route path="/lgt-form/:token" element={<SeekerLgtForm />} />`.

## Edge function

`supabase/functions/send-lgt-invite/index.ts` (new) — admin-only, JWT-validated:
- Input: `{ seekerId: string }`.
- Generates `crypto.randomUUID()` token, expiry = now + 14 days.
- Upserts `lgt_applications` row (status `pending`).
- Sends Resend email (templated, brand colors, with dynamic seeker name + program intro + CTA button → `https://vivekdoba.com/lgt-form/{token}`).
- Returns `{ success, token, expiresAt, sentAt }`.

## Result

- `/admin/apply-lgt` — admin chooser → either fill form in-person OR send invite email.
- Approved seekers without an existing application appear in the dropdown.
- Once submitted (by admin or seeker), the seeker disappears from the dropdown.
- Email link `/lgt-form/{token}` works without login; expires after 14 days; one-time submit.

## Files

**Created**
- `supabase/migrations/<timestamp>_lgt_applications.sql`
- `supabase/functions/send-lgt-invite/index.ts`
- `src/pages/admin/AdminApplyLgt.tsx`
- `src/pages/SeekerLgtForm.tsx`

**Modified**
- `src/App.tsx` (route swap + new public route)
- `src/pages/ApplyLGT.tsx` (extend props + branch save logic)
- `src/components/AdminLayout.tsx` (sidebar label tweak — keep entry, no change required)

No existing data is altered. Existing `submissions` flow remains intact for legacy submissions.

## Open question

Right now "approved seeker" = any profile with `role = 'seeker'`. The codebase doesn't have a separate `approved` flag on profiles — once a registration is approved (`approve-application` edge function), the user becomes a real seeker profile. So **"approved seeker"** = any active `profiles.role = 'seeker'` row. Confirm this is what you mean. If you'd like a stricter filter (e.g. only seekers with at least one paid enrollment), say so and I'll narrow the dropdown source.
