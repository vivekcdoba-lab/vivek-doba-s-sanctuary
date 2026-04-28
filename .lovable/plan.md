## Two fixes

### 1. Fix `agreements_type_check` constraint error

**Root cause:** The DB constraint currently only allows `type IN ('coaching', 'goal')`, but the code already inserts `'fee_structure'` and the new `'premium_agreement'`. Saving the Premium Agreement throws this error.

**Migration** — drop and recreate the constraint to include all current valid types:

```sql
ALTER TABLE public.agreements DROP CONSTRAINT IF EXISTS agreements_type_check;
ALTER TABLE public.agreements ADD CONSTRAINT agreements_type_check
  CHECK (type IN ('coaching', 'goal', 'fee_structure', 'premium_agreement'));
```

No code changes needed — `PremiumAgreementPage.tsx` already inserts with `type: "premium_agreement"`.

---

### 2. Mode of Payment → multi-select checkboxes (bilingual)

**Current:** Single radio (Bank / UPI / Cheque / Cash). Stored as a single string on `modeOfPayment`.

**New:** Multiple checkboxes — coach can tick more than one (e.g. UPI + Bank). Each option labelled bilingually (EN / HI).

**Bilingual labels:**
| EN | HI |
|---|---|
| Bank | बैंक |
| UPI | यूपीआई |
| Cheque | चेक |
| Cash | नकद |

**Files to change:**

- **`src/hooks/useFeeStructure.ts`** — change `modeOfPayment` type from union string to `string[]`; default `[]`. Backwards-compat: when reading, if existing value is a string, wrap into `[value]` so old fee structures still display.

- **`src/components/FeeStructureForm.tsx`** (lines 184–197) — replace radio inputs with `Checkbox` from `@/components/ui/checkbox`. Toggle adds/removes the option from the array. Display label as `Bank / बैंक` etc.

- **`src/components/PremiumAgreementDocument.tsx`** (line 265) — render `fee.modeOfPayment` as comma-joined list (handle both string and array for legacy data): `Array.isArray(fee.modeOfPayment) ? fee.modeOfPayment.join(', ') : fee.modeOfPayment || '—'`.

- **`src/pages/admin/AdminRecordPayment.tsx`** is unaffected (its `method` is a separate per-payment field, single-select — out of scope).

---

### Validation

After applying:
- Saving Premium Agreement no longer throws constraint error.
- Fee Structure form shows 4 bilingual checkboxes; multiple can be ticked.
- Premium Agreement PDF Page 6 shows selected modes joined by commas.
- Existing fee structures with single-string `modeOfPayment` still render correctly (backwards-compat fallback).
