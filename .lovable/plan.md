## Goal

Discontinue public access to `/apply-lgt`. Keep the page (preservation policy) but make it accessible **only to admins**, repositioned inside the Admin section so admins can fill in seeker details in person.

## Changes

### 1. Move route under Admin (protected)

`src/App.tsx`
- Remove the public route: `<Route path="/apply-lgt" element={<ApplyLGT />} />`
- Add an admin-protected route at a new admin path:
  ```
  <Route path="/admin/apply-lgt" element={<AuthGuard requiredRole="admin"><AdminLayout /></AuthGuard>}>
    <Route index element={<ApplyLGT />} />
  </Route>
  ```
  (Following the same wrapping pattern used by other admin pages.)
- Keep the `ApplyLGT` import and component file untouched (preservation).

### 2. Admin sidebar entry

`src/components/AdminLayout.tsx`
- Inside the `ENROLLMENTS` group (line 51-58), add a new item right after "New Enrollment":
  ```
  { icon: ClipboardList, label: 'LGT Application (In-Person)', path: '/admin/apply-lgt' },
  ```

### 3. Remove public-facing links

- `src/pages/seo/_SeoLayout.tsx` (line 121-129, `SeoCTA`): Remove the "Apply for LGT Program" CTA card. Restructure the remaining grid from `sm:grid-cols-3` to `sm:grid-cols-2` so the two surviving CTAs (Discovery Call, Workshop) stay balanced.
- `src/pages/seo/BusinessCoaching.tsx` (line 77): Replace the `<Link to="/apply-lgt">…</Link>` with plain text `Life's Golden Triangle program` (keep wording intact, drop the link).
- `src/pages/LoginPage.tsx` (line 333-340): Remove the entire "Apply for LGT Program" public action card from the login page.

### 4. SEO / sitemap cleanup

- `public/sitemap.xml` (line 21): Remove the `<url><loc>https://vivekdoba.com/apply-lgt</loc>…</url>` entry so search engines stop indexing it.

### 5. Preserve existing admin entry point

`src/pages/admin/AdminDetailedIntake.tsx` already imports and renders `<ApplyLGT adminMode />` — left unchanged. The new sidebar link is an additional in-person fill flow (without a pre-existing submissionId), so admins get both:
- `/admin/detailed-intake/:id` — edit an existing submission
- `/admin/apply-lgt` — start a fresh in-person intake

## Result

- Public users hitting `/apply-lgt` directly → redirected to `/login` (no longer a defined route, falls to NotFound; if you'd like, we can add a redirect to `/login` instead — let me know).
- Homepage, SEO pages, login page, and sitemap no longer surface the LGT application form publicly.
- Admin sidebar → ENROLLMENTS → "LGT Application (In-Person)" opens the form for admin-driven entry.

## Files touched

- `src/App.tsx` (route move)
- `src/components/AdminLayout.tsx` (sidebar item)
- `src/pages/seo/_SeoLayout.tsx` (CTA removal)
- `src/pages/seo/BusinessCoaching.tsx` (delink)
- `src/pages/LoginPage.tsx` (card removal)
- `public/sitemap.xml` (URL removal)

No DB changes. No existing components/pages deleted.
