# Dynamic, image-led Courses upgrade

## Goal
Make every public course page database-driven and editable by admins, add a complete visual editor and generated course imagery, simplify the public ladder, and preserve all existing non-Courses areas.

## What will change

### 1. Extend the existing Courses database safely
- Extend the current `courses` table rather than replacing it, preserving enrollment and session relationships.
- Add the requested public-content, ordering, pricing, media, structured-content, publication, and SEO fields with safe defaults.
- Add a unique slug constraint after populating unique slugs for the nine public programs.
- Replace the current course read policy with public read access limited to `is_published = true`; keep insert, update, and delete restricted through the existing server-validated `is_admin(auth.uid())` function.
- Grant only the privileges required by those policies to public visitors, authenticated users, and the service role.
- Seed/upsert all nine current English courses with unchanged wording and prices, including the supplied benefits, methods, timelines, and deliverables for the four main courses.
- Preserve legacy operational course rows and mark them unpublished when they are not one of the nine public website courses.

### 2. One dynamic Courses data layer
- Expand the Courses query and types to map database rows into the existing public `Course` shape.
- Public pages, detail pages, and the Courses menu will read published rows ordered by `sort_order`.
- Keep `src/data/courses.ts` as the exact fallback when the database is unavailable or returns no published rows.
- Keep all price, GST, CTA, locked-course, and WhatsApp rules in shared helpers.
- Refresh public data immediately after admin saves, publishes, uploads, or reorders.

### 3. Generate and store nine course image sets
- Generate one warm, realistic image for each supplied brief with Indian subjects, natural light, saffron/gold styling, and no text or logos.
- Produce optimized WebP 16:9 hero and 4:3 card variants for each course, upload them to the existing managed media storage under a Courses folder, and save their URLs to the course row.
- Add descriptive course-specific alt text in the rendering layer.
- Mark seeded generated media in the admin UI with “AI image — replace with a real photo”.

### 4. Replace `/admin/courses` with the full website-course editor
- Keep the route protected by the existing admin sign-in guard and database policies.
- Show ordered course rows with image, status, ladder/side-program placement, and drag handles; persist drag order.
- Provide inputs for every requested scalar field and friendly repeatable editors for lists, benefits, method steps, timeline items, gallery images, and YouTube IDs.
- Add image upload controls with previews. Browser-side processing will auto-orient, resize to at most 1600 px, crop hero/card variants, and encode WebP before upload.
- Add publication and locked switches, validation, saving/error states, and safe delete confirmation.
- Preserve operational fields still used elsewhere so course management does not break enrollments or sessions.

### 5. Rebuild the public Courses presentation
- Dropdown: derive entries from published course records and show round thumbnails, names, short lines, four existing groups, keyboard/outside-click/Escape behavior, and the full-ladder link.
- `/courses`: preserve the requested page sequence; simplify ladder cards to image, step, name, outcome, essential facts, price, one CTA, and “See how it works for you”.
- Alternate card imagery left/right on desktop and place it above content on mobile while retaining the scroll-lit golden line.
- Add image-led side-program cards and semantic links instead of clickable non-link containers.
- Detail pages: full-bleed image hero, Before/After, benefits, numbered method, timeline, deliverables, audience fit, optional videos, investment, FAQ, next step, and sticky mobile action.
- Hide empty sections, preserve the special locked and Ram Nirvana experiences, and keep all copy English except the approved `ॐ`.

### 6. Accessibility, design, and audit fixes
- Use solid deep-saffron action buttons with white text and the darker hover state; make prices dark and GST supporting text readable.
- Use semantic links/buttons, visible focus states, descriptive alt text, minimum 48 px actions, stable image aspect ratios, and 16 px mobile body text.
- Respect reduced-motion preferences for reveals and the ladder animation.
- Remove the decorative emoji from the Courses tab while retaining its Lucide icon.
- Fix the audit’s High/Medium items: anonymous published-course access, static/public data divergence, non-semantic clickable cards, menu duplication, generic course social images, and stale manually maintained sitemap content. Project monitoring currently reports no additional pending findings.

### 7. SEO and publishing data
- Read title, description, and keyword guidance from each published database row without emitting a keywords meta tag.
- Use each course hero as its Open Graph/Twitter image and add it to Course JSON-LD.
- Keep Course, FAQPage, BreadcrumbList, and LocalBusiness structured data and canonical URLs.
- Add a repeatable sitemap generation script sourced from published database courses and regenerate `public/sitemap.xml` for the seeded set.
- Preload only the detail hero image; lazy-load all other course images and videos.

## Verification
- Run focused type checks and tests for mapping, pricing, visibility, and fallback behavior.
- Verify anonymous public reads and denied non-admin writes; run database and security linters.
- Test admin edit, publish/unpublish, upload conversion, and drag reorder with an authenticated admin session.
- Test desktop and mobile dropdown, ladder, every detail route, image loading, sticky action, keyboard access, metadata, JSON-LD, reduced motion, no layout overlap, and absence of unapproved Devanagari.
- Re-run the security/dependency scan and resolve all High and Medium findings attributable to this work.

## Final report
- List every High/Medium audit issue fixed and any blocked item with its reason.
- List all generated images and where each is used.
- Explain how to sign in at `/login`, open `/admin/courses`, publish changes, and use the existing Admins page to grant admin access securely.
