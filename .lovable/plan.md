# Add Country + Smart State/ZIP to All Entry Forms

## Goal
Every public entry form should capture **Country** alongside **State** and **Pincode/ZIP**, with this behaviour:
- **Country = India** → State = dropdown of Indian states + "Other" (free-text), Pincode = 6 digits
- **Country ≠ India** → State auto-set to "Default" (read-only), Postal/ZIP = free-text

Good news: a reusable `CountryStateInput` component already exists at `src/components/inputs/CountryStateInput.tsx` that does exactly this (30+ countries, India special-case, Other state, free-text ZIP for non-India). We will plug it into the four forms.

## Forms To Update

### 1. Discovery Call — `src/pages/BookAppointment.tsx`
Currently has only `city` (no country/state/pincode).
- Add `country`, `state`, `pincode` to form state (default `country: 'IN'`).
- Insert `<CountryStateInput>` right after the City field.
- Persist into `submissions.form_data` (JSON) — no DB change needed.

### 2. Book Workshop — `src/pages/RegisterWorkshop.tsx`
Currently has city + a hard-coded India-only state dropdown + pincode, no country field.
- Remove inline `STATES` constant and the manual State + "Other" + Pincode JSX block.
- Add `country` (default `'IN'`) to form state; replace the State/Pincode block with `<CountryStateInput>`.
- Continue saving into `submissions.form_data`.

### 3. Tell Us About Yourself — `src/pages/TellUsAboutYourself.tsx`
Currently has only `city`.
- Add `country`, `state`, `pincode` state (default `country: 'IN'`).
- Add `<CountryStateInput>` after the City field.
- Save inside `form_data` on the existing `submissions` insert.

### 4. Apply for LGT — `src/pages/ApplyLGT.tsx`
Currently has hard-coded India-only `STATES`, separate `country` text field defaulting to `'India'`, plus city/state/stateOther/pincode.
- Replace the inline Country text input + manual State dropdown + pincode block with a single `<CountryStateInput>`.
- Migrate `f.country` from `'India'` → `'IN'` (ISO code, matching component contract).
- Update validation in `validateRequired()`:
  - Drop `stateOther` branch (component handles it; state value itself becomes the typed text).
  - Pincode requirement only when country is `'IN'`.
- Keep `city`, `address1`, `address2`, `hometown` untouched.

## Shared Component (already exists, no changes)
`src/components/inputs/CountryStateInput.tsx` exposes:
```tsx
<CountryStateInput
  country={country} state={state} pincode={pincode}
  onCountryChange={...} onStateChange={...} onPincodeChange={...}
  required
/>
```
Internally it renders `StatePincodeInput` for India and a "Default" state + free-text ZIP for everything else.

## Data Storage
- `submissions.form_data` is JSON — `country`, `state`, `pincode` go in there for forms 1–3 and ApplyLGT. No migration required.
- `leads.country` column already exists (used by AdminAddLead).

## Validation Notes
- Indian pincode: 6 digits, cannot start with 0 (existing `validatePincode` helper).
- Non-India ZIP: free text, max 12 chars (component already enforces).
- For ApplyLGT, "state" field is required when country = IN; for non-IN it's auto-"Default" and skipped in required-fields check.

## Out of Scope
- No DB schema changes.
- AdminAddLead already has country handling — leaving as-is unless you want it switched to the same shared component (can do in a follow-up).
- No styling changes beyond the new field placement.

## Files To Edit
- `src/pages/BookAppointment.tsx`
- `src/pages/RegisterWorkshop.tsx`
- `src/pages/TellUsAboutYourself.tsx`
- `src/pages/ApplyLGT.tsx`
