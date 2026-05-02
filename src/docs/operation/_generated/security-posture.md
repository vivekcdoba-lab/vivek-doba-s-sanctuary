# Security Posture

_Generated: 2026-05-02T18:20:51.656Z_

_Auto-generated. Edit `scripts/generate-operation-docs.ts` to change._

## Public by design (visible in browser source — this is normal)

- The bundled JavaScript (every web app exposes this).
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key). The anon key is meant to be public; it has no privileges beyond what RLS allows.
- Route paths and component names.

## Protected (cannot be derived from source)

- Database rows — gated by RLS on every table.
- Service-role key — only in edge function secrets; build fails if it appears in `src/` (`scripts/check-no-service-role.ts`).
- PII (email/phone) — encrypted at rest with rotating DEKs.
- Privileged operations — only callable from edge functions that validate an admin JWT or the `CRON_SECRET` header.

## Session security

- **Fingerprint binding**: each `user_sessions` row stores SHA-256(user-agent + accept-language). Heartbeat re-checks every cycle; mismatch closes the session.
- Idle timeouts: seekers 30 min, coaches/admins 60 min. Absolute cap 12 h.
- Single-device enforcement for seekers.

## HTTP security headers (`public/_headers` excerpt)

```
# Security & cache headers (Lovable static hosting honors this Netlify-style file).
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(self), payment=(), usb=(), interest-cohort=()
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  Cross-Origin-Opener-Policy: same-origin
  X-DNS-Prefetch-Control: on
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.lovable.app https://*.lovable.dev; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; media-src 'self' blob: https://*.supabase.co https://storage.googleapis.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com https://www.google-analytics.com; frame-src 'self' https://www.youtube.com https://youtube.com https://www.google.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests

# Vite-hashed immutable assets — cache aggressively
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/manifest.json
  Cache-Control: public, max-age=300

/*.html
  Cache-Control: public, max-age=0, must-revalidate
```

## Production build hardening

- `esbuild.drop: ['console', 'debugger']` — no `console.*` in prod bundle.
- `build.sourcemap: 'hidden'` — sourcemaps generated for crash reports but not linked from JS.
- Service-role guard runs at `buildStart`.

## Manual one-time setup (super admin)

- Enable **Leaked Password Protection (HIBP)** in Cloud → Users → Auth Settings → Email settings.
