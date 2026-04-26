
## Goal
Build a bilingual (English / Hindi) **Fee Structure / Onboarding Fee Details** form (matching the uploaded table layout) that an admin fills in per seeker. The completed form is stored as a new agreement type and rendered as the **second-to-last page of the Coaching Agreement** when exporting / signing.

## Form Fields (from screenshot, EN + HI)
| Field | Type | Notes |
|---|---|---|
| Fee per session / प्रति सेशन फीस | text (default `INR 30,000 per session + GST @ 18%`) | editable |
| Number of sessions / सेशन की संख्या | number | |
| Coaching duration / कोचिंग की अवधि | text (default `6 months`) + override months | |
| Hand-holding support / हैंड-होल्डिंग सपोर्ट | text (default `6 months`) + override months | |
| Total program duration / कुल प्रोग्राम अवधि | text (default `12 months`) + override months | |
| Start date / प्रारंभ तिथि | date | |
| End date / समाप्ति तिथि | date (auto-calculated, editable) | |
| Total fees (excl. GST) / कुल फीस | INR (auto = sessions × per-session) | |
| GST @ 18% / GST @ 18% | INR (auto = 18% of total) | |
| **TOTAL INVESTMENT (incl. GST)** | INR (auto, highlighted gold row) | |
| Payment plan / भुगतान योजना | radio: Full advance / Installments | |
| If installments — schedule / अनुसूची | textarea | conditional |
| Mode of payment / भुगतान का माध्यम | radio: Bank / UPI / Cheque / Cash | |
| Amount paid today / आज भुगतान की गई राशि | INR | |
| Balance due / शेष देय राशि | INR (auto = total − paid) | |
| Invoice / इनवॉइस | static note `GST invoice issued for every payment` | |

## 1. Database Migration
- Extend `public.agreements.type` usage with new value `'fee_structure'` (text column already, no enum change needed).
- Add **`fee_structures`** view-friendly index (optional): `CREATE INDEX idx_agreements_seeker_type ON agreements(client_id, type);`
- RLS already covers admin/coach. Add explicit policy: **admins full CRUD on agreements** via `is_admin(auth.uid())`.

## 2. New Component
**`src/components/FeeStructureForm.tsx`** — reusable, bilingual, two-column table layout mirroring the screenshot (dark-blue header, alternating row shading, gold TOTAL row). Includes:
- Live auto-calculations (total, GST, balance)
- Language toggle inherited from parent (`lang: 'en' | 'hi'`)
- Print-friendly CSS for PDF export

## 3. Hook
**`src/hooks/useFeeStructure.ts`**
- `useFeeStructure(seekerId)` → fetch latest `agreements` row where `type='fee_structure'` for that seeker
- `useUpsertFeeStructure()` → insert/update mutation (`fields_json` stores all values)

## 4. Wire into Admin → Seeker Detail → Documents tab
**Edit `src/pages/admin/SeekerDetailPage.tsx`**:
- The "Documents" tab is listed but currently has no body. Add a render block:
  - Card 1: **Fee Structure** — shows current values + "Edit / Fill" button → opens modal with `<FeeStructureForm />`
  - Card 2: existing signature requests (already in `SeekerSignaturesTab`) kept intact
  - Card 3: any existing uploaded documents list (preserve)

## 5. Attach to Coaching Agreement (second-to-last page)
**Edit `src/pages/coaching/AgreementsPage.tsx`** (and the coaching agreement PDF export path):
- When generating the Coaching Agreement for a participant, fetch their saved `fee_structure` agreement.
- Insert as a dedicated print page **before the signature page**:
  - `<div className="page-break-before">` rendering `<FeeStructureForm readOnly />`
- If no fee structure exists → show inline notice "Admin must complete Fee Structure first" with deep-link to seeker's Documents tab.

## 6. Seeker-side visibility (read-only)
- The seeker can view their own fee structure under their existing **Payments / Documents** area (read-only render of the same component).
- Preserve existing payment recording flows untouched.

## 7. Files
**New**
- `src/components/FeeStructureForm.tsx`
- `src/hooks/useFeeStructure.ts`
- `supabase/migrations/<ts>_fee_structure_agreement.sql`

**Edited**
- `src/pages/admin/SeekerDetailPage.tsx` (Documents tab body)
- `src/pages/coaching/AgreementsPage.tsx` (insert fee page before signature page)
- `src/pages/seeker/SeekerPayments.tsx` (read-only fee structure card)

## 8. Verification (dry run)
1. Admin → Seekers → pick test01 → Documents tab → click "Fee Structure" → fill 8 sessions, start date today → totals auto-compute → Save → toast.
2. Refresh → values persist.
3. Coach → Agreements → Coaching Agreement → select test01 → Export PDF → page N-1 contains the bilingual fee table with the saved values; page N is the signature page.
4. Seeker test01 logs in → Payments → sees read-only fee structure card.

## Open Questions
- The user mentioned "agreement sign last page I will share next" — the **signature page** redesign will arrive in a follow-up message. This plan keeps the existing signature page as the final page; we'll swap it when the new design is shared.

Ready to implement on approval.
