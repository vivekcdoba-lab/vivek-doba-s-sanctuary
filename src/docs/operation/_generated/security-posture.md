# Security Posture

_This file is regenerated on every dev start and production build by `scripts/generate-operation-docs.ts`._

## Public by design (visible in browser source — this is normal)

- The bundled JavaScript (every web app exposes this).
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key). The anon key is meant to be public; it has no privileges beyond what RLS allows.
- Route paths and component names.

## Protected (cannot be derived from source)

- Database rows — gated by Row-Level Security policies on every table.
- Service-role key — lives only in edge function secrets; a build-time guard (`scripts/check-no-service-role.ts`) fails the build if it ever appears in `src/`.
- PII (email/phone) — encrypted at rest with rotating DEKs.
- Privileged operations — only callable from edge functions that validate an admin JWT or the `CRON_SECRET` header.

## Session security

- Access tokens stored in `sessionStorage` (or `localStorage` only if "Remember me" was checked).
- **Fingerprint binding**: each `user_sessions` row stores `SHA-256(user-agent + accept-language)`. The heartbeat re-checks every cycle; mismatch → session closed, force re-login.
- Idle timeouts: seekers 30 min, coaches/admins 60 min. Absolute cap 12 h.
- Single-device enforcement for seekers — login on a new device closes prior active sessions.

## HTTP security headers (`public/_headers`)

- `Content-Security-Policy` — restricts script/style/connect/frame origins.
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.
- `X-Frame-Options: DENY` + `frame-ancestors 'none'` — clickjacking-proof.
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` disables camera, microphone, payment, USB by default.
- `/assets/*` → `Cache-Control: public, max-age=31536000, immutable` (Vite hashes filenames).

## Production build hardening

- `esbuild.drop: ['console', 'debugger']` — no `console.*` calls reach prod bundle.
- `build.sourcemap: 'hidden'` — sourcemaps generated for crash reports but not linked from JS.
- `serviceRoleGuardPlugin` runs at `buildStart` and aborts the build on any service-role reference.

## What we deliberately do NOT do

- Disable right-click / View Source — security theater; doesn't stop DevTools or `curl`.
- Move tokens to httpOnly cookies — Supabase JS SDK requires JS-readable storage; switching needs a custom server session layer.
- Custom JS obfuscation beyond standard minification — hurts perf without slowing real attackers.

## Manual one-time setup (super admin)

- Enable **Leaked Password Protection (HIBP)** in Cloud → Users → Auth Settings → Email settings.
