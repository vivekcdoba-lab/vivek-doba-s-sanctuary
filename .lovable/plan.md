

## Fix: Login Routing, Coach Role Support, and Flickering

### Problems Identified

1. **Seeker lands on admin page**: The `useEffect` redirect in LoginPage (line 41-46) checks `authProfile.role === 'admin'` and navigates to `/dashboard`. During login, `validateSessionOnInit` from `authStore.ts` can fire and set auth state before the LoginPage's `handleLogin` finishes routing — causing seekers to briefly get routed wrong, or the redirect `useEffect` to fire with stale state.

2. **Coach role not supported**: The `Profile` interface in `authStore.ts` only allows `'admin' | 'seeker'`. The `AuthGuard` `requiredRole` also only accepts `'admin' | 'seeker'`. Coaching routes require `requiredRole="admin"`, so only admins can access coaching — a user with `role='coach'` gets redirected to `/seeker/home`.

3. **Flickering**: Multiple auth state changes happen during login — `signInWithPassword` triggers `onAuthStateChange(SIGNED_IN)`, then `getSession()` runs `validateSessionOnInit`, plus LoginPage's own `setAuth`. Each state change re-renders the component tree.

### Solution

#### 1. Add `coach` to the role type everywhere
- **`src/store/authStore.ts`**: Change `Profile.role` from `'admin' | 'seeker'` to `'admin' | 'seeker' | 'coach'`
- **`src/components/AuthGuard.tsx`**: Change `requiredRole` to `'admin' | 'seeker' | 'coach'`. Update the role check so coaches can access coaching routes, admins can access everything, and seekers only access seeker routes.
- **`src/App.tsx`**: Change coaching routes from `requiredRole="admin"` to `requiredRole="coach"`. AuthGuard will allow both `coach` and `admin` roles.

#### 2. Fix LoginPage redirect logic
- The `useEffect` that redirects authenticated users should also handle `coach` role → navigate to `/coaching`
- In `handleLogin`, route based on the actual profile role from the database, not just admin vs other:
  - `admin` → route by selected tab (existing logic)
  - `coach` → `/coaching`
  - `seeker` → `/seeker/home`

#### 3. Fix flickering by preventing double state updates
- In `validateSessionOnInit`, skip validation if we're on the login page (check `window.location.pathname === '/login'`) — let LoginPage handle its own flow
- This prevents the race between `validateSessionOnInit` setting auth state and LoginPage's `handleLogin` doing the same

### Files to Change

| File | Changes |
|------|---------|
| `src/store/authStore.ts` | Add `'coach'` to Profile role type; skip init validation on login page |
| `src/components/AuthGuard.tsx` | Add `'coach'` to requiredRole; allow admin to pass all guards; allow coach to pass coach guard |
| `src/App.tsx` | Change coaching routes to `requiredRole="coach"` |
| `src/pages/LoginPage.tsx` | Add coach routing in useEffect redirect; ensure handleLogin coach routing works |

