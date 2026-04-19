
The user wants additional SEO targeting for local + role-based keywords:
- NLP coach (typo "LNP")
- Life coach in India / Maharashtra / Pune / Mumbai
- Same set for Business coach
- Sales coach

Approach: add 3 new SEO landing pages (NLP Coach, Sales Coach, and a Locations hub) plus location-specific variants for life + business coach. To avoid creating 10+ near-duplicate pages (Google penalizes thin/duplicate content), use a smart pattern: one parameterized location page per discipline that renders unique copy per city, plus dedicated NLP and Sales pages.

## Plan: Local + Role SEO Expansion

### 1. New standalone SEO pages
| File | Route | Title (≤60) |
|---|---|---|
| `seo/NlpCoach.tsx` | `/nlp-coach` | NLP Coach in India \| Mindset & Behaviour Change |
| `seo/SalesCoach.tsx` | `/sales-coach` | Sales Coach for Founders & Teams \| VDTS |

Each: 500–700 words, H1/H2/H3, internal links, CTA, `useDocumentMeta`.

### 2. Location-aware pages (one component, city param)
Two dynamic pages with unique per-city copy blocks (not just find-and-replace):

| File | Routes |
|---|---|
| `seo/LifeCoachLocation.tsx` | `/life-coach-in-india`, `/life-coach-in-maharashtra`, `/life-coach-in-pune`, `/life-coach-in-mumbai` |
| `seo/BusinessCoachLocation.tsx` | `/business-coach-in-india`, `/business-coach-in-maharashtra`, `/business-coach-in-pune`, `/business-coach-in-mumbai` |

Each component holds a `LOCATION_CONTENT` map keyed by city slug with unique:
- H1, meta title, meta description, canonical
- 2 unique paragraphs about that city/region (Pune startup ecosystem, Mumbai corporate, Maharashtra reach, India-wide online)
- Local schema JSON-LD (`LocalBusiness` with `areaServed`)
- Shared structural sections (what's offered, CTA) below

This gives 8 unique URLs that each rank locally, without 8 separate files to maintain.

### 3. Routing (`src/App.tsx`)
Register 2 standalone + 8 parameterized routes (10 new public routes).

### 4. Cross-linking
- Add a "Coaching Across India" section to homepage (`Index.tsx`) linking to the 4 city pages for both disciplines + NLP + Sales — additive only.
- Update `_SeoLayout.tsx` footer to include NLP Coach and Sales Coach links.

### 5. Sitemap & robots
Append all 10 new URLs to `public/sitemap.xml`.

### 6. Structured data
Each location page emits `LocalBusiness` JSON-LD with the correct `areaServed` (Pune / Mumbai / Maharashtra / India). NLP + Sales pages get `Service` schema.

### 7. Content tone
Professional, modern, light spiritual — same as existing SEO pages. Primary keywords appear 1–3× naturally. Each city page mentions local context (e.g. "Pune founders in Koregaon Park & Hinjawadi", "Mumbai BKC corporate leaders") to avoid duplicate-content flags.

### Files changed
- `src/pages/seo/NlpCoach.tsx` (new)
- `src/pages/seo/SalesCoach.tsx` (new)
- `src/pages/seo/LifeCoachLocation.tsx` (new)
- `src/pages/seo/BusinessCoachLocation.tsx` (new)
- `src/pages/seo/_SeoLayout.tsx` (add footer links)
- `src/pages/Index.tsx` (add "Coaching Across India" linking section — additive)
- `src/App.tsx` (10 new routes)
- `public/sitemap.xml` (append 10 URLs)
- `/mnt/documents/vdts-seo-content-pack-v2.md` (full copy reference)

Nothing existing is removed or restructured. All new routes are public.
