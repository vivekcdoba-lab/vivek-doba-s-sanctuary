
The user wants stronger SEO targeting social media discovery + a wide audience (all ages, business owners, students, corporate employees, industrialists). They also mention "videos + posts must automatically play while scrolling social media" — that's not something a website controls; it's a function of each social platform's autoplay (Instagram Reels, YouTube Shorts, FB feed all autoplay by default once content is posted there). I'll clarify that and focus the actual deliverable on website-side SEO + rich social link previews so when Vivek shares a link on Insta/FB/LinkedIn/YouTube, the preview card is rich, video-ready, and audience-targeted.

## What I'll do

### 1. Site-wide SEO upgrade (`index.html`)
- Expand `<meta name="keywords">` to cover all target audiences: entrepreneurs, business owners, students, corporate employees, industrialists, professionals, youth, mid-career, retirees.
- Add audience-targeted meta description variants via per-page `useDocumentMeta` (already exists).
- Add `<meta name="robots" content="index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1">` — this tells Google + social crawlers to use **large image previews** and **full video previews** (so YouTube embeds and Reels show inline when shared).
- Add `og:video` tag pointing to a hero YouTube video for rich link previews on Facebook / LinkedIn / WhatsApp.
- Add `twitter:card = "player"` variant when video URL present.

### 2. Strengthen JSON-LD structured data (`index.html`)
- Add **VideoObject** schema referencing Vivek's YouTube channel videos so Google indexes them as video results.
- Expand existing `Person` schema with `knowsAbout` (life coaching, business coaching, NLP, manifestation, meditation, dharma, leadership) — broadens topical authority signals.
- Add **Organization** `audience` schema listing target audiences (Entrepreneurs, Students, Corporate Professionals, Industrialists).
- Add **BreadcrumbList** schema on key pages.

### 3. Per-page SEO meta — audience-specific landing pages
Update `useDocumentMeta` titles/descriptions on existing SEO pages to explicitly call out each audience group:
- `LifeCoaching.tsx` — "for students, professionals, entrepreneurs"
- `BusinessCoaching.tsx` — "for business owners, industrialists, founders"
- `NlpCoach.tsx` — "for corporate employees & leaders"
- `SalesCoach.tsx` — "for sales teams, founders, entrepreneurs"
- `Manifestation.tsx`, `Meditation.tsx`, `DharmaPhilosophy.tsx` — broaden to "all ages, all walks of life"

### 4. Social media SEO (link unfurling = rich previews)
- Verify all 4 social URLs are in the `sameAs` arrays (already done) — this is what powers Google Knowledge Panel linking.
- Add `<link rel="me" href="...">` tags in `<head>` for each social profile (microformats ownership signal — strengthens identity verification for Mastodon/IndieWeb/Google).
- Add platform-specific OG tags so the FB/LinkedIn share scraper picks up correct image dimensions (1200x630).

### 5. Sitemap refresh (`public/sitemap.xml`)
- Already includes all SEO pages. No structural change needed; will bump dates if relevant.

### 6. Clarification on "auto-play on scroll"
This **cannot** be controlled by the website. Autoplay-on-scroll is a feature of:
- **Instagram Reels / Feed** — autoplays when posted natively as a Reel/Video
- **Facebook Feed** — autoplays native uploads & some shared YouTube links
- **YouTube Shorts** — autoplays in the Shorts feed
- **LinkedIn** — autoplays native video uploads

To get autoplay behavior, Vivek must **upload videos natively to each platform** (not just share a link). I'll explain this in the chat reply, not in code.

## Files I'll edit
- `index.html` — expanded keywords, robots meta, og:video, VideoObject + audience JSON-LD, `rel="me"` links
- `src/pages/seo/LifeCoaching.tsx` — audience-targeted meta
- `src/pages/seo/BusinessCoaching.tsx` — audience-targeted meta
- `src/pages/seo/NlpCoach.tsx` — audience-targeted meta
- `src/pages/seo/SalesCoach.tsx` — audience-targeted meta
- `src/pages/seo/Manifestation.tsx`, `Meditation.tsx`, `DharmaPhilosophy.tsx` — audience-targeted meta
- `src/pages/Index.tsx` — set strong landing-page meta via `useDocumentMeta` if not already

## Out of scope
- No DB / RLS / auth changes
- No new pages
- Cannot make videos auto-play on social platforms from website code (clarified above)
- No copy rewrite of existing landing page body content (only meta tags + a few headlines if needed)
