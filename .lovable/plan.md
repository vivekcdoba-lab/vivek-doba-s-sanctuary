## Goals

Improve `/seeker/profile` (and parity for admin's seeker view) with four fixes:

1. **Linked With** card must show partner's **name + email** (currently shows "—" because RLS blocks reading the partner's profile).
2. Add a **Country** field to the profile (display + edit) and to the address block.
3. If **WhatsApp number = Mobile number**, hide the second WhatsApp input and show a single checkbox "WhatsApp same as Mobile" instead.
4. Convert **Gender** from free-text to a proper **dropdown** (Male / Female / Other / Prefer not to say).

---

## 1. Linked partner name not showing — root cause & fix

The `profiles` table RLS only permits a user to read their **own** row. The query in `useSeekerLinkGroup` joins `seeker:seeker_id(id, full_name, email)`, so the partner's profile is silently filtered out and `p.seeker` is `null`, rendering "—".

**Fix:** add a SECURITY DEFINER RPC that returns minimal public info (id, full_name, email) for any seeker that shares a `seeker_links` group with the caller. Update `useSeekerLinkGroup` to call this RPC instead of the embedded join.

```sql
create or replace function public.get_linked_seekers_basic(_seeker_id uuid)
returns table (id uuid, full_name text, email text, group_id uuid,
               relationship text, relationship_label text)
language sql stable security definer set search_path = public as $$
  select p.id, p.full_name, p.email, sl.group_id,
         sl.relationship::text, sl.relationship_label
  from seeker_links sl
  join profiles p on p.id = sl.seeker_id
  where sl.group_id = (select group_id from seeker_links where seeker_id = _seeker_id limit 1)
    and sl.seeker_id <> _seeker_id;
$$;
```

The hook calls `supabase.rpc('get_linked_seekers_basic', { _seeker_id })` and the card renders `{partner.full_name}` and `{partner.email}` correctly.

---

## 2. Country field

- Add `country` column to `profiles` (text, nullable, default `'India'`).
- Show **Country** in Personal Info grid (both view + edit), positioned just before State.
- Edit mode uses a dropdown sourced from `COUNTRY_CODES` in `src/lib/phoneValidation.ts` (extend list as needed) with India default.
- When country ≠ India: state becomes free-text and pincode becomes "Postal / ZIP" (already supported in `StatePincodeInput` via the "Other" path — wire `country !== 'India'` to force the Other branch).

---

## 3. Single mobile when WhatsApp matches

In `SeekerProfile.tsx`:

- Add local state `whatsappSameAsMobile: boolean`.
- On load: auto-set to `true` if the stored mobile and whatsapp E.164 strings are equal (and non-empty).
- In **edit mode**, render a checkbox **"WhatsApp same as Mobile"** directly under the Phone input. When checked, hide the WhatsApp `PhoneInput` entirely.
- On save: if checked, write `whatsapp = phone` (encrypted whatsapp_enc mirrors phone) so downstream features still work.
- In **view mode**, when both numbers are equal show one row: "Phone / WhatsApp: +91 98xxxxxx". Otherwise show two separate rows as today.

---

## 4. Gender dropdown

Replace the free-text `Field` for Gender with a `<select>` in edit mode:

- Options: `Male`, `Female`, `Other`, `Prefer not to say`.
- View mode keeps the plain `<p>` rendering.
- Same control reused in admin's seeker edit page if it consumes the same component (no admin form change required for this round — only seeker profile).

---

## Files to change

- `supabase/migrations/<new>.sql` — add `country` column to `profiles`; add `get_linked_seekers_basic` RPC.
- `src/lib/phoneValidation.ts` — export `COUNTRIES` list (reuse `COUNTRY_CODES` names) + helper `isIndia(country)`.
- `src/hooks/useSeekerLinks.ts` — switch `useSeekerLinkGroup` to call the new RPC; update return shape.
- `src/pages/seeker/SeekerProfile.tsx`
  - Add `country` to state + load/save.
  - Insert Country dropdown in Personal Info grid.
  - Add "WhatsApp same as Mobile" checkbox + conditional render.
  - Replace Gender input with select.
  - Render linked partner name + email from new hook output.
- `src/components/inputs/StatePincodeInput.tsx` — accept optional `country` prop; force "Other" mode when country !== "India".

No other pages depend on these UI changes; admin pages already read profile fields directly so the new `country` column is automatically available once the migration runs.

---

## Out of scope

- Editing of `seeker_links` from the seeker side (remains admin-only — Preservation Policy).
- Migrating historical mismatched mobile/whatsapp data (only the UI condenses display; data untouched unless user re-saves with checkbox).
