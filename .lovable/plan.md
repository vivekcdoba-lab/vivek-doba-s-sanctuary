
## Changes

### 1. Remove hyperlinks from "Life Coach in" / "Business Coach in" sections (`src/pages/Index.tsx`, lines 255-287)
Replace the `<Link>` city pills with plain `<span>` text pills (same visual style, just non-clickable). The headings and city names stay; they just won't navigate anywhere.

```
PuneMumbaiMaharashtraIndia  ← becomes plain text chips
```

### 2. Add "Back to Home" link to NLP Coach & Sales Coach pages
- `src/pages/seo/NlpCoach.tsx` — add a `<Link to="/">← Back to Home</Link>` near the top of the article (just under `SeoHero`, above the first `<section>`).
- `src/pages/seo/SalesCoach.tsx` — same treatment.

(Style: small muted link with `ArrowLeft` icon, matches the existing pattern used elsewhere in the SEO area.)

### 3. Restructure `LifeCoaching.tsx` & `BusinessCoaching.tsx` to match `NlpCoach.tsx` layout
Currently they use a single `<article>` with mixed `<h2>` + `<h3>` and `prose` styling. Restructure to the **NLP Coach pattern**:

- Remove `prose` wrapper.
- Use `space-y-8` article with multiple `<section>` blocks, each with an `<h2 className="text-2xl font-bold ...">` + paragraph.
- Add the same "Back to Home" link at the top.
- Add a final "Get Started" section with the `<Link to="/book-appointment">Book your discovery call <ChevronRight /></Link>` CTA — identical pattern to NLP page.
- Keep all existing copy/context but reorganized into clean section headings:
  - **Life Coaching** sections: What a Life Coach Actually Does · Who Benefits Most · How the Work Is Structured (Diagnose / Practice / Integrate) · Why Dharma-Based Life Coaching Works · Get Started
  - **Business Coaching** sections: What Business Coaching Actually Solves · Who Benefits Most · The Artha Framework · Mindset + Strategy Together · Get Started

Each retains its unique context (Life = purpose/dharma/inner alignment; Business = Artha pillar/strategy + mindset).

## Files to edit
- `src/pages/Index.tsx` — strip `<Link>`, replace with `<span>` for the 8 city chips
- `src/pages/seo/NlpCoach.tsx` — add Back to Home link
- `src/pages/seo/SalesCoach.tsx` — add Back to Home link
- `src/pages/seo/LifeCoaching.tsx` — restructure to NLP-style sections + Back link
- `src/pages/seo/BusinessCoaching.tsx` — restructure to NLP-style sections + Back link

## Out of scope
- No route changes — `/life-coach-in-pune` etc. still exist (and are still linked from the SeoFooter on every SEO page for SEO crawlers); only the homepage chips become non-clickable as requested.
- No DB / RLS / auth changes.
- No copy of unrelated pages touched.
