

## Goal
Lock down signature documents to admins only, harden profile RLS so only admins change roles, fix the `/admin/seekers` 404 and Settings banner cleanup, expand upload form (languages + Category LOV), and enrich the Resources page (delete with confirm, source/type badges, PDF thumbnail, type/language filters).

---

## Part 1 — Security RLS hardening (DB migration)

**Signature documents — admin-only**
- Drop `Coaches read document signatures` on `document_signatures`.
- Drop `Coaches view their seekers' requests` on `signature_requests`.
- Keep: admin full access + seekers reading their own. Coaches lose visibility entirely.

**Profile updates — admin-only role/promotion**
- Drop existing `Users can update own profile (role locked by trigger)` and `Restrict role changes to admins` policies on `profiles`.
- Recreate two clean policies:
  - `Admins update any profile` — `USING is_admin(auth.uid()) WITH CHECK is_admin(auth.uid())`.
  - `Users update own non-role fields` — `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`. The existing `prevent_role_escalation` and `prevent_admin_level_escalation` triggers already block role/admin_level changes by non-admins, so seekers/coaches can edit their own profile data but cannot promote.
- Net effect: coaches and seekers can never update another user, and cannot change their own role or admin_level.

---

## Part 2 — `/admin/seekers` 404 fix
The route is `/seekers` (admin-only via `AuthGuard`). The Settings banner links to `/admin/seekers` (doesn't exist). Fix by:
- Updating the Settings banner link to `/seekers` (and removing the banner entirely per next item).
- Adding a redirect route in `src/App.tsx`: `/admin/seekers` → `/seekers` so any external/bookmarked link works.
- Audit other references (`src/pages/admin/Dashboard.tsx`, `SettingsPage.tsx`) and normalise to `/seekers`.

---

## Part 3 — `/settings` banner removal
File: `src/pages/admin/SettingsPage.tsx`
- Remove the entire "Need to send a document for signature?" banner block (lines ~213–230) including its "Document Library" / "Find a Seeker" buttons and the `FileSignature`/`Users` imports if no longer used. The Documents & Signatures quick-action card on the admin Dashboard already provides this entry point.

---

## Part 4 — `/admin/upload-resource` enhancements
File: `src/pages/admin/AdminUploadResource.tsx`
- **Languages**: extend the language `<Select>` to include `Hindi`, `English`, `Marathi (MR)`, `Hinglish (HG)`, `Mix Language (MIX)`. Keep stored values short codes (`HI`, `EN`, `MR`, `HG`, `MIX`).
- **Category LOV**: replace the free-text Category `<Input>` with a `<Select>` populated from existing distinct categories already in `learning_content` (TanStack Query `SELECT DISTINCT category`). Add an "Other…" option that reveals a text input so admins can still add a new category. Default suggestions when DB is empty: `Course Materials`, `Worksheets`, `Meditation`, `Affirmations`, `Templates`, `Books` (matches the filter list on the Resources page).

---

## Part 5 — `/resources` Resources tab enhancements
File: `src/pages/admin/ResourcesPage.tsx`

1. **Delete with confirmation**
   - Add a small trash-icon button on each card (only for DB-backed resources, not mock entries — detect by presence of `created_at` or by tagging mapped DB rows with `_source: 'db'`).
   - Click opens an `AlertDialog`: "Delete this resource? This cannot be undone." with Cancel / Delete.
   - On confirm: if URL starts with `storage:resources/`, also `supabase.storage.from('resources').remove([path])`; then `supabase.from('learning_content').delete().eq('id', r.id)`. Invalidate `learning-content` query. Toast on success/failure.
   - Add RLS migration if needed (check shows `Admins manage all learning content` already covers DELETE via `FOR ALL`, so no new policy).

2. **Source + file-type badges**
   - Derive `sourceLabel`: URL starting with `storage:resources/` → "Laptop"; URL containing `drive.google.com` → "Drive"; else → "URL".
   - Show alongside existing language/type badges. Type badge already exists; add an icon-coded variant (PDF/Audio/Video/Image colours).

3. **PDF thumbnail preview**
   - For `type === 'pdf'` cards, render a 96px-tall thumbnail using `pdfjs-dist` (already commonly available; will add via package). Generate first-page canvas → data URL on mount; cache in component state. For `storage:resources/` paths, fetch a signed URL first.
   - Fallback to the current PDF icon if rendering fails or while loading.

4. **Type + Language dropdown filters**
   - Add two `<Select>` filters next to the existing search row: **Type** (`All / Video / Audio / PDF / Worksheet`) and **Language** (`All / English / Hindi / Marathi / Hinglish / Mix`).
   - Apply both in the existing `filtered` computation alongside category and search.

---

## Verification
1. Logged in as coach: opening `/admin/documents` data load returns no signature rows; querying `signature_requests` / `document_signatures` returns 0 rows.
2. Logged in as seeker or coach: attempting to update another user's profile or change own `role`/`admin_level` is rejected.
3. `/admin/seekers` redirects to `/seekers` and renders.
4. `/settings` no longer shows the document banner.
5. `/admin/upload-resource` shows 5 languages (incl. Marathi, Hinglish, Mix) and a Category dropdown populated from existing data with "Other…" fallback.
6. `/resources`: each DB resource shows source label + type badge; PDFs show a thumbnail; trash icon opens confirm modal and removes the resource (and its storage object); Type and Language dropdowns filter results.

## Files affected
- New migration: drop coach signature SELECT policies; replace profile UPDATE policies.
- Edited: `src/App.tsx` (redirect `/admin/seekers` → `/seekers`).
- Edited: `src/pages/admin/SettingsPage.tsx` (remove banner).
- Edited: `src/pages/admin/AdminUploadResource.tsx` (languages + Category LOV).
- Edited: `src/pages/admin/ResourcesPage.tsx` (delete, badges, thumbnails, filters).
- New dep: `pdfjs-dist` (PDF thumbnails).

## Out of scope
- No changes to seeker-facing pages.
- No changes to existing admin/seeker signature flow UI (only RLS tightened for coaches).
- No deletions of components/files (preservation policy).

