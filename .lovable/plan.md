

## Goal
Finish the digital signature workflow by wiring the **"Documents & Signatures"** tab into both the admin Seeker Detail page and the coach's Seeker Detail page, so admins/coaches can send documents from a seeker's journey and track their status.

## Changes

### 1. New reusable component: `src/components/SeekerSignaturesTab.tsx`
Single component used by both admin and coach views. Props: `{ seekerId: string }`.

Features:
- **Status table** of all `signature_requests` for this seeker — columns: Document title, Sent on, Status badge (Pending / Signed / Expired / Cancelled), Signed on, Actions.
- **"Send Document for Signature"** button → opens existing `SendForSignatureDialog`.
- Per-row actions:
  - Pending → **Resend link** (calls `resend-document-signature` edge function) + **Cancel** (sets status to `cancelled`).
  - Signed → **Download signed PDF** (signed URL from `signatures` bucket via `document_signatures.signed_pdf_path`).
- Auto-refresh after send/resend/cancel using TanStack Query invalidation.
- Empty state: "No documents sent yet — click 'Send Document for Signature' to get started."

### 2. Wire into `src/pages/admin/SeekerDetailPage.tsx`
Add a new tab **"Documents & Signatures"** to the existing tab list, rendering `<SeekerSignaturesTab seekerId={seeker.id} />`. Preserves all existing tabs (Overview, Personal Details, Sessions, etc.) per the preservation policy.

### 3. Wire into `src/pages/coaching/CoachSeekerDetail.tsx`
Add a new `<TabsTrigger value="documents">📄 Documents</TabsTrigger>` next to the existing Wheel/SWOT/LGT/Overview tabs, with a `<TabsContent value="documents">` rendering the same `<SeekerSignaturesTab>`.

### 4. Verification pass
- Admin opens a seeker → "Documents & Signatures" tab → sends a library doc → seeker email arrives → seeker signs at `/sign/<token>` → row flips to **Signed**, download button works.
- Coach opens own seeker → same flow works (RLS already permits coach SELECT on `signature_requests` for own seekers).
- Resend bumps `expires_at`; Cancel removes it from the active list.
- All existing seeker-detail tabs and behaviour remain untouched.

## Files affected
- New: `src/components/SeekerSignaturesTab.tsx`
- Edited: `src/pages/admin/SeekerDetailPage.tsx`, `src/pages/coaching/CoachSeekerDetail.tsx`

## Out of scope
- No DB or edge-function changes (already shipped in the prior step).
- No change to the public `/sign/:token` page.
- Bulk send / cross-seeker dispatch — single-seeker flow only.

