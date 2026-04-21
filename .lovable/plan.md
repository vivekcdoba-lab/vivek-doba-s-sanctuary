

## Goal
Apply the "State = Other → Pincode is free-text up to 10 chars, no validation" rule **everywhere** pincode is captured, not just `/apply-lgt`. When State is an Indian state, the existing 6-digit numeric pincode rule still applies.

## Single source of truth

The shared `StatePincodeInput` component is already used by all standardized forms. Updating it once propagates the behavior to every consumer automatically.

## Changes

**`src/components/inputs/StatePincodeInput.tsx`**
- Compute `isOther = !!state && !INDIAN_STATES.includes(state)` (already present).
- Conditional pincode input:
  - `isOther === true` → free-text `<Input>` with `maxLength={10}`, no `inputMode="numeric"`, no `sanitizePincode`, placeholder `"Postal / ZIP code"`. Pass raw value sliced to 10 chars to `onPincodeChange`.
  - `isOther === false` → keep current digits-only, max 6, `sanitizePincode`, placeholder `"6-digit pincode"`.

**`src/lib/phoneValidation.ts`**
- Extend `validatePincode(pin, isOther?)`. When `isOther === true`, return `null` (skip 6-digit India rule). Default behavior preserved → existing call sites unaffected.

**Consumer call sites** — pass `isOther` into validation at submit time:
- `src/pages/ApplyLGT.tsx`
- `src/pages/admin/AdminAddUser.tsx`
- `src/pages/seeker/SeekerProfile.tsx`
- Any other form found via grep on `validatePincode(` — update to `validatePincode(pin, state && !INDIAN_STATES.includes(state))`.

Forms that don't validate pincode at submit (only rely on the input component) need no changes — the component already enforces the new behavior.

## Out of scope
- DB schema changes — `pincode` column is already free-text on every table.
- Backfill of existing pincode values.
- International pincode format-specific validation (UK, US, etc.) — accept any 10-char string.

## Smoke test
1. `/apply-lgt`, State=Maharashtra, Pincode `400001` → submits OK.
2. `/apply-lgt`, State=Maharashtra, Pincode `0000` → rejected.
3. `/apply-lgt`, State=Other "London", Pincode `SW1A 1AA` → submits OK.
4. `/admin/add-user`, State=Other "Dubai", Pincode `12345` → submits OK; Pincode 11 chars → hard-capped at 10.
5. `/seeker/profile`, State=Other "Singapore", Pincode `238801` → submits OK; legacy India seeker still validated 6-digit.
6. Any Indian state across all forms → existing 6-digit numeric rule still enforced.

