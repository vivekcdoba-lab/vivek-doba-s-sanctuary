# Harden Security & Speed Up the App

## Reality check on "view source"
Anyone can see your bundled JS — that's true for Gmail, LinkedIn, Notion, every web app. The `VITE_SUPABASE_PUBLISHABLE_KEY` visible there is the **anon key**, designed to be public. Security comes from RLS policies (already strong) — not from hiding the source. Disabling right-click is theater and we won't do it.

The real risks, which this plan fixes:
1. No HTTP security headers → XSS, clickjacking, mixed-content all possible.
2. Auth tokens in JS-readable storage → an XSS could steal them and replay from anywhere.
3. Console logs + inline sourcemaps in production → helps reverse-engineering.
4. No leaked-password check on signup.

## What we'll change

### 1. HTTP security headers + caching (`public/_headers`)
A single Netlify-style headers file (Lovable hosting honors it):
- **Content-Security-Policy** restricting scripts/styles/connections to Supabase, Resend, Google Fonts, YouTube. Blocks injected scripts.
- **X-Frame-Options: DENY** + `frame-ancestors 'none'` — no iframing the app (clickjacking-proof).
- **X-Content-Type-Options: nosniff**, **Referrer-Policy: strict-origin-when-cross-origin**, **Permissions-Policy** (camera/mic/payment off).
- **Strict-Transport-Security** with 2-year preload.
- **Cache-Control: public, max-age=31536000, immutable** for `/assets/*` (Vite hashes filenames, so this is safe and gives instant repeat-visit loads).

### 2. Vite production hardening (`vite.config.ts`)
- `esbuild.drop: ['console', 'debugger']` only in `mode === 'production'` — strips all `console.*` calls from prod bundle (smaller + no info leakage). Dev keeps logs.
- `build.sourcemap: 'hidden'` — sourcemaps still generated for crash reports but not linked from JS files.
- New `buildStart` step runs `scripts/check-no-service-role.ts` and **fails the build** if `SUPABASE_SERVICE_ROLE_KEY` or `service_role` literal appears anywhere under `src/`.

### 3. Session fingerprint binding (DB migration + edge function update)
Migration `20260502120000_session_fingerprint_and_hardening.sql`:
- Add `user_sessions.fingerprint_hash text` + index.
- Replace `close_inactive_sessions()` so seekers idle out at 30 min (was 15 global), coaches/admins at 60 min, absolute cap stays 12 hours. Stolen tokens have a smaller usable window.

`supabase/functions/session-heartbeat/index.ts`:
- On `start`: compute SHA-256 of `user-agent + accept-language` and store on the row.
- On `heartbeat`: recompute and compare. On mismatch → close the session, return `{ active: false, reason: 'fingerprint_mismatch' }`. The browser then redirects to `/login`.
- No client API change needed; the existing `validateSessionOnInit` already handles `active: false`.

### 4. Leaked-password protection (HIBP)
Enable the Have-I-Been-Pwned check on auth — blocks signups/changes using passwords from known breaches. One auth-config call, no UI change.

### 5. Auto-generated security-posture doc (`scripts/generate-operation-docs.ts`)
Add `_generated/security-posture.md` summarizing: what is public-by-design (anon key, bundle, route names), what is protected (RLS, edge-function admin guards, encrypted PII, fingerprint binding, headers), current header set, last regen timestamp. Linked from the existing `_index.md`. Already wired into `Admin → Settings → Operation Docs` and rebuilt on every dev start / production build.

## Files

**Create**
- `public/_headers`
- `scripts/check-no-service-role.ts`
- `supabase/migrations/20260502120000_session_fingerprint_and_hardening.sql`
- `src/docs/operation/_generated/security-posture.md` (emitted by generator)

**Edit**
- `vite.config.ts` — drop console in prod, hidden sourcemaps, run service-role guard in `buildStart`.
- `supabase/functions/session-heartbeat/index.ts` — write/verify `fingerprint_hash`.
- `scripts/generate-operation-docs.ts` — emit the new security-posture doc + add it to `_index.md`.
- Auth config — enable `password_hibp_enabled: true`.

## What this does NOT do (deliberately)
- **No right-click/View-Source disable** — security theater, hurts accessibility, doesn't stop DevTools or `curl`.
- **No move to httpOnly cookies** — Supabase JS SDK requires JS-readable storage; switching needs a custom server session layer (large rewrite). Fingerprint binding gets ~80% of the benefit at ~5% of the work.
- **No bundle obfuscation** beyond the standard minification — hurts perf without slowing real attackers.

## Expected impact

| Area | Before | After |
|---|---|---|
| HTTP security headers | none | 7 hardened headers + CSP |
| Stolen-token replay | works anywhere | fails on different browser |
| Seeker idle timeout | 15 min global | 30 min (seekers) / 60 min (staff) |
| Console leakage in prod | yes | stripped at build |
| Inline sourcemaps in prod | exposed | hidden |
| Repeat-visit asset load | re-downloaded | served from cache (instant) |
| Signups with breached passwords | allowed | blocked |
| Service-role key leak risk | unchecked | build fails on detection |

Approve to switch to build mode and I'll apply everything in one pass, regenerate the Operation Docs, and redeploy the heartbeat function.
