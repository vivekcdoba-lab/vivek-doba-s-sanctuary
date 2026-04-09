

## Fix: Auto-Logout After 60 Minutes Inactivity

### Problem
The heartbeat sends every 3 minutes and the backend marks sessions as inactive after 60 minutes. However, two critical issues exist:

1. **Supabase auth session persists**: Even when the heartbeat detects inactivity and calls `logout()`, the Supabase auth token remains valid (it has its own JWT expiry, typically 1 hour). On page reload or revisit, `onAuthStateChange` fires with the still-valid Supabase session, re-authenticating the user without checking if their `user_session` is still active.

2. **No session validation on app init**: When the app loads, `authStore` checks `supabase.auth.getSession()` and blindly trusts it. It never verifies if there's an active `user_session` record — so a user whose session was auto-closed can still browse freely.

3. **No localStorage/cache clearing**: After forced logout, cached auth tokens in localStorage allow seamless re-entry.

### Solution

#### 1. Clear all auth storage on logout (`authStore.ts`)
In the `logout()` function, after `supabase.auth.signOut()`, explicitly clear localStorage keys used by Supabase (`sb-*` keys) to prevent stale token reuse.

#### 2. Validate user_session on app initialization (`authStore.ts`)
After `getSession()` returns a valid Supabase session, call the `session-heartbeat` edge function with `action: 'heartbeat'` using the stored `sessionId` (from localStorage). If no `sessionId` exists or the session is closed, force sign out immediately.

#### 3. Persist `sessionId` in localStorage (`authStore.ts`)
Currently `sessionId` is only in Zustand memory — it's lost on page refresh. Store it in `localStorage` so it survives page reloads and can be validated on init.

#### 4. Add inactivity timer on the client side (`useSessionHeartbeat.ts`)
Add a client-side 60-minute inactivity detector using mouse/keyboard/touch events. When 60 minutes pass with no interaction, proactively call `logout()`, clear cache, and redirect to `/login` — don't wait for the next heartbeat cycle.

#### 5. Force full sign-out in AuthGuard (`AuthGuard.tsx`)
Add a check: if `isAuthenticated` is true but `sessionId` is null, force logout. This catches edge cases where Supabase token is valid but no tracked session exists.

### Files to Modify

| File | Changes |
|------|---------|
| `src/store/authStore.ts` | Persist `sessionId` in localStorage; clear all `sb-*` keys on logout; validate session on init |
| `src/hooks/useSessionHeartbeat.ts` | Add client-side 60-min inactivity timer with user activity listeners |
| `src/components/AuthGuard.tsx` | Check for valid `sessionId`; force logout if missing |

### Technical Details

**Inactivity timer** — Track `lastActivity` timestamp, update on `mousemove`, `keydown`, `click`, `touchstart`. Every 30 seconds, check if `Date.now() - lastActivity > 60 * 60 * 1000`. If so, trigger logout + clear + redirect.

**localStorage session persistence** — On `setSessionId()`, write to `localStorage.setItem('vdts_session_id', id)`. On init, read it back. On logout, remove it along with all `sb-*` keys.

**Init validation flow**:
```text
App loads → getSession() → valid Supabase token?
  → Yes → read sessionId from localStorage
    → exists? → heartbeat check → active? → allow
                                → closed? → signOut + clear + redirect
    → no sessionId? → signOut + clear + redirect
  → No → show login
```

