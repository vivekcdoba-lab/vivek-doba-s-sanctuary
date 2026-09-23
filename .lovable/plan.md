# Public Content Pages and Admin Management

## What will be built

- Create one shared public header used by the homepage and the six new public sections.
- Place a sticky six-tab bar directly below the existing top header, ordered: About Us, Courses, Shop, Gallery, Blog, Contact Us.
- Use the requested Lucide icons, active gradient underline, warm cream surface, soft gold divider, subtle sticky shadow, and a horizontally scrollable mobile pill row.
- Add a short fade-in transition when navigating between public pages.

## Public pages

- **About Us:** bio, mission, Life's Golden Triangle philosophy, journey timeline, and the 30,000+ / 1,000+ / 20+ achievements. Missing details will be visibly marked as placeholder content.
- **Courses:** public cards loaded from the existing course records, extended with image and public description fields. Cards show duration, price or FREE, and an Enroll Now action.
- **Shop:** database-driven books, merchandise, and digital products with a working cart. Checkout sends a prepared order summary to WhatsApp, as selected.
- **Gallery:** database-driven photos and videos stored in a dedicated media area, with Events, Seminars, Workshops, and Testimonials filters plus an accessible lightbox.
- **Blog:** database-driven post listing and `/blog/:slug` detail pages, with draft/published status and publish dates.
- **Contact Us:** save name, email, phone, and message securely; show the supplied phone, WhatsApp, email, office address, and an embedded map.

## Admin management

- Add admin pages to create, edit, publish/hide, and delete products, gallery items, and blog posts.
- Extend the existing course manager with public image, description, price visibility, and delete controls rather than creating a second course system.
- Add the new managers under the existing Content section in the admin navigation.
- Move the current admin course route to `/admin/courses` so `/courses` can become the requested public page; update all admin links accordingly.

## Data and security

- Reuse the existing `courses` table and add only the public presentation fields it lacks.
- Add focused tables for products, gallery items, blog posts, and contact messages.
- Public visitors can read only active/published content and submit contact messages; only admins can manage content or read submissions.
- Add dedicated public media storage for course, shop, gallery, and blog images, with admin-only uploads and public reads.
- Keep roles in the existing protected role/profile system and use the existing server-validated admin check.

## Preservation and verification

- Do not alter the current homepage hero, “Begin Your Transformation,” WhatsApp/support actions, or email setup.
- Preserve all existing homepage sections below the new navigation.
- Verify the public routes, active-tab state, sticky/mobile behavior, WhatsApp cart summary, gallery lightbox, contact save, admin CRUD permissions, and existing homepage at desktop and mobile sizes.

## Technical details

- React Router will use a shared public layout with nested public routes and an outlet-based page transition.
- TanStack Query will load and refresh public/admin content.
- Database changes will be applied as one reviewed migration with grants, row-level rules, indexes, update timestamps, and storage access policies.
- Existing design tokens and Button/form components remain authoritative; new presentation uses semantic tokens rather than hardcoded component colors.
