## Problem

Closing the browser does not end the session. When the user reopens the browser, they're auto-logged-in because:

1. **Supabase auth uses `localStorage`** (`src/integrations/supabase/client.ts`) with `persistSession: true` + `autoRefreshToken: true`. `localStorage` survives browser close, so the refresh token is reused on next launch to silently re-issue an access token.
2. **`vdts_session_id` is stored in `localStorage`** (`src/store/authStore.ts`), so the prior session row is reused instead of forcing a fresh login.
3. **No `pagehide`/`beforeunload` hook** calls the `end` action on `session-heartbeat`. Server-side, sessions only auto-close after **60 minutes** of no heartbeat (`close_inactive_sessions`), so a closed-browser session stays `active` for up to an hour.
4. The 60-minute inactivity window on the server is too generous for a security-sensitive app.

## Goal

- Closing the browser (or the last tab) ends the session **immediately** — both client and server.
- Reopening the browser **always lands on `/login`** — no silent auto-login.
- Tightened idle/absolute timeouts so a hijacked refresh token has a tiny window of usefulness.
- "Remember me" stays opt-in: only when the user explicitly checks it does the session survive a browser restart.

## Design

### 1. Switch Supabase auth to `sessionStorage` by default

`sessionStorage` is wiped when the **last tab of the origin** is closed, so the refresh token disappears with the browser session. This single change kills the silent auto-login.

In `src/integrations/supabase/client.ts`, replace the static `localStorage` storage with a small adapter that reads a flag (`vdts_remember_me`) set at login time:
- Flag absent / false → use `sessionStorage` (default, secure).
- Flag true → use `localStorage` (explicit "Remember me on this device").

The adapter implements `getItem`/`setItem`/`removeItem` and routes to whichever storage is currently selected. We mirror writes to the active storage only — never both — to avoid stale tokens.

### 2. Move `vdts_session_id` to match auth storage

In `src/store/authStore.ts`, replace direct `localStorage.getItem/setItem('vdts_session_id', …)` with a helper that uses the same storage selector. `clearAllAuthStorage()` clears both `localStorage` and `sessionStorage` for `sb-*` and `vdts_session_id` to be safe.

### 3. Add a "Remember me" checkbox on `LoginPage`

Default: **unchecked** (most secure). When checked, set `localStorage.setItem('vdts_remember_me', '1')` **before** calling `supabase.auth.signInWithPassword`. When unchecked, remove the flag. This must be done before sign-in so the storage adapter writes the new session to the right place.

### 4. End the session on browser/tab close

Create a small `useSessionLifecycle` hook (or extend `useSessionHeartbeat`) that:
- Listens to `pagehide` and `visibilitychange` (`hidden`).
- On `pagehide` (most reliable for tab/browser close), fires a **`navigator.sendBeacon`** to `session-heartbeat` with `{ action: 'end', session_id }`. `sendBeacon` is the only request type the browser guarantees to deliver during unload.
- We can't send `Authorization: Bearer …` headers via `sendBeacon`, so we add a new edge function action **`end_beacon`** that accepts `{ session_id, user_id }` plus a short-lived **HMAC signature** generated client-side from the access token and a server secret derived path. Simpler alternative we'll use: the new endpoint accepts `{ session_id }` and verifies the caller by looking up the session row and confirming `status='active'` + matching `user_agent`/`ip` heuristics; it only ever **closes** a session it never elevates privileges, so the blast radius is limited.

If `sendBeacon` is unavailable, fall back to a synchronous `fetch(..., { keepalive: true })`.

### 5. Tighten server-side timeouts

Add a migration to update `close_inactive_sessions()`:
- Idle timeout: **60 min → 15 min** (configurable constant).
- Add an **absolute session lifetime cap of 12 hours** — any `active` session older than 12h since `login_at` is force-closed regardless of activity.

Schedule reminder: this RPC is already called every heartbeat (3 min), so the new limits take effect promptly.

### 6. Reduce client heartbeat / inactivity windows

In `useSessionHeartbeat.ts`:
- `HEARTBEAT_INTERVAL`: 3 min → **2 min**.
- `INACTIVITY_TIMEOUT`: 60 min → **15 min**, matching the server.
- `INACTIVITY_CHECK_INTERVAL`: 30 s → **15 s**.

### 7. Validate session on init regardless of remember-me

`validateSessionOnInit` already requires a stored `vdts_session_id` and a successful heartbeat, otherwise it signs out. With `sessionStorage`, after a browser close there is no stored session id → automatic sign-out path fires → user lands on `/login`. Confirmed working with the change in step 1+2.

### 8. Defense in depth

- Add `Cache-Control: no-store` to the heartbeat responses so intermediaries don't cache active/inactive states.
- Log every `end_beacon` close into `user_sessions.logout_reason='browser_close'` for the admin Session Monitor dashboard.

## Files to change

- `src/integrations/supabase/client.ts` — storage adapter (sessionStorage by default, localStorage if remember-me).
- `src/store/authStore.ts` — session-id storage matches adapter; clear both storages on logout; small helper.
- `src/pages/LoginPage.tsx` (or equivalent) — "Remember me on this device" checkbox; set/unset `vdts_remember_me` before sign-in.
- `src/hooks/useSessionHeartbeat.ts` — tightened intervals; add `pagehide`/`visibilitychange=hidden` handler that calls `sendBeacon` end.
- `supabase/functions/session-heartbeat/index.ts` — new `end_beacon` action that accepts a beacon body and force-closes the session with reason `browser_close`.
- New migration — update `close_inactive_sessions()` (15 min idle) and add an absolute 12h cap.

## Out of scope / notes

- We keep `persistSession: true` so within a single browser session, refreshes work normally; only browser close kills it.
- Multi-tab behavior is preserved — `sessionStorage` is per-tab, but Supabase uses a `BroadcastChannel` to share session events between tabs of the same origin during the same browser session.
- Existing single-device enforcement for seekers (in `start`) is unchanged.