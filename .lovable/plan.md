## Overview

Five connected enhancements. All purely additive — existing single-course fee structures, signatures, and profile pages keep working unchanged.

---

## 1. Fee Structure — Multi-Course, GST Toggle, Discount, Auto End Date

**File:** `src/components/FeeStructureForm.tsx` + `src/hooks/useFeeStructure.ts`

Extend the `fields_json` payload (no schema change — it's already JSONB on `agreements`):

```ts
{
  // existing fields preserved...
  primary_course_id: string | null,
  bundled_course_ids: string[],     // free / included add-ons
  include_gst: boolean,             // default true
  gst_rate: number,                 // default 18
  discount_amount: number,          // INR, subtracted before GST? -> after subtotal, before GST
  discount_reason: string,
  // auto-calculated, persisted for reporting:
  subtotal_amount: number,
  gst_amount: number,
  total_amount: number,
  total_sessions: number,           // primary + bundled sessions
  end_date: string,                 // auto from start_date + duration
}
```

UI changes inside the existing table layout:

- **Primary Course** row: dropdown sourced from `useDbCourses()`. On select → auto-fill `feePerSession`, `numSessions`, `coachingDuration` from course defaults.
- **Bundled Courses (Free)** row: multi-select chips. Each adds its `numSessions` to `total_sessions` but contributes ₹0 to price. Display as "Included — ₹0 (saved ₹X)".
- **GST toggle**: Yes/No radio. When "No" → `gst_amount = 0`, total = subtotal − discount.
- **Discount** row: number input + optional reason. Subtracted from subtotal *before* GST so GST applies to the discounted amount (standard practice; documented in the row label).
- **End Date**: read-only, computed from `start_date + coachingDuration` using `date-fns` (`addMonths` for "X months", `addDays` for "X days"). Falls back to manual edit if duration string is non-numeric.
- Total formula (shown in highlighted row):
  `total = (subtotal − discount) + (include_gst ? (subtotal − discount) × gst_rate/100 : 0)`

Free bundled courses also surface in `SeekerPayments.tsx` and the signed PDF (`buildClientPages.ts`) under a new "Included Programs" line.

---

## 2. Course Session Rules Engine (Per-Course Eligibility)

New table to store extensible rules per course:

```sql
CREATE TABLE public.course_session_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  trigger_enrollment_course_id uuid REFERENCES public.courses(id), -- e.g. AGT Premium
  free_sessions int NOT NULL DEFAULT 0,
  discounted_sessions int NOT NULL DEFAULT 0,
  discounted_rate_inr int NOT NULL DEFAULT 0,
  paid_after int NOT NULL DEFAULT 0, -- sessions index when full price kicks in
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.course_session_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage rules" ON public.course_session_rules
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "all read rules" ON public.course_session_rules FOR SELECT USING (true);
```

**Admin UI:** new "Session Rules" tab inside `AdminEditPrograms.tsx` listing rules for the course with add/edit/delete.

**Eligibility helper** `src/lib/sessionEligibility.ts`:

```ts
getSessionPricing(seekerId, courseId, sessionNumber) -> { tier: 'free'|'discounted'|'paid', amount: number }
```

Reads the seeker's enrollments + applicable rules and returns the pricing tier. Used by `SessionsPage` and `CoachSchedule` "New Session" dialog to display a price hint, and by `AdminRecordPayment` to pre-fill the amount.

Example seed (LOA when AGT Premium enrolled): `free_sessions=2, discounted_sessions=2, discounted_rate_inr=5000, paid_after=4`.

---

## 3. Signed Document — Reliable Delivery to Seeker

**File:** `supabase/functions/submit-signature/index.ts` (already emails a 7-day signed URL; gap is reliability + permanent access).

Improvements:

1. **Attach the signed PDF directly** (not just a link). Use `sendEmail` with `attachments: [{ filename, content: base64 }]`. This guarantees delivery even if the link expires.
2. **Persist a permanent record** so the seeker can re-download anytime: use existing `document_signatures` row (already inserted) and surface in `SeekerPayments.tsx` → new "Signed Documents" section that calls `supabase.storage.from('signatures').createSignedUrl(signed_pdf_path, 3600)` on demand.
3. **In-app notification** with action link → `/seeker/documents/:id` (already partially present).
4. **Coach copy**: keep current admin/coach email but also attach PDF.

Add a new edge function `get-my-signed-documents` that returns the seeker's own signed docs with fresh signed URLs (RLS-checked: `seeker_id = auth profile id`).

---

## 4. Profile Picture Upload — Seekers + Admins (Camera + File)

New shared component `src/components/AvatarUploader.tsx`:

- Circular preview of current `avatar_url` with a hover "Change photo" overlay.
- Two action buttons: **"Upload from device"** (file input, accept=`image/*`) and **"Take photo"** (opens a `<Dialog>` with `getUserMedia({ video: { facingMode: 'user' } })`, captures to canvas, returns Blob).
- Client-side resize to ≤512×512, JPEG 0.85 quality (using canvas) before upload.
- Uploads to existing public `avatars` bucket at `avatars/{user_id}/profile-{timestamp}.jpg` then updates `profiles.avatar_url`.
- Loading + error states; toast on success.

Storage RLS (avatars bucket is already public for read; ensure write policies):

```sql
CREATE POLICY "users upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "users update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "admins manage all avatars" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'avatars' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'avatars' AND public.is_admin(auth.uid()));
```

(Uses `IF NOT EXISTS` guard via `DROP POLICY IF EXISTS` first.)

**Integration points:**

- `src/pages/seeker/SeekerProfile.tsx` → replace name-only header with `<AvatarUploader profileId={seekerProfileId} />`.
- `src/pages/admin/SeekerDetailPage.tsx` → header avatar gains the same uploader (admin can upload on behalf of seeker; pass `targetUserId`).
- `src/pages/coaching/CoachSettings.tsx` → coach can update own avatar.

Display side: existing leaderboards / lists already read `avatar_url`, so they pick up the change automatically.

---

## Files Touched

```
supabase/migrations/<new>.sql                       course_session_rules + storage RLS
src/hooks/useFeeStructure.ts                        extended fields type
src/components/FeeStructureForm.tsx                 multi-course, GST toggle, discount, end-date
src/lib/sessionEligibility.ts                       NEW pricing helper
src/components/AvatarUploader.tsx                   NEW shared uploader (file + camera)
src/pages/seeker/SeekerProfile.tsx                  use AvatarUploader
src/pages/admin/SeekerDetailPage.tsx                use AvatarUploader (admin scope)
src/pages/coaching/CoachSettings.tsx                use AvatarUploader
src/pages/admin/AdminEditPrograms.tsx               Session Rules tab
src/pages/seeker/SeekerPayments.tsx                 Signed Documents section
supabase/functions/submit-signature/index.ts        attach PDF to seeker email
supabase/functions/get-my-signed-documents/index.ts NEW
supabase/functions/_shared/buildClientPages.ts      render bundled courses + discount + GST toggle
```

## Out of Scope

- Refunding or recomputing already-saved fee structures (legacy rows continue to render with old logic).
- Cropping UI for avatar (auto-square center crop only).
- Per-session rule overrides at the seeker level (only course-level rules in v1; can add later).
