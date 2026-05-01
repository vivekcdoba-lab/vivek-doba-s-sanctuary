# Plan: Gate Weekly Review by Next Session Date

Make `/seeker/weekly-review` editable **only on the day before the seeker's next scheduled session**. On all other days, the form is read-only with a clear banner explaining when it unlocks. Also persist submitted reviews so prior entries can be displayed in read-only mode.

## Behavior

- **Editable window**: The calendar day immediately before the next upcoming session (date in seeker's local timezone). Example: next session on Wed → form editable all day Tue.
- **Read-only mode (default)**:
  - All inputs (stars, text fields, textareas, sliders) disabled.
  - Submit button hidden/disabled.
  - Banner at top: "🔒 Read-only — Weekly Review unlocks on {date} (one day before your next session on {sessionDate})."
  - If a previously-submitted review exists for the current week, show its values.
  - If no upcoming session is scheduled: "No upcoming session scheduled. Weekly Review will unlock the day before your next session."
- **Editable mode**:
  - Green banner: "✏️ Weekly Review is open today — your next session is tomorrow ({date})."
  - Submit enabled; on submit, persist to DB.

## Data Source

Read next session from existing `sessions` table:
```ts
supabase.from('sessions')
  .select('id, date, start_time, session_name')
  .eq('seeker_id', profile.id)
  .in('status', ['scheduled', 'confirmed', 'in_progress'])
  .gte('date', todayISO)
  .order('date').order('start_time')
  .limit(1)
```

Compare `sessionDate - 1 day === today` to determine the editable flag.

## Persistence

Add a `weekly_reviews` table so submissions are saved (currently only toasts):

```sql
create table public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null,
  session_id uuid references public.sessions(id) on delete set null,
  week_start date not null,
  week_end date not null,
  rating int check (rating between 1 and 5),
  wins jsonb default '[]'::jsonb,
  challenge text,
  learning text,
  wheel_scores jsonb default '[]'::jsonb,
  next_goals text,
  need_from_coach text,
  gratitude text,
  submitted_at timestamptz default now(),
  unique (seeker_id, week_start)
);
alter table public.weekly_reviews enable row level security;
```

RLS policies:
- Seeker can `select`/`insert`/`update` their own rows (`seeker_id = auth.uid()`-mapped via profile).
- Admin full access via `is_admin(auth.uid())`.
- Coach read access for assigned seekers (mirror existing pattern used for journals).

## UI Changes (`src/pages/seeker/SeekerWeeklyReview.tsx`)

1. Replace hard-coded `now = new Date(2025, 2, 31)` with real `new Date()`.
2. Fetch next session via `useQuery`.
3. Compute `isEditable = nextSession && diffInCalendarDays(parseISO(nextSession.date), today) === 1`.
4. Fetch existing review for current week (by `week_start`) and prefill state.
5. Add `disabled={!isEditable}` + `readOnly` to all inputs; wrap in a fieldset for cleanliness.
6. Top banner reflects state (locked / unlocks-on / open-today / no-session).
7. Submit handler upserts to `weekly_reviews` instead of just toasting.

## Edge Cases

- Multiple sessions same week → use the **earliest upcoming** session for the unlock calculation.
- Already-submitted review on the editable day → still editable (allows updates) until the session date arrives.
- Session rescheduled after submission → previous review remains visible read-only.
- Timezone: use seeker local date for "today" and "session date" comparison (date-only, no time).

## Files

- **Edit**: `src/pages/seeker/SeekerWeeklyReview.tsx`
- **New migration**: `weekly_reviews` table + RLS policies
- **Auto-updated**: `src/integrations/supabase/types.ts`

No removals — purely additive per preservation policy.
