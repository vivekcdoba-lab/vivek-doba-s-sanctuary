
The user is now reporting WhatsApp (`api.whatsapp.com` / `wa.me`) is blocked in the preview iframe — same root cause as the social links issue: WhatsApp also sends `X-Frame-Options: DENY`, and the Lovable preview iframe sandbox blocks the navigation.

"It was working earlier" — likely because earlier the link opened in the same tab (no `target="_blank"`), or the iframe sandbox behavior changed, or they tested on the published URL.

## Root cause
`wa.me` and `api.whatsapp.com` refuse to be loaded inside iframes. When clicked from inside the Lovable preview iframe, the browser blocks the navigation with `ERR_BLOCKED_BY_RESPONSE`.

## Fix
Force the WhatsApp link to break out of the iframe to the top-level browser window. Two reliable techniques:

1. **Add `onClick` handler that uses `window.open(url, '_blank', 'noopener')`** — this opens in a new top-level tab, bypassing iframe sandbox restrictions reliably.
2. **Or set `target="_top"`** on the anchor — forces navigation in the topmost window.

Best approach: keep `target="_blank"` for normal browsing, but add an `onClick` that calls `window.top.open(url, '_blank')` as a fallback so it always escapes the iframe in the preview.

## Files to update

WhatsApp links exist in:
- `src/components/WhatsAppSupportButton.tsx` — floating support button
- `src/pages/seo/_SeoLayout.tsx` — SeoNav WhatsApp button
- `src/pages/Index.tsx` — landing page WhatsApp CTAs
- `src/pages/BookAppointment.tsx`, `src/pages/ApplyLGT.tsx`, `src/pages/LoginPage.tsx` — any wa.me links

I'll add a small helper `openWhatsApp(message)` that uses `window.open(url, '_blank', 'noopener,noreferrer')` and wire it into the click handlers via `onClick`. The `<a href>` stays as graceful fallback for crawlers and right-click "open in new tab".

## Out of scope
- No DB / RLS / auth changes
- No copy changes (message text stays the same)
- The published site (vivekdoba.com) already works — this fix specifically makes the preview iframe work too
