## Show seeker name + email instead of ID in Daily Reports log

The "Seeker" column in `/admin/daily-reports` currently shows a truncated UUID (`e2fb3a77…`). Replace it with the seeker's full name and email by joining `daily_progress_email_log` with `profiles`.

### Changes

**File: `src/pages/admin/AdminDailyReports.tsx`**

1. Update the `LogRow` interface to include an optional `profile` object: `{ full_name, email }`.
2. Update the `load()` query to embed profile data:
   ```ts
   .select("id, seeker_id, sent_date, status, error, created_at, profile:profiles!daily_progress_email_log_seeker_id_fkey(full_name, email)")
   ```
   If no FK exists between `daily_progress_email_log.seeker_id` and `profiles.id`, fall back to a second query: fetch all unique `seeker_id`s from logs, query `profiles` for `id, full_name, email`, then merge client-side into a `Map<seeker_id, profile>`.
3. Render the Seeker cell as two lines:
   - Bold: `full_name` (fallback to "Unknown")
   - Muted small: `email` (fallback to short UUID)

### Verification

I'll first check via `supabase--read_query` whether a FK exists between `daily_progress_email_log.seeker_id` and `profiles.id`. If yes → use the embed syntax (single query). If no → use the merge approach (two queries) to avoid PostgREST relationship errors.

No DB migration needed — purely a UI/query change.
