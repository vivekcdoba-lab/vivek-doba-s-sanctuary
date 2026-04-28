# Fix: "Open Agreement" redirects admin to Dashboard

## Root cause

From `Seekers → Documents`, the "Open Agreement →" link in `src/pages/admin/SeekerDetailPage.tsx` (line 848) navigates to:

```
/coaching/premium-agreement/:seekerId
```

In `src/App.tsx` (line 503), this route lives inside a route group guarded by:

```tsx
<AuthGuard requiredRole="coach"><CoachingLayout /></AuthGuard>
```

`AuthGuard` only lets a regular admin through `coach` routes when `profile.is_also_coach === true`. The current admin (Chandrakant) does not have that flag, so the guard redirects them to `/dashboard`. That is why clicking "Open Agreement" silently bounces back to the dashboard with no page rendered.

Super admins are unaffected (they bypass the guard); regular admins are blocked.

## Fix

Make the Premium Agreement page reachable by admins as well, without breaking coach access or the `CoachingLayout` chrome that the page expects.

### Approach

Mount the same `PremiumAgreementPage` at an admin-scoped route in addition to the existing coaching route, using `AdminLayout` + `requiredRole="admin"`.

Edits:

1. **`src/App.tsx`** — inside the existing admin route group (the block guarded by `<AuthGuard requiredRole="admin"><AdminLayout /></AuthGuard>`), add:
   ```tsx
   <Route
     path="/seekers/:seekerId/premium-agreement"
     element={<PremiumAgreementPage />}
   />
   ```
   Keep the existing `/coaching/premium-agreement/:seekerId` route as-is so coaches keep working.

2. **`src/pages/admin/SeekerDetailPage.tsx`** (line ~848) — change the "Open Agreement →" link target from
   ```
   /coaching/premium-agreement/${seeker.id}
   ```
   to
   ```
   /seekers/${seeker.id}/premium-agreement
   ```
   so admins navigate within their own layout/guard.

3. **`src/pages/coaching/PremiumAgreementPage.tsx`** — small adjustment: the page reads `useParams<{ seekerId: string }>()`. Both routes use the `:seekerId` param name, so no code change is needed there. The existing back button (`navigate(-1)`) keeps working from either entry point.

### Why not just flip the guard?

Loosening the `coach` route group to admins would expose every coaching-only page to admins, which is a broader change than needed and would conflict with current role separation. Mounting the agreement page under both layouts is minimal and safe.

## Verification after implementation

- As regular admin: from Seekers → open a seeker → Documents tab → click "Open Agreement →". Page should render the Premium Agreement (no redirect to `/dashboard`).
- As coach: existing `/coaching/premium-agreement/:seekerId` route continues to work.
- As super admin: both URLs continue to work.
