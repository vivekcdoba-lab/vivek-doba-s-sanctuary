# Site-wide header, footer, and trust claim consistency

## Header
- Update the shared public header while preserving its current colors, typography, logo text, sticky behavior, and scroll shadow.
- Keep the desktop header in two rows to prevent overlap:
  - Top row: linked “Vivek Doba Business Mastery” logo and a small Login text link.
  - Navigation row: About Us, Courses with the existing mega-menu, Shop, Gallery, Blog, Contact Us; every tab uses a Lucide icon.
  - Right side: linked phone `9607050111`, WhatsApp, and one primary “Book a diagnostic” action using the existing deep-saffron semantic color and the exact diagnostic WhatsApp message.
- Keep mobile compact: logo, diagnostic action, hamburger; include all tabs, phone, WhatsApp, and Login in the drawer.
- Ensure the mega-menu opens below the complete header and the layout does not overlap or overflow at intermediate widths.

## Trust claims
- Remove the listed unverifiable claims and close variants from public-facing source content.
- Replace the homepage trust display with:
  - `840+` — `Google & client reviews`
  - `Since 1998` — `Coaching business owners`
- Hide the third statistic until a verified number and label are supplied.
- Update public metadata or other public references to the review count so the site does not show conflicting numbers.

## Footer and business details
- Keep the shared four-column footer and set its semantic tokens to the requested warm brown `#2B1A10` and text `#E9DCCF`.
- Brand column: linked logo, both supplied lines, and accessible YouTube, Instagram, Facebook, and LinkedIn icons.
- Programs column: links to every course page.
- Explore column: always show About Us, Shop, Gallery, Blog, Testimonials, Contact Us, and Golden Triangle Score.
- Visit us column: use the existing verified shared business constants for the exact business name, full Pune address, phone, WhatsApp, and `info@vivekdoba.com`; hide hours while the shared hours value is empty; build directions from that exact address.
- Keep the 2026 bottom bar and existing Privacy, Terms, and Refund Policy pages; do not replace their current content with new placeholders.
- Make the Contact page and JSON-LD consume the same shared name, address, and phone text as the footer, including a structured postal address derived from that exact address rather than a shortened variant.

## Verification
- Search public source files again for banned claims and conflicting review counts.
- Verify header links, Courses mega-menu, mobile drawer, phone, WhatsApp, diagnostic message, footer links, and policy routes.
- Check the homepage, Contact page, and shared footer at desktop and 390px mobile widths for overlap and horizontal scrolling.
- Run focused type checks and tests available for the changed presentation code.

## Pending content
- Opening hours remain hidden until you provide the exact hours.
- The third homepage statistic remains hidden until you provide its verified number and label.
