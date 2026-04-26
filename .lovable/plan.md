## Goal
Add a **Play** button to each row on `/admin/videos` and `/admin/audios` so admins can preview the actual content (video or audio) without leaving the page.

## Why this is simple
- The `learning_content` table already has a `url` column (used for YouTube/Vimeo links, Supabase storage paths like `storage:resources/...`, or direct URLs).
- A reusable component `src/components/ResourcePreviewModal.tsx` already exists and handles:
  - YouTube + Vimeo embeds
  - Native `<audio>` and `<video>` players
  - Signed URL resolution for Supabase storage paths
  - Google Drive fallback ("open in new tab")
- No DB changes, no new dependencies, no edge functions needed.

## Changes

### 1. `src/pages/admin/AdminVideos.tsx`
- Import `ResourcePreviewModal` and `Play` icon from `lucide-react`.
- Add local state: `previewItem: { title, url } | null`.
- Add a new **Play** action button (▶ icon, `variant="ghost"`, `size="sm"`) in the Actions column, placed before the Activate/Deactivate button.
  - Disabled with a tooltip ("No URL") if `v.url` is missing.
  - On click: `setPreviewItem({ title: v.title, url: v.url })`.
- Render `<ResourcePreviewModal open={!!previewItem} onOpenChange={...} title={...} type="video" url={...} />` at the bottom of the component.

### 2. `src/pages/admin/AdminAudios.tsx`
- Identical treatment as above, but pass `type="audio"` to the modal so it renders an `<audio controls>` player.

## Files affected
- `src/pages/admin/AdminVideos.tsx` (edit)
- `src/pages/admin/AdminAudios.tsx` (edit)

## Out of scope
- No schema changes
- No changes to `ResourcePreviewModal` itself (already supports both types)
- Existing Activate/Deactivate, Search, and view-count behavior preserved (per Preservation Policy)
