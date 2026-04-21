

## Goal
Standardize every mobile/WhatsApp input across the app to: **Country Code dropdown (default 🇮🇳 +91) + 10-digit national number**, and standardize every address block to: **City + State (dropdown of Indian states + "Other") + free-text "Other state" + 6-digit Pincode**. Storage normalizes to E.164 (e.g. `+919876543210`).

## Scope — every entry point that touches phone/state/pincode

**Already standardized (reference pattern — leave intact):**
`ApplyLGT.tsx`, `RegisterWorkshop.tsx`, `BookAppointment.tsx` (these already use a country-code select + 10-digit input).

**To be upgraded:**

| File | Current | Action |
|---|---|---|
| `src/pages/RegisterPage.tsx` | bare phone + whatsapp inputs | Add CC dropdown for both, 10-digit cap, persist `country_code` |
| `src/pages/admin/AdminAddLead.tsx` | `phone` text only | Add CC dropdown + 10-digit input |
| `src/pages/admin/LeadsPage.tsx` (quick-add modal) | `phone` text | Same |
| `src/pages/admin/AdminAddUser.tsx` | `phone` + free-text `state` + no pincode | CC+phone, State dropdown+Other, add Pincode (6 digits) |
| `src/pages/admin/SeekersPage.tsx` (add dialog) | `phone` text | CC + phone |
| `src/pages/seeker/SeekerProfile.tsx` | `phone`, `whatsapp`, `state`, `pincode` plain | CC for phone+whatsapp, State dropdown+Other, 6-digit pincode |
| `src/components/SendReminderModal.tsx` (if collects phone) | check & upgrade | Same |
| Any seeker intake / admin edit dialog touching phone | search-and-upgrade | Same |

## Two new shared components (single source of truth)

1. **`src/components/inputs/PhoneInput.tsx`**
   - Props: `countryCode`, `phone`, `onCountryCodeChange`, `onPhoneChange`, `label`, `required`
   - Country list: 🇮🇳 +91 (default), 🇺🇸 +1, 🇬🇧 +44, 🇦🇪 +971, 🇸🇬 +65, 🇦🇺 +61, 🇨🇦 +1, 🇩🇪 +49, 🇫🇷 +33, 🇸🇦 +966, 🇶🇦 +974, 🇰🇼 +965, 🇴🇲 +968, 🇳🇿 +64, 🇿🇦 +27, 🇲🇾 +60, 🇹🇭 +66, 🇯🇵 +81, 🇨🇳 +86, 🇧🇷 +55 (~20 common)
   - Sanitizes to digits, hard-caps at 10 for +91, 15 for others
   - Helper export: `toE164({code, phone}) → string`, `parseE164(stored) → {code, phone}`

2. **`src/components/inputs/StatePincodeInput.tsx`**
   - State dropdown: 28 Indian states + 8 UTs + "Other" (when "Other" selected, free-text input appears)
   - Pincode: digits-only, max 6, validates `/^[1-9]\d{5}$/`
   - Props: `state`, `stateOther`, `pincode`, `onChange` callbacks

Both use existing `Input` / native `select` for zero new deps.

## Storage strategy (no schema change required)

- `profiles.phone` & `profiles.whatsapp`: store **E.164** string (`+919876543210`). On read, `parseE164` splits back into dropdown + input.
- New columns are NOT needed — `country_code` already exists on `submissions`. For `profiles` we encode it inline. Avoids migration risk.
- `profiles.state`: when user picks "Other", we store the typed value directly (current schema already free-text). The dropdown UX is purely client-side.
- `profiles.pincode`: text column already exists; just add 6-digit validation.
- `leads.phone`: store E.164.

## Validation rules (centralized in `src/lib/phoneValidation.ts` — new)

- `+91` → exactly 10 digits, must start 6/7/8/9
- Other codes → 7–15 digits (E.164 max)
- Pincode (India) → exactly 6 digits, first digit 1-9
- All forms call `validatePhone(code, phone)` and `validatePincode(pin)` before submit; show inline toast errors

## Implementation phases

**Phase 1 — Shared primitives**
- Create `src/lib/phoneValidation.ts` (constants, validators, E.164 helpers, Indian states list)
- Create `src/components/inputs/PhoneInput.tsx`
- Create `src/components/inputs/StatePincodeInput.tsx`

**Phase 2 — Auth + public forms**
- `RegisterPage.tsx`: replace phone & WhatsApp inputs with `<PhoneInput>`; submit E.164 strings; same `country_code` field on `submissions` insert.

**Phase 3 — Admin lead/user/seeker entry**
- `AdminAddLead.tsx`, `LeadsPage.tsx` quick-add: `<PhoneInput>`
- `AdminAddUser.tsx`: `<PhoneInput>` + `<StatePincodeInput>`
- `SeekersPage.tsx` add dialog: `<PhoneInput>`

**Phase 4 — Seeker profile**
- `SeekerProfile.tsx`: load → `parseE164` to hydrate dropdown; save → `toE164`. Replace `state` text field with `<StatePincodeInput>`.

**Phase 5 — Cleanup pass**
- Grep remaining `placeholder="Phone"` / bare phone inputs (intake forms, modals, coach-side seeker edit if any) → swap to `<PhoneInput>`.

## Out of scope
- Backfilling existing plaintext phone numbers in DB to E.164 (display layer falls back to raw value if no `+` prefix → renders India default).
- International pincode formats (only India 6-digit enforced; other countries leave free-text).
- Search/filter UIs (search inputs accept any substring — no change).
- Encrypted `phone_enc` (already covered by prior encryption plan; this change happens in plaintext columns the encryption layer reads from).

## Files to be created / modified

**New**
- `src/lib/phoneValidation.ts`
- `src/components/inputs/PhoneInput.tsx`
- `src/components/inputs/StatePincodeInput.tsx`

**Modified**
- `src/pages/RegisterPage.tsx`
- `src/pages/admin/AdminAddLead.tsx`
- `src/pages/admin/LeadsPage.tsx`
- `src/pages/admin/AdminAddUser.tsx`
- `src/pages/admin/SeekersPage.tsx`
- `src/pages/seeker/SeekerProfile.tsx`
- Plus any other phone/state inputs found during Phase-5 sweep

## Smoke test
1. Register new user with `+1` and 10 digits → submission row shows `country_code='+1'`, `mobile='5551234567'`.
2. Admin adds lead with default `+91 9876543210` → DB stores `+919876543210`.
3. Add seeker with state=Maharashtra, pincode 400001 → saved correctly; UI re-renders dropdown.
4. Edit seeker profile, set state="Other" → free-text appears, save persists `state='Goa'` (typed).
5. Try pincode `000000` → validation rejects with toast.
6. Try +91 phone `1234567890` → rejected (must start 6-9).
7. Existing seeker with legacy plain `9876543210` opens profile → renders as 🇮🇳 +91 + `9876543210` automatically.

