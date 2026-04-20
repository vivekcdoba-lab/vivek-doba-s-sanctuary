
The user is reporting that clicking the social links shows "blocked / refused to connect / ERR_BLOCKED_BY_RESPONSE". This is **not** a code bug — it's the browser refusing to load Instagram/YouTube/Facebook **inside the Lovable preview iframe**.

Why: Instagram, YouTube, and Facebook send `X-Frame-Options: DENY` / `Content-Security-Policy: frame-ancestors` headers that prevent them from being embedded in any iframe (including the Lovable preview). When the user clicks a link inside the preview, the new tab is constrained by the iframe's sandbox, so the browser blocks the navigation.

The links work correctly when:
- The site is opened in its own tab (published URL `vivekdoba.com` or `vivek-doba-portal.lovable.app`)
- Opened directly outside the Lovable editor preview

## Fix
Make the social links break out of the iframe by adding `target="_blank"` (already there) **plus** ensuring the click opens in the top-level window. The cleanest fix: add `rel="noopener noreferrer me"` (already done) and explicitly set `target="_blank"` — which is already in place.

The remaining issue is the **preview iframe sandbox**. To make links reliably escape the iframe in the preview, we should ensure all social `<a>` tags have `target="_blank"`. They already do.

So the actual user action: **open the published site, not the preview**. No code change is strictly required — but to make this bulletproof I'll:

1. Audit `src/pages/Index.tsx` and `src/pages/seo/_SeoLayout.tsx` social `<a>` tags to confirm every one has `target="_blank" rel="noopener noreferrer me"`.
2. If any are missing, add them.

## Files to verify (read-only audit, then targeted edits if gaps found)
- `src/pages/Index.tsx` — landing page footer social icons
- `src/pages/seo/_SeoLayout.tsx` — already confirmed `target="_blank" rel="noopener noreferrer me"` ✓

## What I'll tell the user
The links are correct — the "blocked" error is the Lovable preview iframe sandbox, not the code. Verify on the **published URL** (`https://vivekdoba.com` or open in a new browser tab) where the links work normally.

No DB / auth / RLS changes. No feature changes.
