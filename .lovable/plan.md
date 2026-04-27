## Goal

1. Send Chandrakant Wanare's LGT PDF report to `crwanare@gmail.com` (and admins) right now from `/admin/apply-lgt`.
2. Make report regeneration + email automatic on every edit/update of LGT data, with the latest copy reflected in the seeker's profile.

## Approach

### Part 1 — One-click "Email Report" on `/admin/apply-lgt`

For every row whose status is `submitted`, add a 📧 **Email Report** action button.

Click handler:
1. Fetch the `lgt_applications` row (form_data) for that seeker.
2. Mount `<LgtReport />` off-screen with that data + seeker info.
3. Run existing `lgtPdfExport.ts` to generate PDF base64.
4. Call existing `send-lgt-report` edge function → emails seeker + all admins (Chandrakant gets it on `crwanare@gmail.com`).
5. Toast "Report emailed".

Reuses 100% of existing report + PDF + email code. No DB or edge function changes.

### Part 2 — Auto-send on every edit + keep seeker profile in sync

**Trigger points** (every time LGT data is saved):
- `/apply-lgt` (admin filling for a seeker)
- `/seekers/lgt/:token` (seeker filling via invite link)
- Any future edit of an already-submitted application from `/admin/apply-lgt` row → "Edit & Resend"

**On every save:**
1. Upsert the new `form_data` into `lgt_applications` (existing logic).
2. Bump `submitted_at = now()` and increment a new `version` integer column to track revisions.
3. Auto-render `<LgtReport />` off-screen → generate PDF → call `send-lgt-report`.
4. Email subject becomes: `👑 LGT Report (Updated v{n}) — {seeker name}` so admins can see it's a revision.
5. Toast confirms recipients.

**Profile reflection:**
- The "LGT Application 👑" tab in `/admin/seekers/<id>` already reads from `lgt_applications` — it will automatically show the latest data after each edit, no extra wiring needed.
- Add a small "Last updated: <date> · v{n}" badge on the tab and on the AdminApplyLgt row.

**Edit-existing flow on `/admin/apply-lgt`:**
- Submitted rows get a second action: ✏️ **Edit** → opens `/apply-lgt?seekerId=…&edit=1` pre-filled with current `form_data`.
- On save, runs the auto-send pipeline above.

### Schema change (small)

Add to `lgt_applications`:
- `version int not null default 1`
- `last_emailed_at timestamptz`

Migration only — no data changes. Increment `version` on each re-submit via the upsert handler (client-side, simple `version + 1`).

### Files to edit / create

- `src/pages/admin/AdminApplyLgt.tsx` — add 📧 Email Report + ✏️ Edit buttons for submitted rows; show version + last-updated; shared `generateAndEmailReport(seekerId)` helper.
- `src/pages/ApplyLGT.tsx` — support `?seekerId=…&edit=1` to load existing data; on save, increment version + auto-trigger email pipeline.
- `src/pages/SeekerLgtForm.tsx` — already auto-emails after submit; just add version increment.
- `src/pages/admin/SeekerDetailPage.tsx` (LGT tab) — show version + "Last emailed" timestamp.
- `supabase/migrations/<new>.sql` — add `version`, `last_emailed_at` columns.
- No edge function changes — `send-lgt-report` already supports admin-mode and emails seeker + all admins.

## Immediate result for Chandrakant

After Part 1 ships, you click 📧 next to Chandrakant's row → PDF report is emailed to `crwanare@gmail.com` plus all admins within seconds. Future edits auto-send updated reports without you clicking anything.