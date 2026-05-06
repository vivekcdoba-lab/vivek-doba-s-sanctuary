# P0 Security Fixes — Top 2 (this week)

Fix the two high-severity findings from the latest audit. Both are quick, low-risk changes.

## 1. Enable Leaked Password Protection (HIBP)

**Problem:** Anyone can register with a known-breached password (e.g. `Password123!`), making the app trivially vulnerable to credential stuffing.

**Fix:** Toggle `password_hibp_enabled = true` on the Cloud Auth configuration. This is a one-call change to the auth settings — Supabase will then check every signup and password change against the Have I Been Pwned database and reject compromised passwords.

**Impact on users:** None for existing accounts. New signups and password resets that try to use a breached password will see a clear error and must pick a stronger one.

## 2. Remove `sessions` table from Realtime publication

**Problem:** `public.sessions` is currently in the `supabase_realtime` publication. Postgres logical replication broadcasts every row change at the table level *before* RLS is evaluated, so an authenticated seeker subscribing to the channel could receive payloads containing another seeker's coaching notes, scores, and private feedback. The client-side `filter: id=eq.<x>` only narrows what *that* client renders — it does not stop the row from being shipped to other listeners.

**Audit of current usage:** Only one place in the entire codebase subscribes to realtime changes on `sessions`:

- `src/pages/admin/SessionReviewPage.tsx` — admin-only route, listens for UPDATE on a single session id while the admin is reviewing it.

Every other reference to `sessions` uses standard `select` / `update` queries (no realtime), so removing the table from the publication is safe.

**Fix (migration):**

1. Drop `public.sessions` from the `supabase_realtime` publication.
2. Replace the realtime subscription on `SessionReviewPage.tsx` with a lightweight polling refetch (every 5 s while the page is open) so admins still see updates without the table being broadcast at all.

```text
sessions (in publication)  ──►  every authenticated client receives every row change
                                                │
                                                ▼ (RLS only filters reads, not realtime payloads)
                                         data leak risk

sessions (NOT in publication)  ──►  no broadcast; admin page polls every 5s for updates
```

## Technical changes

- **Auth config**: call `configure_auth` with `password_hibp_enabled: true`.
- **Migration** `…_drop_sessions_from_realtime.sql`:
  ```sql
  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'sessions'
    ) THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.sessions';
    END IF;
  END $$;
  ```
- **`src/pages/admin/SessionReviewPage.tsx`**: remove the `supabase.channel(...).on('postgres_changes', { table: 'sessions', ... })` block; add a `useQuery` `refetchInterval: 5000` (or a `setInterval` calling the existing fetch) scoped to the open review session. Admin-only impact, no UX regression.
- **Mark findings fixed** in the security scanner via `manage_security_finding` (HIBP + sessions realtime exposure).
- **Update `@security-memory`**: note that `sessions` is intentionally excluded from realtime; admin review uses polling instead.
- **Update `src/docs/operation/_generated/security-posture.md`**: remove the "manual one-time setup: enable HIBP" line and add a short note that `sessions` is not realtime-published.

## Out of scope (covered by separate P1/P2 plans)

- REVOKE EXECUTE on `decrypt_field`, `_current_dek`, `get_submission_password`, etc.
- `requireAdminOrCron` audit on cron edge functions.
- Partial unique index on `encryption_keys (is_current)`.
- Avatars bucket listing tightening.
- Recovery runbook + auth anomaly alerts.
- CSP nonce migration, esm.sh pinning, Mermaid escapeHtml.

Approve to proceed and I'll apply both fixes.
