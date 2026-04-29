## Goal

Add **per-resource access control** to all learning content (videos, audios, PDFs/resources) so each item can be restricted to a specific audience, and disable downloads for everyone (view/listen/read only).

---

## 1. Access Levels

Add a single `visibility` field on each `learning_content` row with these options:

| Value | Who can see it |
|---|---|
| `admin_only` | Only admins (any level). Useful for drafts / internal references. |
| `admin_coach` | Admins + Coaches (incl. admins flagged `is_also_coach`). Hidden from seekers. |
| `all` | Full access — admins, coaches, and all enrolled seekers. |

Default for new uploads: `all` (matches today's behavior so nothing breaks).

Reasoning for picking these three: they map cleanly onto the three roles already in the app (`admin`, `coach`, `seeker`) and mirror the existing pattern used for documents/announcements. A more granular per-course/per-tier ACL was considered but rejected — it adds UI complexity the user didn't ask for, and `course_id` + `tier` columns already exist on `learning_content` if you ever need finer scoping later.

---

## 2. Database changes (migration)

1. Add column:
   ```sql
   ALTER TABLE public.learning_content
     ADD COLUMN visibility text NOT NULL DEFAULT 'all'
     CHECK (visibility IN ('admin_only','admin_coach','all'));
   ```
2. Replace the existing seeker-side SELECT policy `Anyone can view active learning content` with a visibility-aware policy:
   - Admins: see everything (already covered by the existing "Admins manage all" policy, keep it).
   - Coaches (`is_coach(auth.uid())`): see `admin_coach` + `all` rows that are active.
   - Authenticated seekers: see only `all` rows that are active.
3. Index: `CREATE INDEX idx_learning_content_visibility ON public.learning_content(visibility);`

No data migration needed — every existing row defaults to `all`.

---

## 3. Admin UI

**`AdminUploadResource.tsx`** — add a "Who can access this?" Select with the 3 options (with short helper text under each), defaulting to `all`. Persist as `visibility` on insert.

**`AdminVideos.tsx`, `AdminAudios.tsx`, `ResourcesPage.tsx` (PDF list)** — add:
- A new **Access** column showing a colored badge (`Admin only` / `Admin + Coach` / `Everyone`).
- A small inline dropdown (or edit button → dialog) so admins can change visibility on existing rows without re-uploading.

**`AdminCategories.tsx`** — no change.

---

## 4. Seeker / Coach UI

`SeekerLearningVideos.tsx`, `SeekerLearningAudio.tsx`, `SeekerLearningPdfs.tsx` — no code change required for filtering (RLS handles it server-side), but verify that the existing query already filters `is_active = true` so hidden items truly disappear.

---

## 5. Disable downloads (view-only) — applies to everyone, including admins

| Resource | Hardening |
|---|---|
| **Audio** (`<audio>` in `ResourcePreviewModal` + seeker audio page) | Add `controlsList="nodownload"` and `onContextMenu={e => e.preventDefault()}`. |
| **Video** (`<video>` tag for non-YouTube/Vimeo) | Same: `controlsList="nodownload noremoteplayback"` + disable right-click. For YouTube/Vimeo iframes, add `&modestbranding=1` and they already prevent direct download. |
| **PDF** (`<iframe>` preview) | Append `#toolbar=0&navpanes=0` to the PDF URL so the built-in PDF viewer hides its download/print buttons. Also disable right-click on the iframe wrapper. |
| **"Open in new tab" button** in `ResourcePreviewModal` | Remove for `pdf` / `audio` / `video` types so seekers can't grab the signed URL — keep it only as a fallback for Google Drive links (which can't embed). |
| **Signed URL TTL** | Lower `createSignedUrl` TTL from 600s to 300s — short-lived enough that copy/pasted links expire quickly. |

Note: these are deterrents, not DRM. A determined user with browser dev tools can always capture media. We'll mention this caveat in the response.

---

## 6. Files to edit / create

```text
supabase/migrations/<new>.sql                       (visibility column + RLS rewrite)
src/pages/admin/AdminUploadResource.tsx             (visibility field on form)
src/pages/admin/AdminVideos.tsx                     (Access column + edit)
src/pages/admin/AdminAudios.tsx                     (Access column + edit)
src/pages/admin/ResourcesPage.tsx                   (Access column + edit for PDFs)
src/components/ResourcePreviewModal.tsx             (no-download hardening, PDF toolbar off)
src/pages/seeker/SeekerLearningVideos.tsx           (no-download attrs on inline player)
src/pages/seeker/SeekerLearningAudio.tsx            (no-download attrs)
src/pages/seeker/SeekerLearningPdfs.tsx             (PDF iframe toolbar off, no right-click)
```

No changes to `useScopedSeekers`, auth, or coach pages.

---

## 7. Out of scope

- Watermarking video/audio with seeker name.
- Per-seeker or per-course allowlists (existing `course_id`/`tier` columns are untouched).
- Logging/auditing playback events.

These can be added later if needed.