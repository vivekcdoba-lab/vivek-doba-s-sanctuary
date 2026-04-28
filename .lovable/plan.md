# Fix: "Save Fee Structure" foreign key error

## Problem
Saving a Fee Structure (or Premium Agreement) on Admin → Seeker → Documents fails with:
> insert or update on table "agreements" violates foreign key constraint "agreements_client_id_fkey"

The `agreements.client_id` column has a foreign key pointing to the legacy `clients` table, but the admin Seeker Documents flow passes the seeker's **profile id** (from `profiles`). That id doesn't exist in `clients`, so the insert is rejected.

The `agreements` table is currently empty, so we can safely re-point the FK without data migration.

## Fix
Change the foreign key on `agreements.client_id` to reference `profiles(id)` instead of `clients(id)`. This matches what the Fee Structure / Premium Agreement code already passes (the seeker's profile id) and aligns with the rest of the seeker-centric admin module.

## Technical Details
- Run a migration that:
  - Drops `agreements_client_id_fkey`
  - Re-adds it as `FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE`
- No code changes needed in `useFeeStructure.ts` — it already passes `seekerId` (a profile id).
- No data backfill required (table is empty).
- Existing `agreements_type_check` (allowing `coaching`, `goal`, `fee_structure`, `premium_agreement`) is untouched.

## Verification
After the migration, saving Fee Structure / Premium Agreement from the Admin Seeker Documents tab will succeed and the row will load back via the existing query (`client_id = seekerId`, `type = 'fee_structure'`).
