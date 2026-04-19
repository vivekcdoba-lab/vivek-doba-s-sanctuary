
The user wants SEO content (titles, meta descriptions, headings, page copy, blog topics) for the VDTS site. This is content creation, not just code. I need to decide what to actually wire into the codebase vs. deliver as a copy doc.

Looking at current state:
- `index.html` has basic SEO meta but generic
- `src/pages/Index.tsx` has hero/cards but minimal SEO copy
- Pages for Life Coaching, Business Coaching, Manifestation, Meditation, Dharma don't exist as standalone public SEO landing pages
- Memory says "Only Add and Enhance" — don't replace the existing homepage cards/hero

Plan: Update meta tags in `index.html`, enhance the existing homepage with an SEO-rich content section below the cards (without disturbing hero/cards), create 5 new public SEO landing pages, add routes, and deliver a blog-topics list as a markdown doc in `/mnt/documents/`.

Keep concise.

## Plan: SEO Content & Landing Pages for VDTS

### 1. Update site meta (`index.html`)
- Title: `Spiritual Business Coach | Dharma-Based Life Coaching | VDTS` (59 chars)
- Description: `Transform your purpose & business with dharma-based coaching by Vivek Doba. Manifestation, meditation & conscious leadership for entrepreneurs.` (151 chars)
- Refresh keywords, OG title/description to match
- Add `<link rel="canonical">` and expand JSON-LD with `aggregateRating` + service offerings

### 2. Enhance homepage (`src/pages/Index.tsx`) — additive only
Add new sections below the existing 3 registration cards (existing hero + cards untouched):
- **H1** stays in hero (rename to "Vivek Doba — Spiritual Business Coach for Purpose-Driven Entrepreneurs")
- New section: **H2** "Dharma-Based Coaching for Conscious Leaders" + 500–700 word keyword-rich body covering all primary + secondary keywords naturally
- New section: **H2** "What We Offer" with 4 H3 cards linking to the new SEO pages (Life Coaching, Business Coaching, Manifestation, Meditation)
- New section: **H2** "Why Choose Dharma-Based Coaching" with H3 sub-points
- New section: **H2** "Frequently Asked Questions" with 5 Q&As (FAQ schema in JSON-LD)

### 3. Create 5 public SEO landing pages
New files under `src/pages/seo/`:
| File | Route | Title (≤60) | H1 |
|---|---|---|---|
| `LifeCoaching.tsx` | `/life-coaching` | Life Coach for Purpose & Inner Alignment \| VDTS | Life Coaching for Purpose-Driven Living |
| `BusinessCoaching.tsx` | `/business-coaching` | Business Coach for Entrepreneurs \| Spiritual Growth | Business Coaching for Conscious Entrepreneurs |
| `Manifestation.tsx` | `/manifestation` | Manifestation Coaching \| Law of Attraction \| VDTS | Manifestation Coaching for Real-World Results |
| `Meditation.tsx` | `/meditation` | Meditation for Entrepreneurs & Success \| VDTS | Meditation for Success & Mental Clarity |
| `DharmaPhilosophy.tsx` | `/dharma-philosophy` | Dharma Karma Moksha Meaning \| Coaching \| VDTS | Dharma, Karma & Moksha — The Path to Purpose |

Each page: shared header/footer (matching `Index.tsx`), 500–700 word body, H2/H3 hierarchy, internal links to other SEO pages + CTAs to `/book-appointment`, `/register-workshop`, `/apply-lgt`, per-page meta via `react-helmet-async` (add lib) OR a small `useDocumentMeta` hook (no extra dep — preferred).

### 4. Routing
Register the 5 new public routes in `src/App.tsx` alongside `/book-appointment` etc.

### 5. Sitemap & robots
- Create `public/sitemap.xml` listing all public routes
- Update `public/robots.txt` to reference sitemap

### 6. Blog topics
Deliver `/mnt/documents/vdts-seo-blog-topics.md` with 10 SEO blog topics + target keywords + suggested H2 outlines. Also save the full content brief (homepage copy + 5 page bodies) as `/mnt/documents/vdts-seo-content-pack.md` for the user's records.

### Tone
Professional, modern, practical, light spiritual positioning. No keyword stuffing — primary keywords appear 1–3× per page; secondary keywords woven naturally.

### Files changed
- `index.html` — meta + JSON-LD
- `src/pages/Index.tsx` — additive SEO sections
- `src/pages/seo/LifeCoaching.tsx` (new)
- `src/pages/seo/BusinessCoaching.tsx` (new)
- `src/pages/seo/Manifestation.tsx` (new)
- `src/pages/seo/Meditation.tsx` (new)
- `src/pages/seo/DharmaPhilosophy.tsx` (new)
- `src/hooks/useDocumentMeta.ts` (new — sets title/meta per page)
- `src/App.tsx` — 5 new routes
- `public/sitemap.xml` (new), `public/robots.txt` (updated)
- `/mnt/documents/vdts-seo-content-pack.md` + `/mnt/documents/vdts-seo-blog-topics.md`

Nothing existing is removed. Login, dashboards, and all existing routes untouched.
