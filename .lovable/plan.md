# Fix: "Failed to fetch dynamically imported module"

## What's happening

When we shipped code-splitting, every page became a separately hashed JS file (e.g. `Dashboard-BoI3dEFX.js`). Each new publish generates **new hashes**. If a user has the app open (or their browser cached the old `index.html`) when you publish, their browser still asks for the **old chunk filename** — which no longer exists on the server. Result: a hard error and a blank/broken screen.

This is expected behavior with code-splitting + any deploy, and the standard fix is a one-time auto-reload when this specific error is detected.

## Plan

### 1. Wrap every `lazy(() => import(...))` with a retry-then-reload helper

Add a small helper `lazyWithReload()` in `src/App.tsx` that:
- Tries the dynamic `import()` once.
- On failure (network/missing chunk), checks `sessionStorage` for a "already retried" flag.
- If not retried yet: sets the flag and calls `window.location.reload()` — the browser fetches the fresh `index.html` with the new chunk hashes, and the user lands back on the same page seamlessly.
- If already retried (rare — server actually broken): rethrows so the existing `ErrorBoundary` shows the friendly error UI.

Replace all ~150 `lazy(() => import("..."))` calls with `lazyWithReload(() => import("..."))`. Pure mechanical change, zero behavior change for normal users.

### 2. Add `<link rel="modulepreload">` cache-busting via Vite's built-in behavior (no config needed)

Vite already emits hashed filenames and an updated `index.html` on every build, so once step 1 is in place, the recovery is automatic.

### 3. Optional: surface a tiny toast on reload

After the auto-reload, show a one-time toast: "Updated to the latest version." (Read flag from `sessionStorage`, then clear.) Skipping unless you want it.

## Technical details

```ts
// src/App.tsx
const RELOAD_KEY = "vdts:chunk-reload";

function lazyWithReload<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err: any) {
      const msg = String(err?.message || err);
      const isChunkErr =
        msg.includes("Failed to fetch dynamically imported module") ||
        msg.includes("Importing a module script failed") ||
        msg.includes("error loading dynamically imported module");
      if (isChunkErr && !sessionStorage.getItem(RELOAD_KEY)) {
        sessionStorage.setItem(RELOAD_KEY, "1");
        window.location.reload();
        // Return a never-resolving promise so React doesn't render before reload
        return new Promise(() => {}) as any;
      }
      throw err;
    }
  });
}
```

Then bulk-replace `lazy(() =>` → `lazyWithReload(() =>` across `src/App.tsx`.

## Files to edit

- `src/App.tsx` — add helper, swap all `lazy()` calls.

## Out of scope / not needed

- No DB changes.
- No `vite.config.ts` changes.
- No Service Worker (none currently configured for chunk caching).
- No feature changes — fully aligned with "Only Add and Enhance".

## Result

After this change, any user who has the old version open during a publish will, on their next navigation, get a single silent reload and land on the new version instead of seeing a broken page.
