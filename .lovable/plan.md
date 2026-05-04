# Security & SEO Hardening Plan

Addresses every actionable finding from the latest scan report. Items requiring access outside the repo (Cloudflare dashboard, GitHub Secrets) are called out separately.

---

## Part A — Critical fixes (in repo)

### A1. Dev-tooling CVE bump (single grouped change)
Bump all dev-only deps with open advisories together so one PR + one CI run covers them.

In `package.json` `devDependencies`, raise:
- `vite` `^5.4.19` → `^5.4.21` (4 advisories)
- `postcss` `^8.5.6` → `^8.5.10`

Add an `overrides` block so transitive `rollup`, `esbuild`, `yaml` are pinned to patched versions even when pulled in via Vite:
```json
"overrides": {
  "rollup": "^4.59.0",
  "esbuild": "^0.25.0",
  "yaml": "^2.8.3"
}
```
Run `bun install` to refresh `bun.lock`. After install, re-run `bun audit` and OSV-Scanner; expect zero findings.

### A2. CSP / X-Frame-Options / Permissions-Policy on HTML responses
**Out of repo scope** — Cloudflare strips headers from the cached HTML root. Two options the user must pick (will ask once we begin work, but recommended path is #1):

1. **Cloudflare Transform Rule** (no code, fastest): Dashboard → Rules → Transform Rules → Modify Response Header. Match: `(http.request.uri.path matches "^/.*$" and http.response.headers["content-type"][0] contains "text/html")`. Add the four headers verbatim from `public/_headers`.
2. **Cloudflare Worker shim**: deploy a Worker route `vivekdoba.com/*` that fetches the origin response and `set`s the headers before returning. Code lives in a new `cloudflare/headers-worker.js` we can author.

Either way, after deploy we re-run the ZAP baseline (already wired into the weekly workflow) and confirm headers appear on `GET /`.

---

## Part B — Lockfile & CI hygiene

### B1. Remove `package-lock.json` drift
- Delete `package-lock.json` from the repo.
- Append `package-lock.json` to `.gitignore`.
- `.github/workflows/security.yml` already uses `bun install --frozen-lockfile` — no change.

### B2. Lighthouse / CWV check in CI
Add a new job `lighthouse` to `.github/workflows/security.yml` (or a sibling `quality.yml`) using `treosh/lighthouse-ci-action@v12`, run on PRs against `https://vivek-doba-portal.lovable.app`. Budget assertions:
- LCP < 2.5s, CLS < 0.1, TBT < 200ms, performance ≥ 0.85.
Failures warn but don't block (`uploadArtifacts: true`, `temporaryPublicStorage: true`).

---

## Part C — SEO fixes (in repo)

### C1. Canonical-per-route correctness
`useDocumentMeta.ts` already builds canonical from `${origin}${canonicalPath}`. The risk is pages that forget to pass a unique `canonicalPath`. Two mitigations:

1. Audit all 24 SEO routes (`src/pages/seo/*.tsx`) and confirm each calls `useDocumentMeta` with its exact path. The dynamic `LifeCoachLocation.tsx` / `BusinessCoachLocation.tsx` must derive `canonicalPath` from the URL param (`/life-coach-in-${city}`), not a default.
2. Add a Vitest assertion `src/pages/seo/__tests__/canonical.test.tsx` that renders each SEO page with each city and asserts `document.head.querySelector('link[rel=canonical]').href` is unique across the 24-route matrix.

### C2. OG / Twitter meta on all SEO routes
`useDocumentMeta.ts` already sets `og:title`, `og:description`, `twitter:title`, `twitter:description`. Extend it to also set, when not present:
- `og:type=website`, `og:url` (= canonical), `og:locale=en_IN`
- `og:image`, `twitter:image`, `twitter:card=summary_large_image` defaulting to the existing brand social image used in `index.html` (line 31), overridable per page via a new `image?: string` option.

### C3. Marathi local relevance on Pune & Maharashtra pages
In `LifeCoachLocation.tsx` and `BusinessCoachLocation.tsx`, when `city ∈ {pune, maharashtra}`:
- Render an additional `<h2 lang="mr">` with a one-line Marathi tagline (e.g. "पुण्यातील जीवन प्रशिक्षक — धर्मावर आधारित मार्गदर्शन").
- Add a Marathi paragraph (~60 words) under it.
- Inject `<link rel="alternate" hreflang="mr-IN" href={canonical} />` and `hreflang="en-IN"` self-link via `useDocumentMeta` (extend with optional `hreflang?: Array<{lang: string; href: string}>`).

### C4. LocalBusiness JSON-LD with `areaServed`
- In `index.html`, change the existing `ProfessionalService` schema to also be a `LocalBusiness` (`"@type": ["ProfessionalService", "LocalBusiness"]`) and add `areaServed: [{"@type":"City","name":"Pune"},{"@type":"State","name":"Maharashtra"},{"@type":"Country","name":"India"}]`.
- In `_SeoLayout.tsx`, add an optional `<script type="application/ld+json">` slot. City pages pass a city-specific `LocalBusiness` JSON-LD with the matching `areaServed` city + `geo` coordinates.

### C5. Sitemap priority hierarchy
Rewrite `public/sitemap.xml` priorities:
- `/` → 1.0
- `/life-coaching`, `/business-coaching` → 0.9
- `/manifestation`, `/meditation`, `/dharma-philosophy`, `/nlp-coach`, `/sales-coach` → 0.8
- `/life-coach-in-{india,maharashtra}`, `/business-coach-in-{india,maharashtra}` → 0.75
- `/life-coach-in-{pune,mumbai}`, `/business-coach-in-{pune,mumbai}` → 0.7
- `/book-appointment`, `/register-workshop` → 0.6
- `/blog` → 0.7, `/blog/{slug}` → 0.6
- `/register` → 0.4, others unchanged.

### C6. Blog routes (MVP — static MDX-style)
- Add `/blog` and `/blog/:slug` routes in `src/App.tsx`.
- Create `src/pages/blog/BlogIndex.tsx` (lists posts) and `src/pages/blog/BlogPost.tsx` (renders content + `BlogPosting` JSON-LD).
- Create `src/data/blogPosts.ts` with the 10 outline objects (slug, title, description, keywords, h1, body markdown). Render via existing `react-markdown`.
- Each post sets canonical `/blog/{slug}` via `useDocumentMeta` and emits `BlogPosting` JSON-LD with `author`, `datePublished`, `image`.
- Add the 10 post URLs + `/blog` to `public/sitemap.xml` and to `SeoFooter`.

### C7. NLP Coach SEO spec parity
`NlpCoach.tsx` already uses `useDocumentMeta`. Verify and tighten:
- title `≤60` chars: "NLP Coach in India | Mindset & Behaviour Change Coach" (54)
- description `≤160` chars (current is 158 — leave or trim).
- Add primary keyword "NLP coach India" + secondary "NLP practitioner online India" in body H2s if not already.
No structural change beyond a minor copy edit.

---

## Part D — Out-of-repo follow-ups (we'll surface to user, not code)

1. **Cloudflare Transform Rule** for response headers (Critical A2).
2. After GitHub PR merges, **re-run the weekly ZAP baseline** via `workflow_dispatch` to confirm headers + that all CVE bumps held.
3. **GA4 / Search Console**: submit updated `sitemap.xml` after deploy.

---

## Files touched

```text
package.json                              # dev-dep bumps + overrides
.gitignore                                # ignore package-lock.json
package-lock.json                         # DELETED
.github/workflows/security.yml            # add lighthouse job
src/hooks/useDocumentMeta.ts              # OG/twitter/hreflang/image options
public/sitemap.xml                        # rebalance priorities + blog URLs
index.html                                # LocalBusiness + areaServed
src/pages/seo/_SeoLayout.tsx              # JSON-LD slot
src/pages/seo/LifeCoachLocation.tsx       # Marathi block on Pune/MH
src/pages/seo/BusinessCoachLocation.tsx   # Marathi block on Pune/MH
src/pages/seo/__tests__/canonical.test.tsx  # NEW — uniqueness assertion
src/pages/seo/NlpCoach.tsx                # title/desc tighten
src/pages/blog/BlogIndex.tsx              # NEW
src/pages/blog/BlogPost.tsx               # NEW
src/data/blogPosts.ts                     # NEW (10 posts)
src/App.tsx                               # /blog + /blog/:slug routes
src/pages/seo/_SeoLayout.tsx              # blog link in footer
```

## Out of scope

- Active DAST (intrusive scans) — passive ZAP baseline is sufficient.
- Container/IaC scanning — no Dockerfile/Terraform in repo.
- Paid scanners (Snyk, SonarCloud) — current free stack covers the surface.
- Cloudflare dashboard changes — flagged for user action.
