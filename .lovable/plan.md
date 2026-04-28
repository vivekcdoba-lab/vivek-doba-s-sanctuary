# Premium Coaching Agreement — Implementation Plan

Convert the uploaded `Coaching_Agreement_Premium.pdf` into a system-generated, data-driven 12-page agreement document inside VDTS. It will auto-pull data from existing tables (no duplicate entry) and produce an exact-looking PDF.

---

## What gets auto-filled (your 3 requirements)

### B1.1 — Page 4 (Client Block)
Pull from `profiles` table (where `id = seeker_id`):

| Field on PDF | Source |
|---|---|
| Client Name / नाम | `profiles.full_name` |
| Start Date / प्रारंभ तिथि | `agreements.fields_json.startDate` (Fee Structure) — fallback: enrollment start |
| Phone / फ़ोन | `profiles.phone` |
| Email / ईमेल | `profiles.email` |

### B1.2 — Page 6 (Payments & Fees)
Pull entire block from existing **Fee Structure** record (`agreements` table where `type = 'fee_structure'` and `client_id = seekerId`) — already maintained at *Seekers → Documents → Fee Structure*:

| PDF Row | Field from `useFeeStructure` |
|---|---|
| Fee per session | `feePerSession` |
| Number of sessions | `numSessions` |
| Coaching duration | `coachingDuration` |
| Hand-holding support | `handHoldingSupport` |
| Total program duration | `totalProgramDuration` |
| Start date | `startDate` |
| End date | `endDate` |
| Total fees (excl GST) | `totalFeesExclGst` |
| GST @ 18% | `gstAmount` |
| **Total Investment** | `totalInvestment` |
| Payment plan | `paymentPlan` (Full / Installments) |
| Installment schedule | `installmentSchedule` |
| Mode of payment | `modeOfPayment` |
| Amount paid today | `amountPaidToday` |
| Balance due | `balanceDue` |

If no Fee Structure exists yet, a banner prompts the coach to fill it first (link button to the existing Fee Structure form). **No data duplication.**

### B1.3 — Page 11 (Signatures)
Reuse the existing `DigitalSignature` component (already used for sessions). Two signature blocks:

| Block | Signer | Stored in |
|---|---|---|
| Participant / प्रतिभागी | Seeker | `session_signatures`-style record, scoped to agreement (or a new `agreement_signatures` mirror table) |
| Coach / कोच | Vivek Doba (or assigned coach) | same |

Each signature captures: drawn-or-typed signature image (private `signatures` storage bucket), SHA-256 hash of agreement content, IP, user agent, timestamp, typed full name. Identical pattern to the current session-signature flow — verified columns: `signer_id`, `signer_role`, `storage_path`, `typed_name`, `content_hash`, `signed_at`.

---

## How it will be used (UX flow)

```text
Admin/Coach → Seekers → [pick seeker] → Documents tab
                                          │
                                          ├─ Fee Structure         (existing, source of B1.2)
                                          ├─ Coaching Agreement    (existing simple form — kept)
                                          └─ Premium Agreement ⭐  (NEW — full 12-page document)
                                                  │
                                                  ├─ "Preview"  → renders bilingual 12-page document
                                                  │                with all auto-filled data
                                                  ├─ "Send for Signature" → seeker gets it on
                                                  │      Seeker → My Documents → Premium Agreement
                                                  ├─ Seeker signs (DigitalSignature)
                                                  ├─ Coach counter-signs
                                                  └─ "Download PDF" (exact look of uploaded sample)
```

Status badges on the agreement card: `Draft → Awaiting Seeker Signature → Awaiting Coach Signature → Fully Signed`.

---

## Pages of the rendered document (matches uploaded PDF)

1. Cover — "Strategic Coaching Partnership" (static, bilingual)
2. Quick Summary Snapshot (static)
3. Note from Vivek + "Our Promise to You" (static)
4. **B1.1 Client Details — auto-filled**
5. "What This Partnership Delivers" (static)
6. **B1.2 Payments & Fees — auto-filled from Fee Structure**
7. "How We Work Together" (static)
8. "Your Responsibilities" (static)
9. Working Principles & Policies — Payments/Refunds (static)
10. Working Principles & Policies — Attendance/Disputes (static)
11. **B1.3 "Before You Sign" + Signature Block — interactive**
12. Closing page + contact (static)

All static text is stored in one bilingual content file (`src/content/premiumAgreement.ts`) so legal edits are one-line changes.

---

## Technical Plan

### New files
- `src/pages/coaching/PremiumAgreementPage.tsx` — preview + actions (admin/coach view)
- `src/pages/seeker/SeekerPremiumAgreement.tsx` — seeker signing view
- `src/components/PremiumAgreementDocument.tsx` — the 12-page renderable DOM (id `premium-agreement-print`), uses tailwind print classes + `print:break-after-page` between sections
- `src/content/premiumAgreement.ts` — bilingual static text (EN + HI from the uploaded PDF)
- `src/lib/premiumAgreementPdfExport.ts` — clones the lgtPdfExport pattern (dynamic `jspdf` + `html2canvas`, A4, multi-page slicing)

### Reused, no changes
- `useFeeStructure` hook (B1.2 source)
- `DigitalSignature` component (B1.3)
- `profiles` table query (B1.1)
- `signatures` storage bucket
- Sidebar route registration in `App.tsx` (lazy-loaded)

### DB (one tiny migration)
Add a row type to existing `agreements` table — **no new table needed**:
```
type = 'premium_agreement'
fields_json = {
  generated_at,
  seeker_signature_id,   -- FK to session_signatures-style row
  coach_signature_id,
  content_hash,          -- SHA-256 of frozen document JSON
  status: 'draft'|'awaiting_seeker'|'awaiting_coach'|'signed'
}
```
Signatures themselves go into a small new table `agreement_signatures` (mirrors `session_signatures` 1:1 — `agreement_id`, `signer_id`, `signer_role`, `storage_path`, `typed_name`, `content_hash`, `signed_at`, `ip`, `user_agent`) with RLS:
- Seeker: read/insert own
- Coach/Admin: read/insert for assigned seekers (uses existing `is_admin` / `is_assigned_coach` SECURITY DEFINER funcs)

### PDF Export
- Same dynamic-import pattern as `lgtPdfExport.ts` (no bundle bloat)
- Each `<section data-page="N">` rendered separately to keep crisp text and force one PDF page per agreement page (12 pages out)
- File naming: `Coaching-Agreement-{SeekerName}-{YYYY-MM-DD}.pdf`

### i18n
- Document is bilingual side-by-side (English + Hindi/Marathi optional) — matches the uploaded sample exactly
- Uses existing `useCoachingLang()` only for UI chrome (buttons), document body itself is always bilingual

---

## Visual Preview Promise

After approval and implementation, I will:
1. Generate a sample PDF for an existing test seeker
2. Convert each page to image
3. Show you all 12 pages inline so you can verify it matches the uploaded design before going live

---

## Out of scope (not touched)
- Existing simple "Coaching Agreement" form on `/coaching/agreements` — left as-is per Preservation Policy
- Existing Goal Commitment Form — untouched
- Existing Fee Structure form — untouched (we only *read* from it)

---

## Open question (please confirm before I build)

The current agreement uses **English + Hindi** (as in the uploaded PDF). Should the Premium Agreement also support a **Marathi** variant (as VDTS does elsewhere), or keep it English + Hindi only matching the source document?
