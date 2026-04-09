

## Fix: Login Redirect Loop and Flickering

### Root Cause

The console shows **"Maximum update depth exceeded"** originating from LoginPage. The infinite loop happens because:

1. `handleLogin` calls `setAuth(user, profile)` which sets `isAuthenticated = true`
2. This triggers the `useEffect` redirect, which calls `navigate('/dashboard', { replace: true })`
3. But `handleLogin` hasn't finished yet — it also calls `navigate()` at the end
4. When `isLoggingIn` becomes `false` in `finally`, the useEffect re-evaluates and fires `navigate` again
5. React-router's `replace` triggers a re-render of LoginPage (still mounted during transition), causing an infinite loop

Additionally, the seeker-to-admin redirect happens because the `useEffect` fires based on `authProfile.role` before `handleLogin`'s own routing logic executes.

### Fix

**File: `src/pages/LoginPage.tsx`**

1. **Replace `isLoggingIn` state with a ref** — A ref doesn't trigger re-renders, so changing it won't cause the useEffect to re-evaluate. The useEffect checks the ref value directly.

2. **Remove `isLoggingIn` from useEffect dependencies** — Since it's a ref, it's not a dependency. The useEffect only runs when `isAuthenticated` or `authProfile` change.

3. **Set the ref to `true` before login and never set it back to `false`** — Once `handleLogin` starts, the useEffect redirect is permanently disabled for this component instance. The `handleLogin` function handles all navigation itself.

```text
Before (causes loop):
  setIsLoggingIn(true)  ← state change
  ...setAuth(...)       ← triggers useEffect
  ...navigate(...)      ← handleLogin navigates
  setIsLoggingIn(false) ← triggers useEffect AGAIN → navigate → loop

After (no loop):
  loggingInRef.current = true  ← no re-render
  ...setAuth(...)              ← triggers useEffect → ref is true → early return
  ...navigate(...)             ← only handleLogin navigates
```

### Files to Change

| File | Change |
|------|--------|
| `src/pages/LoginPage.tsx` | Replace `isLoggingIn` useState with useRef; remove from useEffect deps; remove `finally` reset |

