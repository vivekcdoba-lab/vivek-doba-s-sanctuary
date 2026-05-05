# Homepage Media Showcase Section

Add a new "Featured Media" section to the public homepage between the FAQ and "Coaching Across India" sections, displaying clickable thumbnails of YouTube videos, Instagram reels/posts, Facebook posts, X posts, and other social content. Admins manage the entries from a new admin page.

## What gets built

### 1. Database (new table: `homepage_media`)

Migration creates:

```text
homepage_media
  id              uuid PK
  title           text          -- caption shown under thumbnail
  platform        text          -- 'youtube' | 'instagram' | 'facebook' | 'x' | 'linkedin' | 'other'
  content_type    text          -- 'video' | 'reel' | 'post' | 'short' | 'ad'
  external_url    text          -- where the click sends the user
  thumbnail_url   text          -- public image URL (uploaded or pasted)
  description     text nullable
  display_order   int default 0
  is_active       bool default true
  created_at, updated_at, created_by
```

RLS:
- SELECT: public/anon (`USING true`) — needed so the homepage works for logged-out visitors.
- INSERT/UPDATE/DELETE: admins only via `is_admin(auth.uid())` (matches the project's standardized helper pattern, consistent with the security memory).

A new `homepage-media` storage bucket (public) is created so admins can upload thumbnails directly. They can also paste external image URLs (e.g. YouTube `i.ytimg.com` thumb).

### 2. Public homepage section — `src/pages/Index.tsx`

Inserted between line 245 (end of FAQ) and line 247 (start of "Coaching Across India").

Layout:
- Section heading: "Featured Videos & Social Highlights"
- Subheading: short tagline
- Responsive grid (1 col mobile, 2 cols tablet, 3 cols desktop) of cards
- Each card: 16:9 thumbnail with a platform badge overlay (YouTube/Instagram/etc. icon + color), play-icon overlay for videos, title below, and content-type chip
- Whole card is a link that opens the `external_url` in a new tab using the existing `openExternal()` helper from `src/lib/openExternal.ts` (already handles the iframe escape).
- Data fetched via TanStack Query from `homepage_media` where `is_active = true`, ordered by `display_order, created_at desc`, limited to e.g. 12.
- If no rows exist, the entire section is hidden (no empty state on public site).

### 3. Admin management page — `src/pages/admin/AdminHomepageMedia.tsx`

New route `/admin/homepage-media`. Mirrors the style of `AdminVideos.tsx`:
- Header with count badge
- Search by title
- Table: Thumbnail preview · Title · Platform · Type · URL · Order · Active · Actions
- "Add Media" button opens a dialog form with fields:
  - Title (required)
  - Platform (select)
  - Content type (select)
  - External URL (required, validated)
  - Thumbnail: tabbed input — Upload (to `homepage-media` bucket) or Paste URL
  - Description (optional)
  - Display order (number)
  - Active toggle
- Row actions: Edit, Toggle active, Delete (with confirm)
- Auto-suggest YouTube thumbnail: if URL matches `youtube.com/watch?v=ID` or `youtu.be/ID`, prefill `https://i.ytimg.com/vi/ID/hqdefault.jpg` when thumbnail is empty.

### 4. Wiring

- `src/App.tsx`: lazy-import `AdminHomepageMedia`, add route `/admin/homepage-media` inside the existing admin route group.
- Sidebar: add a "Homepage Media" link under the admin Content section (alongside Videos/Audios) so admins can find it.

## Technical notes

- All admin actions go through Supabase client with RLS enforcing admin-only writes. No edge function needed.
- Storage bucket policies: public read; admin-only insert/update/delete.
- Click-throughs use `openExternal()` to escape the Lovable preview iframe (Instagram/Facebook deny embedding).
- Platform badges use existing brand-aware colors; icons from `lucide-react` (`Youtube`, `Instagram`, `Facebook`, `Twitter`, `Linkedin`, `Link`).
- No changes to existing tables, components, or features — purely additive (per project preservation policy).

## Out of scope

- Embedding actual video players inline (cards only link out, per requirement).
- Auto-fetching post metadata from social platforms (admin pastes URL + thumbnail).
- Analytics on click-through (can be added later).
