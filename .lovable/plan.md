

## Goal
Four cleanups on the resources area (the joining-date and automation tasks were handled in prior turns).

## Changes

### 1. Remove "Upload Resource" button from `/resources`
File: `src/pages/admin/ResourcesPage.tsx`
- Delete the top-right **"Upload Resource"** button and its inline `<Dialog>` (state `showUpload`, `newResource`, `handleUpload`).
- The dedicated `/admin/upload-resource` page becomes the single upload entry point.

### 2. Enhance `/admin/upload-resource` — keep current form + add file source options
File: `src/pages/admin/AdminUploadResource.tsx`
- Keep all existing fields exactly as they are (title, description, type, category, language, duration, URL).
- Add a **"Source"** segmented control above the URL field with three options:
  - **From Laptop** — file picker; uploads to the existing private `resources` storage bucket via `supabase.storage.from('resources').upload(...)`. On success, auto-fills the URL field with the storage path. Accepts `.pdf, .mp3, .m4a, .wav, .mp4` based on the selected `type`. Shows upload progress; submit button disabled until upload completes.
  - **From Google Drive** — text input for a Drive share link with a small helper note ("Set link sharing to 'Anyone with the link can view'"). Stored as-is in `url`.
  - **From URL / Other Online** — current behaviour (paste any direct URL: YouTube, Vimeo, Dropbox, etc.).
- No DB schema change — `learning_content.url` accepts any string.

### 3. Fix non-working "View" hyperlink in `/resources`
File: `src/pages/admin/ResourcesPage.tsx`
- Replace the inert `<button>View →</button>` with an `<a href={url} target="_blank" rel="noopener noreferrer">` when a URL is present; otherwise render a disabled state with tooltip "No URL available".
- Also wire the page to additionally fetch real entries from the `learning_content` table (read-only TanStack Query) and merge them with the mock list, so admin-uploaded items show up with working "View" links. For private-bucket paths, generate a signed URL on click via `supabase.storage.from('resources').createSignedUrl(path, 60)` before opening.
- Mock entries without URLs simply show "View" disabled — preserved per "Only Add and Enhance".

### 4. Remove all old stories
File: `src/data/storyLibrary.ts`
- Replace the 22-entry array with `export const STORY_LIBRARY: Story[] = [];`
- The Story Library tab on `/resources` will then show the existing empty state — no further code changes needed.

## Verification
1. `/resources` no longer shows the "Upload Resource" button or its dialog.
2. `/admin/upload-resource` shows three source tabs; uploading a PDF from laptop creates a `learning_content` row pointing to the `resources` bucket; Drive and URL options save the pasted link.
3. On `/resources`, "View" opens the resource in a new tab for items with URLs (signed URL for private storage paths); disabled with tooltip otherwise.
4. Story Library tab on `/resources` shows the empty state — no Ramayana/Mahabharata cards.
5. All other tabs, filters, and search behaviour remain unchanged.

## Files affected
- Edited: `src/pages/admin/ResourcesPage.tsx`
- Edited: `src/pages/admin/AdminUploadResource.tsx`
- Edited: `src/data/storyLibrary.ts`

## Out of scope
- No DB schema or RLS changes (the `resources` bucket already exists and admins already have write access).
- No changes to the seeker-facing learning pages.
- No deletion of `storyLibrary.ts` itself — only its array contents are emptied (preservation policy).

