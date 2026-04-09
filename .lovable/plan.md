

## User Session Tracking System — Implementation Plan

### Overview
Build a `user_sessions` table to track every login/logout, enforce single-device access for seekers, auto-expire inactive sessions, and provide an admin monitoring dashboard with real-time updates.

---

### Step 1: Database Migration — `user_sessions` table

Create table with columns:
- `id` (uuid PK), `user_id` (uuid, NOT NULL), `profile_id` (uuid), `role` (text)
- `status` (text: `active` | `closed`, default `active`)
- `login_at` (timestamptz, default now())
- `last_activity_at` (timestamptz, default now())
- `logout_at` (timestamptz, nullable)
- `logout_reason` (text: `manual` | `auto` | `forced` | `system`, nullable)
- `ip_address` (text, nullable), `user_agent` (text, nullable)
- `duration_seconds` (integer, nullable — computed on close)

RLS policies:
- Admin: full read/write on all rows
- Authenticated users: can INSERT own rows, UPDATE own rows (only `last_activity_at`, `status`, `logout_at`, `logout_reason`), SELECT own rows

Enable realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sessions;`

Create a DB function `close_inactive_sessions()` that sets `status='closed'`, `logout_reason='auto'`, `logout_at=now()`, `duration_seconds` for any active session where `last_activity_at < now() - interval '60 minutes'`. This can be called by the heartbeat edge function.

---

### Step 2: Edge Function — `session-heartbeat`

Single edge function handling 3 actions via POST body `{ action: 'start' | 'heartbeat' | 'end', session_id? }`:

- **start**: Close any existing active sessions for seekers (single-device enforcement), insert new session row, return `session_id`
- **heartbeat**: Update `last_activity_at` for the given `session_id`, also call `close_inactive_sessions()` to expire stale sessions
- **end**: Set `status='closed'`, `logout_reason='manual'`, compute `duration_seconds`

Uses service role key for DB access. Validates JWT in code. Extracts IP from headers and user-agent from request.

---

### Step 3: Login Flow Integration (`LoginPage.tsx` + `authStore.ts`)

After successful `signInWithPassword`:
1. Call `session-heartbeat` with `action: 'start'`
2. If response indicates a previous session was force-closed on another device, show a toast: "Previous session on another device was closed"
3. Store returned `session_id` in authStore state

On `logout()`:
1. Call `session-heartbeat` with `action: 'end'` before `signOut()`

---

### Step 4: Heartbeat Hook — `useSessionHeartbeat.ts`

A custom hook used in `AdminLayout` and `SeekerLayout`:
- Sends heartbeat every 3 minutes via `session-heartbeat` edge function
- Uses `setInterval` with cleanup
- Also listens to `visibilitychange` — send heartbeat on page becoming visible again
- If heartbeat response indicates session was closed (forced/auto), trigger logout and redirect to login with a message

---

### Step 5: Auto-Logout Detection in `AuthGuard.tsx`

On auth state change or heartbeat failure:
- If the user's session status is `closed` but they're still authenticated, force sign out
- Show toast: "Session expired due to inactivity" or "Logged in from another device"

---

### Step 6: Admin Active Sessions Dashboard — `ActiveSessionsPage.tsx`

New page at `/active-sessions` added to Admin sidebar under OPERATIONS:

**Currently Active Users** (real-time via Supabase Realtime subscription on `user_sessions`):
- Table: User Name, Role, Login Time, Last Activity, Live Duration (computed client-side from `login_at`), IP, Device
- Green dot indicator for active
- "Force Logout" button per row (updates status to `closed`, `logout_reason='forced'`)

**Session History** (below, with filters):
- Date range picker, user filter, status filter (active/closed), logout reason filter
- Table: User, Login, Logout, Duration, Reason, IP, Device
- Pagination

---

### Step 7: Single-Device Enforcement for Seekers

In the `start` action of the edge function:
- Query active sessions for the user
- If user role is `seeker` and an active session exists, close it with `logout_reason='forced'`
- Admins are exempt (can have multiple sessions)

On the client side of the displaced session:
- The heartbeat will get a "session closed" response → auto-logout with message "You've been logged in from another device"

---

### Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/...user_sessions.sql` | New table + function + realtime |
| `supabase/functions/session-heartbeat/index.ts` | New edge function |
| `src/hooks/useSessionHeartbeat.ts` | New heartbeat hook |
| `src/store/authStore.ts` | Add `sessionId` state, call start/end |
| `src/pages/LoginPage.tsx` | Call session start after login |
| `src/components/AdminLayout.tsx` | Add nav item + use heartbeat hook |
| `src/components/SeekerLayout.tsx` | Use heartbeat hook |
| `src/pages/admin/ActiveSessionsPage.tsx` | New admin page |
| `src/App.tsx` | Add route `/active-sessions` |

