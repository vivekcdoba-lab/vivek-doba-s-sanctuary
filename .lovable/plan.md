

## Plan: Enforce Unique & NOT NULL on Email and Phone

### Problem
- `profiles.phone` is currently nullable with no uniqueness constraint
- `profiles.email` is NOT NULL but has no unique index
- No validation prevents duplicate email or phone during registration or profile editing

### Database Migration

```sql
-- Fill any existing NULL phones
UPDATE public.profiles SET phone = '' WHERE phone IS NULL;

-- Make phone NOT NULL
ALTER TABLE public.profiles ALTER COLUMN phone SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN phone SET DEFAULT '';

-- Unique index on email (one per account)
CREATE UNIQUE INDEX profiles_email_unique ON public.profiles (email);

-- Unique index on phone (exclude empty strings so multiple unset phones are allowed)
CREATE UNIQUE INDEX profiles_phone_unique ON public.profiles (phone) WHERE phone != '';
```

Update `handle_new_user` trigger to include phone:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user() ...
  INSERT INTO public.profiles (user_id, email, full_name, role, phone)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'seeker'),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
```

### Registration Page (`RegisterPage.tsx`)

Before calling `supabase.auth.signUp`, query profiles:
- Check email: `SELECT id FROM profiles WHERE email = ?`
- Check phone: `SELECT id FROM profiles WHERE phone = ?`
- If email exists → toast: **"This email is already registered. Please sign in or use a different email."**
- If phone exists → toast: **"This mobile number is already in use. Please use a different number."**
- Block registration if either matches

### Admin Add Seeker (`SeekersPage.tsx`)

Same pre-check in the Add Seeker dialog — query profiles for matching email or phone before proceeding. Show specific alert for whichever field is duplicated.

### Seeker Profile Edit (`SeekerProfile.tsx`)

Wrap the `.update()` call with error handling for Postgres error code `23505` (unique violation):
- If error message contains `profiles_email_unique` → toast: **"This email is already used by another account."**
- If error message contains `profiles_phone_unique` → toast: **"This mobile number is already used by another account."**

### Files Changed

| File | Change |
|------|--------|
| Migration SQL | NOT NULL + unique indexes on phone/email, updated trigger |
| `src/pages/RegisterPage.tsx` | Pre-signup duplicate check for email and phone |
| `src/pages/admin/SeekersPage.tsx` | Pre-check in Add Seeker dialog |
| `src/pages/seeker/SeekerProfile.tsx` | Catch unique constraint errors with friendly messages |

