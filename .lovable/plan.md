# Auto-Thumbnail from Link in Admin Homepage Media

Make the "Thumbnail" field auto-populate when the admin pastes a video/reel/post URL on `/admin/homepage-media`, so they don't need to upload or paste an image manually. Admins can still override.

## Scope

File: `src/pages/admin/AdminHomepageMedia.tsx`

## Behavior

When `external_url` changes (or platform changes) and `thumbnail_url` is empty (or was last set by auto-detect), derive a thumbnail and:
1. Auto-fill the form's `thumbnail_url` field (preview shows immediately).
2. Auto-detect & set the `platform` (and best-guess `content_type`) from the URL pattern, so the YouTube branch works without the admin selecting it first.
3. Keep the existing fallback in `upsertMutation` (auto-thumb on save) as a safety net.

Track an `autoThumb` flag in component state — if the admin manually edits/uploads a thumbnail, we stop overwriting it. Cleared if they blank the field.

## URL → Thumbnail Rules

```text
YouTube
  watch?v=ID | youtu.be/ID | /shorts/ID | /embed/ID
  → https://i.ytimg.com/vi/{ID}/hqdefault.jpg
  (fallback chain on <img onError>: maxresdefault → hqdefault → mqdefault → default)
  platform=youtube, content_type = "short" if /shorts/, else "video"

Vimeo
  vimeo.com/{ID}
  → https://vumbnail.com/{ID}.jpg   (free public thumbnail proxy)
  platform=other, content_type=video

Instagram  (reel | reels | p | tv)
  instagram.com/{reel|reels|p|tv}/{CODE}/
  → https://www.instagram.com/p/{CODE}/media/?size=l
  platform=instagram, content_type = "reel" if reel(s), else "post"

Facebook
  facebook.com/.../videos/{ID} | /reel/{ID} | /watch?v={ID} | /posts/{ID}
  → https://graph.facebook.com/{ID}/picture?type=large   (works for public video IDs; for posts we leave blank)
  platform=facebook, content_type = "reel" | "video" | "post"

X / Twitter
  x.com/{user}/status/{ID} | twitter.com/{user}/status/{ID}
  No public thumbnail endpoint without API → leave thumbnail blank, but still set platform=x, content_type=post.
  Show inline hint: "X posts don't expose a public thumbnail — please upload one."

LinkedIn
  linkedin.com/posts/... | /feed/update/...
  No public thumbnail → leave blank, show same hint.
  platform=linkedin, content_type=post.

Other / unknown → leave blank, no hint.
```

## Implementation Details

1. Replace the single `youtubeIdFromUrl` helper with a `detectFromUrl(url)` returning `{ platform, contentType, thumbnail }`.
2. Add a `useEffect` in the dialog that watches `form.external_url`. On change:
   - call `detectFromUrl`
   - if `autoThumb !== false`, set `form.thumbnail_url` to the derived value (or `''` if none)
   - set `form.platform` and `form.content_type` only if the admin hasn't manually changed them since opening the dialog (track via `manualPlatform`, `manualContentType` flags reset on dialog open)
3. On manual edits to the URL/upload field, set `autoThumb = false`. On manual edit of platform/content_type, set the corresponding manual flag.
4. Reset all flags in `openCreate()` and `openEdit()`.
5. Add `onError` fallback on the preview `<img>` so YouTube's `hqdefault` is tried if `maxresdefault` fails (only when the URL is an `i.ytimg.com` link).
6. Add a small muted-text hint under the URL input when detected platform is `x`/`linkedin` or unknown:
   "Couldn't auto-detect a thumbnail for this link — upload one or paste a URL."
7. Keep the existing save-time fallback in `upsertMutation` and extend it to also call `detectFromUrl` (covers older rows being edited where thumbnail is still empty).

## Out of Scope

- Server-side OpenGraph scraping (would need a new edge function; can be a follow-up if Instagram/X thumbnails become important).
- Editing existing rows to backfill thumbnails in bulk.
