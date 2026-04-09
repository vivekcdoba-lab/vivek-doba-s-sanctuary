

## Plan: Loading Skeleton After Login + Verify Session Monitoring + Inactivity Logout

### 1. Add Loading Skeleton During Post-Login Redirect

**Problem**: After clicking "Sign In", the user sees a brief flash or blank state while the session-heartbeat call completes and navigation happens.

**Fix in `src/pages/LoginPage.tsx`**:
- Add a `redirecting` state that becomes `true` after successful auth + session start, before `navigate()` is called
- When `redirecting` is true, render a full-screen skeleton/loading overlay instead of the login form
- This gives smooth visual feedback during the ~500ms between auth completion and route mount

**Fix in `src/components/AuthGuard.tsx`**:
- Replace the plain `Loader2` spinner with a proper skeleton layout (import `SkeletonDashboard` from existing component) for a more polished loading state

### 2. Verify Active Session Monitoring

**File: `src/pages/admin/ActiveSessionsPage.tsx`** — already exists with:
- Real-time active user count
- Live duration timers
- Session history with filters
- Force logout capability

No code changes needed — will verify it works via the admin dashboard after login.

### 3. Verify Inactivity Auto-Logout

**File: `src/hooks/useSessionHeartbeat.ts`** — already implements:
- 60-minute inactivity timeout with 30-second check interval
- Activity tracking via mouse/keyboard/touch/scroll events
- `forceLogout()` that calls `logout()` (clears all storage) and redirects to `/login`

No code changes needed — the implementation is correct.

### Files to Change

| File | Change |
|------|--------|
| `src/pages/LoginPage.tsx` | Add `redirecting` state; show skeleton overlay when redirecting |
| `src/components/AuthGuard.tsx` | Replace spinner with `SkeletonDashboard` for better loading UX |

### Technical Details

**LoginPage redirecting state flow**:
```text
User clicks Sign In → loading=true (button shows spinner)
→ Auth succeeds → session starts → redirecting=true
→ Full-screen skeleton renders (covers login form)
→ navigate() fires → AuthGuard loading skeleton → dashboard renders
```

This creates a seamless transition: login form → skeleton → dashboard, with no flicker or blank screens.

