# Performance Investigation — App Feels Slow

## Findings

After inspecting the codebase, the slowness is almost entirely due to **all 233 routes/pages being eagerly imported in `src/App.tsx`** (510 lines, ~150 page components from `src/pages/admin`, `src/pages/seeker`, `src/pages/coaching`). Every page — including heavy ones using `recharts`, `html2canvas`, and `jspdf` — is loaded into the **initial JS bundle** before the app renders, even when the user only visits `/`.

### Specific bottlenecks
1. **No code-splitting**: 0 uses of `React.lazy()` in `App.tsx`. ~233 static imports.
2. **Heavy libs in initial bundle**: `html2canvas` (~200KB), `jspdf` (~350KB), `recharts` (~400KB) loaded on first paint even though only used on a few pages (LGT report, assessment history, progress charts, session PDF).
3. **PDF libraries imported eagerly** in `src/lib/lgtPdfExport.ts` and `src/lib/lgtReportEmail.ts` (used by LGT pages) — pulled in by anyone touching the admin LGT routes.
4. Layouts, auth store, and heartbeat are fine — the main cost is the massive initial JS payload.

## Plan

### 1. Convert all route components in `App.tsx` to `React.lazy()`
- Wrap every `import X from "./pages/..."` for route components into `const X = lazy(() => import("./pages/..."))`.
- Wrap `<Routes>` in a `<Suspense fallback={<LoadingSpinner />}>` boundary using a lightweight inline spinner (reuse existing `Loader2` from lucide).
- Keep eagerly imported: `Index`, `LoginPage`, `AuthGuard`, `AdminLayout`, `SeekerLayout`, `CoachingLayout` (needed immediately for first paint and routing shell).

Expected impact: **initial bundle drops from ~3–4MB to ~400–600KB**, first load 3–5× faster, route changes load on-demand (~50–150KB each).

### 2. Lazy-load heavy PDF libraries inside helpers
- In `src/lib/lgtPdfExport.ts`, `src/lib/lgtReportEmail.ts`, `src/lib/sessionPdfExport.ts`: change top-level `import jsPDF from "jspdf"` and `import html2canvas` to **dynamic `await import()`** inside the export functions.
- Same for `LgtReport.tsx` if it imports them statically.

Expected impact: removes ~550KB from any bundle that doesn't actually click "Generate PDF".

### 3. Verify
- After changes, open the app, watch network tab — initial JS should be a single small chunk + per-route chunks loading on navigation.
- Confirm LGT PDF generation still works end-to-end.

## Files to edit
- `src/App.tsx` — convert imports to `lazy()`, add `<Suspense>` wrapper.
- `src/lib/lgtPdfExport.ts`
- `src/lib/lgtReportEmail.ts`
- `src/lib/sessionPdfExport.ts`
- `src/components/lgt/LgtReport.tsx` (only if it imports html2canvas/jspdf statically)

No DB/schema changes. No feature changes. Pure performance optimization, fully aligned with the "Only Add and Enhance" preservation policy.
