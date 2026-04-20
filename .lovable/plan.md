
## Changes

### 1. WhatsApp prefilled message (visitor-facing)
New copy:
> Hello, I recently explored your website and program details. I'm really interested and would love to understand how the program works and how it can help transform my life.

Update everywhere a public visitor can tap WhatsApp:
- `src/components/WhatsAppSupportButton.tsx` — replace current "Namaste! I need help with the VDTS platform." message
- `src/pages/seo/_SeoLayout.tsx` — `SeoNav` WhatsApp link (currently `text=Hello`)
- `src/pages/Index.tsx` — any `wa.me` links on the landing page
- Any other public pages (BookAppointment, ApplyLGT, RegisterWorkshop, SEO pages) using `wa.me/919607050111` — grep + update consistently

Internal/logged-in usages (if any inside admin/coach/seeker layouts) stay untouched.

### 2. Social media link replacement
Replace old handles with new URLs everywhere:

| Platform  | Old | New |
|-----------|-----|-----|
| YouTube   | `youtube.com/@coachvivekdoba` | `https://www.youtube.com/@VIVEKDOBA` |
| LinkedIn  | `linkedin.com/in/coachvivekdoba/` | `https://www.linkedin.com/in/vivek-doba-life-nlp-success-business-coach/` |
| Instagram | `instagram.com/coachvivekdoba/` | `https://www.instagram.com/vivekdoba/` |
| Facebook  | `facebook.com/coachvivekdoba` | `https://www.facebook.com/askVivekDoba` |

Files to grep + update: `src/pages/seo/_SeoLayout.tsx` footer, `src/pages/Index.tsx` footer, plus any other page referencing the old handles.

### 3. SEO for social media (new)
Add proper social SEO so the new profiles are discoverable and link previews are rich:

**a) `index.html` — site-wide additions in `<head>`:**
- `<meta name="twitter:site" content="@vivekdoba">` and `twitter:creator`
- Additional `og:` tags: `og:locale="en_IN"`
- Inject a `Person` JSON-LD schema with `sameAs` array linking all 4 new social profiles — this is the standard signal Google uses to associate the brand with its social accounts (Knowledge Graph).
- Update the existing `ProfessionalService` JSON-LD to also include `sameAs` with the 4 new URLs.

**b) `public/sitemap.xml`** — verify present (no change needed unless missing entries).

**c) `public/robots.txt`** — ensure social crawlers (facebookexternalhit, Twitterbot, LinkedInBot) are allowed (likely already permitted via wildcard, will verify).

**d) Footer rel attributes** — update social `<a>` tags in `_SeoLayout.tsx` and `Index.tsx` footers to use `rel="noopener noreferrer me"` (the `me` token is the microformats signal that the linked profile belongs to the site owner, complementing `sameAs`).

### Out of scope
- No DB / RLS / auth changes
- No changes to internal seeker/coach/admin layouts
- No new pages
- Phone number `9607050111` stays the same
