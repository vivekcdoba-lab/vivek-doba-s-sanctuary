
Two tasks:

**1. Clear revenue data**
- `DELETE FROM public.payments;` via insert tool
- All revenue dashboards (`/admin/revenue`, `/admin/business-metrics`, `/admin/invoices`, `/admin/overdue-payments`, `SeekerPayments`) reset to ₹0 / empty
- No schema changes

**2. Fix wrong coach count on `/dashboard`**

Need to inspect `src/pages/admin/Dashboard.tsx` to find the source of "8 coaches". Likely either:
- Hardcoded mock data, or
- Counting wrong field (e.g. counting all non-seeker profiles as coaches, or pulling from `mockData.ts`)

Fix approach: replace any hardcoded/mock counts with live Supabase queries on `profiles` table grouped by `role`:
- Admins: `role = 'admin'`
- Coaches: `role = 'coach'`
- Seekers: `role = 'seeker'`

Use `useQuery` pattern already used in `AdminBusinessMetrics.tsx` and `AdminUserGrowth.tsx` for consistency.

**Files to modify**
- `src/pages/admin/Dashboard.tsx` — replace mock counts with live role-based counts from `profiles`

**Won't do**
- No deletion of coach accounts (none exist)
- No schema changes
- No changes to other dashboards
