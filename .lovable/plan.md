

## Fix: Login Screen Flickering

### Root Cause

When the login page loads, **three separate async events** all trigger state changes that cause re-renders:

1. `getSession()` resolves → calls `setAuth(null, null)` → sets `loading: false` → re-render
2. `onAuthStateChange` fires with no user → calls `setAuth(null, null)` → re-render  
3. If user was previously logged in, `onAuthStateChange` may fire `SIGNED_IN` before `getSession` completes, causing additional state flips

Each `setAuth` call changes `loading` from `true` → `false`, and potentially flips `isAuthenticated`, causing the login form to mount/unmount/remount.

### Solution

**File: `src/store/authStore.ts`**

1. **Gate the `onAuthStateChange` listener** — Only process events after `getSession()` has completed. Add an `initialized` flag that starts `false` and is set `true` after `getSession()` resolves. The listener ignores events until initialized, preventing the double-fire.

2. **On login page, set loading false immediately** — Instead of waiting for `getSession()` to finish async work, detect `/login` path and set `loading: false` synchronously in the store initializer, so the login page renders instantly without any async flicker.

### Changes

| File | Change |
|------|--------|
| `src/store/authStore.ts` | Add `initialized` flag; gate `onAuthStateChange` behind it; set `loading: false` immediately for `/login` path before any async work |

### Technical Detail

```text
Current flow (causes 2-3 re-renders):
  Store init: loading=true
  → onAuthStateChange fires → setAuth(null,null) → loading=false (render 1)
  → getSession resolves → setAuth(null,null) → loading=false (render 2)

Fixed flow (single render):
  Store init: loading=true
  → getSession resolves → sets initialized=true → setAuth(null,null) → loading=false (render 1)
  → onAuthStateChange fires but initialized already, no redundant call
  
  On /login specifically:
  → loading set to false immediately, no async wait needed
```

