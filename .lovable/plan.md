## Goal

Two related changes:
1. **Enhance session invite emails** with rich, mode-specific content (in-person Google Maps + parking instructions, online Zoom link), plus reminders for assignments/assessments/activities and meeting prep checklist.
2. **Standardize date format** across the entire app and all outgoing emails to `DD-Month-YYYY` (e.g., `30-April-2026`).

---

## Part 1: Session invite email enhancements

**File:** `supabase/functions/send-session-invite/index.ts`

Replace the current minimal HTML with a richer template that branches on `session.location_type`:

### In-Person block (when `location_type === 'in_person'`)
- **Address / Map link:** `https://maps.app.goo.gl/eAj5thQ2aSDJs4827` (rendered as a "📍 Open in Google Maps" button)
- **Parking instructions** (bilingual EN/HI based on seeker `preferred_language`):
  - Roadside parking is free — pick the best available spot
  - Do NOT park in front of gates
  - Do NOT park in "No Parking" zones or near "No Parking" boards

### Online block (when `location_type === 'online'`)
- Prominent **"🎥 Join Zoom Meeting"** CTA button using `session.meeting_link` (falls back to the default Zoom link if missing)
- Meeting ID / passcode hint extracted from URL when possible

### Common sections (both modes)
- Friendly greeting using seeker's first name + warm opening line
- Session date (in `DD-Month-YYYY`), time, duration, coach name
- **Action items** section listing pending items pulled from DB:
  - Pending assignments → link `https://vivekdoba.com/seeker/assignments`
  - Pending assessments → link `https://vivekdoba.com/seeker/assessments`
  - Pending activities/worksheets → link `https://vivekdoba.com/seeker/activities`
  - Each with a clear "Complete now" CTA
- **Pre-meeting checklist:**
  - Prepare your questions in advance
  - Bring all your notebooks/journals (for in-person) or have them ready beside you (for online)
  - Quiet, distraction-free space
  - Carry pen + water
- **Activity report link:** `https://vivekdoba.com/seeker/reports` (remaining activities & progress)
- Calendar `.ics` download CTA (existing)
- Closing signature: "🙏 Vivek Doba Training Solutions"

### Data fetched (new query)
Add a count query before composing email:
```ts
const { count: pendingAssignments } = await supabase
  .from('assignments').select('*', { count: 'exact', head: true })
  .eq('seeker_id', seeker.id)
  .in('status', ['pending', 'assigned', 'in_progress']);
```
(Same pattern for assessments / pending worksheets where applicable.)

### Bilingual support
Read `seeker.preferred_language` (`en` | `hi` | `mr`); render labels accordingly. Keep English fallback.

---

## Part 2: Global date format standardization → `DD-Month-YYYY`

### New shared formatter
Create **`src/lib/dateFormat.ts`**:
```ts
export const MONTHS_EN = ['January','February',...,'December'];
export const MONTHS_HI = ['जनवरी', ...];
export const MONTHS_MR = ['जानेवारी', ...];

export function formatDateDMY(input: string | Date | null | undefined, lang: 'en'|'hi'|'mr' = 'en'): string {
  // returns "30-April-2026" / "30-अप्रैल-2026" / "30-एप्रिल-2026"
}
```

Mirror in edge functions: **`supabase/functions/_shared/date-format.ts`** (Deno-compatible copy).

### Replacement strategy
Run a sweep across `src/` and `supabase/functions/` for date rendering and replace with `formatDateDMY`. Targets include (non-exhaustive — full grep sweep during implementation):
- `toLocaleDateString(...)` calls on session/event/birthday/anniversary/payment dates
- `format(date, 'yyyy-MM-dd')` / `'PPP'` / `'dd MMM yyyy'` patterns from `date-fns`
- Hardcoded `${session.date}` in email HTML
- Date columns in tables (admin sessions list, payments, leads, enrollments, reports)

Specific high-impact files (verified via earlier exploration):
- `src/pages/coaching/CoachSchedule.tsx`
- `src/pages/admin/SeekerDetailPage.tsx`
- `src/pages/seeker/SeekerBookmarks.tsx`
- `src/data/mockData.ts` (display strings only, leave ISO data intact)
- All edge functions sending email: `send-session-invite`, `send-daily-seeker-reports`, `send-lgt-invite`, `send-lgt-report`, `send-notification`, `daily-session-report`, `approve-application`, `request-document-signature`, `resend-document-signature`

**Rule:** Only the **displayed** string changes. Database storage, API payloads, ICS file dates, `<input type="date">` values, and sort keys remain ISO `YYYY-MM-DD`.

---

## Technical notes

- No DB migration required.
- Edge function `send-session-invite` will be redeployed automatically.
- Bilingual month names follow existing localization memory (English, Hindi, Marathi).
- The Google Maps link is hardcoded as a constant `IN_PERSON_VENUE_MAP_URL` at top of edge function for easy future updates.
- Calendar `.ics` `LOCATION` field for in-person sessions will include the maps URL so calendar apps render it as a clickable address.

---

## Out of scope

- No changes to scheduling logic, RLS, or DB schema.
- No new pages/routes.
- Existing "Only Add and Enhance" preservation rule respected — nothing removed.
