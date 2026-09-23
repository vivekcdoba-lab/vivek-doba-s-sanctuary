# Final full-site quality audit

## Scope
- Crawl every public route and exercise internal links, buttons, forms, and external actions; repair dead destinations and remove `#` links.
- Remove public Devanagari text except `ॐ`, and hide unresolved square-bracket placeholders while recording the facts still needed.
- Test all public pages at 390px for overflow, readable body text, 48px tap targets, and WCAG AA text contrast; correct shared and page-specific failures.
- Validate one H1, unique title/description, self-referencing canonical, and parseable page-appropriate JSON-LD on every public page.
- build and inspect prerendered HTML to confirm each public URL exposes real text in page source.
- Run mobile Lighthouse for `/`, `/courses`, one course detail page, `/blog`, and `/contact`; fix practical regressions and report final scores.

## Technical approach
- Use an automated Playwright crawler for route/link/action, mobile geometry, typography, metadata, structured-data, and prerender checks.
- Preserve all existing features and database content; changes stay focused on public presentation, SEO metadata, and accessibility.
- Keep unresolved business facts hidden rather than inventing them, and list them in the final report.
