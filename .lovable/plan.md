# Testimonials and Golden Triangle Score

## What will be built

- Add a secure `testimonials` collection with name, business, city, photo, quote, YouTube ID, related program, rating, publication status, and stable ordering.
- Rebuild `/testimonials` with the requested H1, program filters, video stories first, written stories second, lazy-loaded media, and an empty state that does not invent testimonials.
- Add `/admin/testimonials` so admins can create, edit, publish, unpublish, and delete stories; photo uploads will use the existing media library and WebP conversion.
- Show each program’s published testimonials on its course page.
- Hide Testimonials from public navigation until at least three stories are published. The direct page URL will remain available.
- Add the Google reviews button using the clearly marked `[GOOGLE BUSINESS PROFILE REVIEW LINK]` placeholder until the real link is supplied.
- Replace the existing `/score` calculator with the requested “Golden Triangle Score: coming soon” page, a WhatsApp button, and `noindex` metadata.

## Data and access

- Public visitors can read only published testimonials.
- Administrators can manage all testimonial records.
- No testimonial rows will be seeded, because only real, permission-approved stories may be shown.

## Verification

- Check desktop and mobile layouts, filtering, media loading, navigation visibility threshold, course matching, admin route wiring, metadata, and type safety.
