# LGT Rename + Session Scheduling + Attendance Counter

## 1. LGT Application → "Information Gathering Session"

**Rename UI labels everywhere the LGT application is shown:**
- Admin sidebar entry "LGT Application (In-Person)" → **"LGT Application — Information Gathering Session"**
- Page heading on `/admin/apply-lgt` → same
- Status pill behaviour stays as today

**Auto-status for legacy submissions:**
A new database migration will:
- Insert a `lgt_applications` row (`status='submitted'`, `filled_by_role='seeker'`, `submitted_at = legacy created_at`, `form_data = legacy form_data`) for every seeker who has a `submissions` row of `form_type='lgt_application'` but no existing `lgt_applications` row.
- This makes the admin page show **Submitted** (green badge) for all old-form respondents — no more "Submitted (legacy)" greyed-out state.

The page UI is updated so that the legacy fallback only shows when no `lgt_applications` row exists (it now will, after migration). Legacy banner removed.

## 2. Count LGT as Session #1

The Information Gathering Session is the first session and must count toward the seeker's `sessions_attended`.

Two changes:
- A new helper view / counter logic in `useFeeStructure` and the seeker progress widgets adds `+1` to attended-session totals when the seeker has an `lgt_applications` row with `status='submitted'`.
- Seeker's session list (Sessions page, Session Analytics) shows a synthetic "Session 0 — LGT Information Gathering" entry (read-only) sourced from `lgt_applications.submitted_at`.

No new table needed — purely a derived count.

## 3. "Schedule Next Session" button in session notes form

In both the **admin** SessionsPage post-session form and the **coach** session notes form:
- Next to the existing "Next Session Time" free-text input, add a **"📅 Schedule Now"** button.
- Clicking it opens the existing `Schedule Session` dialog (`showSchedule=true`), prefilled with:
  - `seeker_id` = current session's seeker
  - `coach_id` = current session's coach
  - `course_id` = current session's course
  - `session_number` = current + 1
  - Date/time defaults to 7 days after current session
- All existing scheduling logic (recurrence, invites, etc.) is reused — no duplicate code.

## 4. Attendance-aware remaining-session counter

**Rules** (per user requirement):
| Attendance value | Counts toward attended? | Reduces remaining? |
|---|---|---|
| `present` | Yes | Yes |
| `no_show` | Yes (default) | Yes |
| `excused` (admin/coach marks "Strong reason accepted") | No | No |
| `absent` / null / cancelled | No | No |

**UI changes:**
- Admin & coach session detail/notes get an **"Attendance"** dropdown with: Present / No-show / Excused (with reason). Currently sessions only get attendance via analytics imports — a small inline control is added to the session row actions.
- A new helper `getAttendedSessionsCount(seekerId)` filters on `attendance IN ('present','no_show')`.
- `SeekerProgressCharts` and the Fee Structure card use this helper to show **"Remaining: total − attended"**.
- Adds `+1` for the LGT Information Gathering session when present.

**Migration:** none required for attendance — already a free-text column. We standardise the new value `excused` and document it.

## Technical Details

**Files to edit:**
- `src/components/AdminLayout.tsx` — sidebar label
- `src/pages/admin/AdminApplyLgt.tsx` — page heading, drop "(legacy)" suffix
- `src/pages/admin/SessionsPage.tsx` — add "Schedule Now" button beside Next Session Time; add Attendance picker
- `src/pages/coaching/CoachingSessionNotes.tsx` — same Schedule Now button + Attendance picker
- `src/hooks/useFeeStructure.ts` (or new `src/hooks/useSeekerSessionCount.ts`) — derived counter
- `src/pages/seeker/SeekerProgressCharts.tsx` — use new counter, include LGT
- New migration: backfill `lgt_applications` from `submissions`

**Migration SQL (preview):**
```sql
INSERT INTO public.lgt_applications (seeker_id, status, filled_by_role, submitted_at, form_data, version)
SELECT p.id, 'submitted', 'seeker', s.created_at, s.form_data, 1
FROM public.submissions s
JOIN public.profiles p ON lower(p.email) = lower(s.email)
WHERE s.form_type = 'lgt_application'
  AND NOT EXISTS (SELECT 1 FROM public.lgt_applications la WHERE la.seeker_id = p.id)
ON CONFLICT (seeker_id) DO NOTHING;
```

**No destructive changes** — old `submissions` rows untouched (preservation policy). Pure additive backfill.

## Out of Scope

- Editing the LGT form fields themselves
- Changing how recurring sessions are scheduled
- Changing how fee structures compute totals (only the *displayed* remaining count is enhanced)
