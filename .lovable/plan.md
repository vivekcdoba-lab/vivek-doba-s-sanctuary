

## Goal
Three fixes:
1. **Email not sent for signature** — root cause: edge functions call `supabase.auth.getClaims(...)` which doesn't exist on supabase-js v2.45 → handler throws before sending email.
2. **Close "Send Document for Signature" dialog after send** — already calls `onOpenChange(false)` on success but only after the email loop; ensure it always closes after the request returns success and clears state.
3. **Inbuilt audio/video player on `/resources` (admin Resource Library)** — currently every "View →" opens a new browser tab. Add an in-app modal player for `audio`, `video` (YouTube/Vimeo embed + raw URL), and `pdf` (iframe preview).

---

## Part 1 — Fix signature emails (CRITICAL)

**Files**: `supabase/functions/request-document-signature/index.ts`, `supabase/functions/resend-document-signature/index.ts`

Replace the broken auth check:
```ts
// BEFORE (throws TypeError → 401, no email sent)
const { data: claimData } = await supabase.auth.getClaims(token);
const callerId = claimData.claims.sub;

// AFTER (works on supabase-js v2.45)
const { data: { user }, error: userErr } = await supabase.auth.getUser();
if (userErr || !user) return 401;
const callerId = user.id;
```

Both edge functions auto-redeploy on save. After the fix, sending to `crwanare@gmail.com` will dispatch via the Resend connector gateway.

**Verification I'll do after fix**: tail `request-document-signature` edge logs to confirm no more `TypeError: supabase.auth.getClaims is not a function`. Will not actually send a test email (per earlier "no records" rule).

---

## Part 2 — Close dialog after send

**File**: `src/components/SendForSignatureDialog.tsx`

The dialog already calls `onOpenChange(false)` on success. The user's perceived bug is the email not arriving (Part 1). To make this rock-solid I'll also:
- Show a clear toast `"Email sent to <seeker email>"` (uses returned data).
- Keep the dialog open with an inline error banner if the function returns an error, instead of just a toast — so the admin can retry without re-selecting documents.
- Ensure `setSending(false)` always runs and the dialog closes after a successful send (already correct, just verifying flow).

---

## Part 3 — Inbuilt player on `/resources`

**File**: `src/pages/admin/ResourcesPage.tsx`

Replace the external-tab `openResource` flow with a unified in-app preview modal:

- New `<ResourcePreviewModal>` with three render modes detected from `resource.type`:
  - **audio**: HTML5 `<audio controls>` with the resolved URL (signed URL for `storage:resources/`).
  - **video**: 
    - YouTube/Vimeo links → embed iframe (reuses regex from `SeekerLearningVideos.tsx`).
    - Direct file URL (mp4/webm) or `storage:resources/` → HTML5 `<video controls>`.
  - **pdf** / **worksheet**: `<iframe>` of the resolved URL inside the modal (signed URL when storage-backed).
- "Open in new tab" secondary button kept inside the modal for users who prefer it.
- For unknown URL shapes (e.g. Google Drive share links that browsers block in iframes), fall back to opening in a new tab automatically and show a small note.

The "View →" button on each card now opens the modal instead of `window.open`. PDF thumbnails already render — clicking a card opens the modal too.

---

## Verification (no records created)
1. Read updated edge function logs to confirm the `getClaims` error is gone.
2. `tsc --noEmit` and `vite build` to confirm no regressions in `ResourcesPage.tsx` / `SendForSignatureDialog.tsx`.
3. Static review of the modal logic against existing `SeekerLearningVideos.tsx` embed pattern for parity.

## Files affected
- Edited: `supabase/functions/request-document-signature/index.ts` (auth fix)
- Edited: `supabase/functions/resend-document-signature/index.ts` (auth fix)
- Edited: `src/components/SendForSignatureDialog.tsx` (clearer feedback, inline error)
- Edited: `src/pages/admin/ResourcesPage.tsx` (inbuilt preview modal for audio/video/pdf)

## Out of scope
- No DB or RLS changes.
- No changes to seeker-facing learning pages (already have inbuilt players).
- No deletion of existing components per "Only Add and Enhance" policy.

