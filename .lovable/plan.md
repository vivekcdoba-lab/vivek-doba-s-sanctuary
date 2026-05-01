# Plan: Operation Docs — Live Architecture Reference

Yes, this is fully possible. We'll generate a **comprehensive Operation Docs hub** at `/admin/operation-docs` (Admin → SYSTEM → Operation Docs), built from a curated, version-controlled markdown bundle that auto-refreshes on every build. All read-only. You'll have one page to scan the entire system before asking for changes.

## What you'll see

A single admin page with a left sidebar of doc sections, a top search box, "Last updated" timestamp, and an "Export PDF / Markdown" button. Sections:

1. **Overview** — vision, stack, identity, terminology, preservation policy
2. **Architecture Map** — Mermaid diagram of layers (UI → Hooks → Supabase → Edge Functions → External APIs)
3. **Routes & Pages** — every URL grouped by role (Admin / Coach / Seeker / Public), with description + key file path
4. **Sidebar Navigation** — the actual menu hierarchy for each role
5. **Database Schema** — all 105 tables grouped by domain (Auth, Sessions, Assessments, Financial, Artha, Communication, etc.) — columns, FKs, RLS summary
6. **Database Functions** — every `public.*` function: purpose, params, return, security
7. **Edge Functions** — all 26 functions: trigger, inputs, outputs, secrets used
8. **Storage Buckets** — avatars, signatures, resources, documents — public/private + folder layout
9. **Cron / Automated Jobs** — daily reports, gratitude nudges, prep reminders, session heartbeat, key rotation
10. **External Integrations** — Resend, Twilio/WhatsApp, Lovable AI, Google Fit
11. **Auth & Roles** — RBAC matrix (admin/super_admin/coach/seeker), `is_admin` / `is_coach` / `is_assigned_coach` patterns
12. **RLS Policy Catalog** — table-by-table policy summary in plain English
13. **Business Rules** — LGT, Sampoorna points, attendance counter, journey progress, assessment thresholds, payment GST 18%
14. **Workflows** — Onboarding, Enrollment, Session lifecycle, Assignment, Assessment, Support ticket, Document signing — each as a Mermaid sequence diagram
15. **Feature Catalog** — 50+ features with status, owner files, related tables (one-line each)
16. **Glossary** — Seeker, Sadhak, Guruji, Dharma, LGT, Vishnu Protocol, etc.
17. **Change Log** — auto-appended entry on every build (commit hash + date + changed file count)

## How "auto-update on every build" works

**Approach: Generated bundle + thin viewer.** The docs are real markdown files in `src/docs/operation/` shipped with the build. A Node script regenerates the dynamic sections from live source-of-truth artifacts (DB introspection snapshot, route table, edge function list, sidebar config) at build time.

```text
┌─────────────────────────────────────────────────────────────┐
│  prebuild script (runs on every build automatically)        │
│  scripts/generate-operation-docs.ts                         │
│   ├─ scans src/App.tsx → routes.json                        │
│   ├─ scans src/components/*Layout.tsx → nav.json            │
│   ├─ scans supabase/functions/* → edge-functions.json       │
│   ├─ reads supabase/migrations/* → schema.json              │
│   ├─ reads .lovable/plan.md history → changelog entry       │
│   └─ writes src/docs/operation/_generated/*.md              │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  /admin/operation-docs (React page)                         │
│   ├─ imports all .md as raw strings (Vite ?raw)             │
│   ├─ renders with react-markdown + remark-gfm + mermaid     │
│   ├─ search box (fuzzy across all sections)                 │
│   └─ download buttons (.md zip, .pdf via print)             │
└─────────────────────────────────────────────────────────────┘
```

**Wiring `prebuild`**: add `"prebuild": "tsx scripts/generate-operation-docs.ts"` to `package.json`. Vite/Lovable runs `npm run build` for every preview build, so docs regenerate automatically every deploy.

**Hand-curated sections** (Overview, Business Rules, Workflows, Glossary) live as static `.md` files I write once and update when features change. **Generated sections** (Routes, Schema, Edge Functions, Changelog) regenerate from source on every build — they can never drift.

## Page UX

- **Layout**: 3-column on desktop — left rail (table of contents, collapsible), center (markdown content with anchor links), right rail (this section's quick-jump headings).
- **Read-only banner**: "📖 This is generated documentation. To change app behavior, ask in chat — docs will refresh on the next build."
- **Search**: client-side fuzzy search across all loaded markdown; jumps to anchor on click.
- **Print/Export**: a "Download" menu with "Markdown (.zip)" and "Print to PDF" (uses `window.print()` with a print stylesheet).
- **Mermaid diagrams**: rendered inline using `mermaid` npm package on mount.
- **Access**: admin-only route, protected by existing `RequireRole` wrapper.

## Files to create

- `src/pages/admin/AdminOperationDocs.tsx` — viewer page
- `src/components/docs/MarkdownViewer.tsx` — markdown + mermaid renderer
- `src/components/docs/DocsSidebar.tsx` — section index with search
- `src/docs/operation/00-overview.md` (static)
- `src/docs/operation/01-architecture.md` (static, with Mermaid map)
- `src/docs/operation/02-roles-auth.md` (static)
- `src/docs/operation/03-business-rules.md` (static)
- `src/docs/operation/04-workflows.md` (static, Mermaid sequence diagrams)
- `src/docs/operation/05-features.md` (static)
- `src/docs/operation/06-integrations.md` (static)
- `src/docs/operation/99-glossary.md` (static)
- `src/docs/operation/_generated/routes.md` (generated)
- `src/docs/operation/_generated/navigation.md` (generated)
- `src/docs/operation/_generated/database-schema.md` (generated from `supabase/migrations`)
- `src/docs/operation/_generated/database-functions.md` (generated)
- `src/docs/operation/_generated/edge-functions.md` (generated by scanning `supabase/functions/`)
- `src/docs/operation/_generated/storage-buckets.md` (generated)
- `src/docs/operation/_generated/changelog.md` (appended each build)
- `scripts/generate-operation-docs.ts` — the build-time generator
- `src/components/AdminLayout.tsx` — add **📖 Operation Docs** link under SYSTEM
- `src/App.tsx` — register `/admin/operation-docs` route
- `package.json` — add `prebuild` script

## Dependencies to add

- `react-markdown`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings` — markdown rendering with anchored headings
- `mermaid` — diagram rendering
- `fuse.js` — client-side fuzzy search
- `tsx` (dev) — run the generator script

## What stays read-only

The page never writes — no DB inserts, no settings toggles. It's purely a viewer over markdown shipped with the bundle. To change anything, you ask me in chat as usual; the next build re-runs the generator and the relevant section updates itself.

## Limitations to be aware of

- Generated sections reflect what's in the **codebase at build time**, not live DB state (which is what you actually want — the codebase is the source of truth for migrations).
- "Live row counts" or runtime metrics are NOT included (those would need a live query and would make the page non-read-only). If you want a separate "Live System Stats" panel later, that can be added.
- First page load includes ~200 KB of markdown — fine for admin tooling, fast on subsequent loads (cached).

## Implementation order

1. Add deps + scaffold the viewer page with a "Coming soon" stub and SYSTEM nav link.
2. Write the static markdown sections (Overview, Architecture, Workflows, Glossary, Business Rules).
3. Build the generator script for routes, navigation, edge functions, storage.
4. Build the schema/db-function generator (parses migration SQL).
5. Wire `prebuild`, render Mermaid + search + export.

No removals, no DB changes (except optionally a `docs_changelog` table later if you want persistent changelog — not required for v1). Fully aligned with the Preservation Policy.

**Confirm and I'll build it.**
