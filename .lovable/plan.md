# Country-Aware State Dropdown for All Entry Forms

## Goal
When a non-India country is selected, replace the read-only "Default" state field with a real dropdown of states/provinces/regions for that country. India behavior stays unchanged (existing `INDIAN_STATES` list + Other free-text). Pincode/ZIP behavior stays unchanged (6-digit numeric for India, free-text for others).

## Approach
Use the lightweight `country-state-city` npm package (no API key, fully offline, ~1MB, includes ISO-3166-2 subdivisions for every country).

```ts
import { State } from 'country-state-city';
const states = State.getStatesOfCountry('US'); // [{ name: 'California', isoCode: 'CA', ... }, ...]
```

This avoids hand-maintaining state lists for 30+ countries.

## Changes

### 1. Add dependency
- `country-state-city` (small, MIT, widely used).

### 2. Update `src/components/inputs/CountryStateInput.tsx`
Replace the non-India branch (currently shows read-only "Default" + free-text ZIP) with:
- A **State / Region dropdown** populated via `State.getStatesOfCountry(country)`.
- An **"Other"** option at the bottom that reveals a free-text input (fallback for countries with sparse data, e.g. small island nations).
- Keep the free-text Postal/ZIP field next to it.

If a country has zero states in the dataset (rare), automatically fall back to a single free-text "State / Region" input so the user is never blocked.

When the country changes:
- If new country = `IN` → clear state (user picks from Indian list).
- Else → clear state (user picks from new country's list); never auto-fill "Default" anymore.

### 3. Backwards compatibility
- Existing submissions stored as `state: "Default"` remain valid; we just stop writing that value going forward.
- All four forms (`BookAppointment`, `RegisterWorkshop`, `TellUsAboutYourself`, `ApplyLGT`) already use `<CountryStateInput>` — **no changes needed in the form pages**. The component upgrade flows through automatically.

### 4. Validation
- For non-India: state is **optional** (some users may legitimately have no subdivision, or pick Other and leave blank). ZIP remains free-text.
- Indian validation (6-digit pincode, required state when `required` flag is set) unchanged.

## Files To Edit
- `src/components/inputs/CountryStateInput.tsx` — swap read-only state for dynamic dropdown.
- `package.json` — add `country-state-city` dependency.

## Out of Scope
- No DB changes (state is already a free text field inside `submissions.form_data` / `leads`).
- No changes to the four form pages — the shared component does all the work.
- India behavior, pincode rules, and the `INDIAN_STATES` list stay exactly as they are.
