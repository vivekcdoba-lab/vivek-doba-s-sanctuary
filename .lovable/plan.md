
## Two issues, both confirmed

### Issue 1 — "Where do I approve?"
Approve/Reject/Request Info buttons exist but are **hidden inside the collapsed card** — only visible after clicking the row to expand it. You created the LGT application for Chandrakant Wanare (id `a6e3c2a0…`, status=`pending`) and it's there, just not obvious how to act on it.

**Fix:** Surface quick action buttons directly on the **collapsed card row** for any submission where status is `pending` or `info_requested`, so admin can approve/reject/request-info/delete in one click without expanding. Keep the existing expanded view & inline reason textarea for Reject / Request Info (those still need a note).

### Issue 2 — Delete doesn't work (especially after approval)
Root cause confirmed via DB inspection: the `submissions` table has RLS policies for SELECT and UPDATE (admin) and INSERT (anyone), but **no DELETE policy exists**. The client `supabase.from('submissions').delete()` call silently returns 0 rows affected — no error is thrown, but nothing is deleted. The current code optimistically removes the row from local state, so it appears to work until refresh.

**Fix:** Add a DELETE RLS policy: `USING (is_admin(auth.uid()))`. Then the existing client delete will work for any submission regardless of status (pending, approved, rejected, info_requested).

### Bonus — auto-cleanup option (asking which behavior you want)

You also said "once applicant is approved and moved to seeker, application must remove entry from incoming applicant". Two ways to handle this:

- **Option A — Auto-delete on approve**: When `approve-application` edge function succeeds, also delete the submission row. Pro: queue stays clean automatically. Con: loses audit trail of where the seeker came from.
- **Option B — Hide approved by default + manual delete** (current "All / Pending / Approved / Rejected" filters already support this; just default the page to Pending). Pro: preserves history. Con: requires manual delete to fully remove.

I'd recommend **Option B + default filter to Pending** so approved entries don't clutter the queue but remain auditable, and admin can still bulk-delete via the Approved tab. But will go with Option A if you prefer.

## Plan

### 1. DB migration — add DELETE policy on `submissions`
```sql
CREATE POLICY "Admins can delete submissions"
ON public.submissions FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));
```

### 2. `src/pages/admin/ApplicationsPage.tsx` — surface actions on collapsed row
- Add a compact action bar to the right of each card header (always visible, not behind expand):
  - **Pending / Info Requested** rows: ✅ Approve · ❌ Reject · 📋 Request Info · 🗑 Delete
  - **Approved / Rejected** rows: 🗑 Delete only
- Keep the existing expanded-view inline textarea flow for Reject and Request Info (they need a note before submit).
- Approve from the collapsed row triggers the existing `updateStatus(id, 'approved')` immediately (no note needed).
- Replace optimistic local-only delete with a refetch so failures (if any future ones) surface correctly; also `toast.error(error.message)` instead of generic "Failed to delete".
- Default `statusFilter` to `'pending'` on first load so the queue shows actionable items first (user can switch to All).
- Show a small count chip "X approved hidden" when filter is `pending` and there are approved items, with a one-click "Show all" link.

### 3. (Pending your choice on Option A vs B)
- **If Option A**: edit `supabase/functions/approve-application/index.ts` to `await supabaseAdmin.from('submissions').delete().eq('id', submission_id)` after the existing update — instead of marking it approved.
- **If Option B**: no further code change — already covered by step 2 (default-to-Pending filter).

### Files touched
- New: `supabase/migrations/<timestamp>_add_submissions_delete_policy.sql`
- Edit: `src/pages/admin/ApplicationsPage.tsx`
- Maybe edit: `supabase/functions/approve-application/index.ts` (only if you pick Option A)

### Will NOT do
- Will not remove existing audit fields (`admin_notes`, `status` history) — preservation policy.
- Will not touch the 6 other already-approved rows in your DB; you can delete them yourself once the new policy + button work.

### Verification
1. Reload `/applications` → see action buttons directly on each pending row including the new Chandrakant LGT application.
2. Click ✅ Approve on his row → seeker created, toast confirms, row updates to Approved.
3. Click 🗑 Delete on any approved row → row disappears and **stays gone after refresh** (DB delete actually works).

**Question for you before I proceed: Option A (auto-delete on approve, no audit trail) or Option B (default to Pending filter, keep history, manual delete)?**
