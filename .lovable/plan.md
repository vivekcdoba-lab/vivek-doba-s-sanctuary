# Fix Audio Playback + Remove Legacy Avatar Buttons

## 1. Audio not playable at `/seeker/learning/audio`

**Root cause:** Audio rows in `learning_content` store URLs as `storage:resources/audio/<file>` (a custom protocol pointer to the **private** `resources` storage bucket). The audio player assigns this string directly to `audio.src`, which the browser cannot resolve. Permissions are fine — the bucket policy "Authenticated users can read resources" allows access via signed URLs; only the URL resolution is missing.

The same pattern is already implemented elsewhere (e.g. `ResourcePreviewModal.tsx`, `admin/ResourcesPage.tsx`) using `supabase.storage.from('resources').createSignedUrl(path, ttl)`.

### Fix — add storage URL resolution to learning pages

**File:** `src/pages/seeker/SeekerLearningAudio.tsx`

- Add a helper `resolveMediaUrl(url)` that:
  - If `url` starts with `storage:resources/` → strip prefix, call `createSignedUrl(path, 3600)` and return signed URL.
  - Else returns the url as-is (regular https URLs still work).
- In `playTrack`, await the resolved URL before assigning to `audio.src`. Cache resolved URLs in a `useRef<Map<string,string>>` to avoid re-signing on every play/pause.
- On error, toast "Audio failed to load" instead of silently flipping `isPlaying` to false.

**Files (same pattern, also affected):**
- `src/pages/seeker/SeekerLearningVideos.tsx` — apply same `storage:resources/...` → signed URL resolution before playing.
- `src/pages/seeker/SeekerLearningPdfs.tsx` — same, before opening the PDF in a viewer/new tab.

## 2. Remove "Upload" + "Camera" side buttons next to profile pic

**File:** `src/components/AvatarUploader.tsx`

The pencil EDIT badge on the avatar already opens the chooser dialog (Upload / Camera). Remove the duplicated side buttons block (lines 190–203, the `{!compact && (...)}` section) so only the pencil-badge entry point remains. The `compact` prop becomes effectively the only behavior — keep the prop signature for backward compat but ignore it.

## Out of Scope

- No DB or storage policy changes — current RLS already grants read to authenticated users on the `resources` bucket via signed URLs.
- No changes to admin upload flow — URLs are still stored as `storage:resources/...`.
