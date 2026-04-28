# Fix: Sent-for-signature email shows generic template — missing B1.1 (Client Details) and B1.2 (Payments & Fees)

## Root cause

When the admin/coach clicks **"Send Email for Signature"** from `Seekers → Documents`:

1. `SendForSignatureDialog` calls the `request-document-signature` edge function with a `document_id` from the **Document Library** (`AdminDocuments` page).
2. That function emails the seeker a link to `/sign/:token`.
3. `/sign/:token` (`src/pages/SignDocument.tsx`) renders an `<iframe>` of the **raw uploaded PDF** stored in the `documents` storage bucket — i.e. the static template the admin uploaded once. It contains zero seeker-specific data.
4. After consent, `submit-signature` loads that same static PDF and only **appends a Signature Certificate page** (B1.3-style). It never injects B1.1 (Client Details) or B1.2 (Payments & Fees).

So today the seeker reviews a blank template, signs it, and the resulting signed PDF still has no name, phone, fees, or schedule — exactly what the user is reporting.

The full B1.1 + B1.2 content already exists for **internal admin/coach view** in `PremiumAgreementDocument.tsx` (pages 4 and 6) and is hydrated from `profiles` + `agreements (type='fee_structure')`. We just need to mirror those two pages into the document the seeker sees and signs.

## Fix — inject B1.1 and B1.2 pages on-the-fly into the PDF used for signing

Both edge functions will, at runtime per request, fetch the seeker profile + their latest fee_structure row and **prepend two new pages** ("B1.1 Client Details" and "B1.2 Payments & Fees") to the source template before the seeker sees / signs it. The signature certificate page (B1.3) at the end keeps working exactly as it does now.

This way:
- The link the seeker opens shows: B1.1 → B1.2 → original agreement template pages → (after signing) B1.3 certificate.
- No new uploads required, no DB schema change, no UI change for admins.
- Works for any document the admin sends; for non-Premium-Agreement documents we still inject the pages (they are seeker-specific reference info, not legal terms — they cause no harm and can later be gated by `documents.category` if needed; see "Optional follow-up" below).

### Files to change

1. **`supabase/functions/get-signature-request/index.ts`**
   - After loading the source PDF, fetch:
     - `profiles` (full_name, email, phone) for `reqRow.seeker_id`
     - latest `agreements` row where `client_id = seeker_id` AND `type = 'fee_structure'` (read `fields_json`)
   - Use `pdf-lib` to load the source PDF, **prepend two new A4 pages** rendering:
     - **Page B1.1 — Client Details**: Client Name, Start Date (from fee_structure.startDate), Phone, Email, plus the bilingual confirmation note.
     - **Page B1.2 — Payments & Fees**: a 2-column table identical in field set to `PremiumAgreementDocument.tsx` page 6 (fee per session, num sessions, durations, start/end dates, totals incl. GST @ 18%, payment plan + schedule, mode, amount paid, balance due). If no fee_structure exists → render the same amber warning box.
   - Save the modified PDF, write it to a short-lived signed URL, and return that URL as `pdf_url` instead of the raw template URL. Use a per-request temp upload path `documents/_preview/{request_id}.pdf` (upsert, not user-visible) OR return as `data:` URI / signed Edge response — preferred: upload to `documents` bucket under `_preview/` and signed-URL it for 30 min (matches today's pattern).

2. **`supabase/functions/submit-signature/index.ts`**
   - Apply the **same prepend logic** before appending the certificate page, so the stored "signed" PDF in the `signatures` bucket and the email attachment also include B1.1 + B1.2.
   - Keep the existing B1.3 certificate page logic untouched.

3. **Shared helper** — add a small helper file `supabase/functions/_shared/buildClientPages.ts` (Deno) that both functions import:
   ```ts
   export async function prependClientPages(
     pdfDoc: PDFDocument,
     opts: {
       seeker: { full_name: string; email: string|null; phone: string|null };
       fee: any | null;          // fields_json from agreements row
     }
   ): Promise<void>
   ```
   Internally uses `StandardFonts.Helvetica` / `HelveticaBold` / `HelveticaOblique`, draws a header band, table rows, and inserts the two new pages at index 0 and 1 via `pdfDoc.insertPage(...)`.

   Bilingual note: `pdf-lib`'s standard fonts cannot render Devanagari. To stay reliable across runtimes we render **English-only labels with a subtle Hindi-romanised helper** (e.g. "Client Name (Naam)") on these two injected pages. The full Devanagari version remains available for admins inside the React preview at `/seekers/:id/premium-agreement`.

4. **No client code changes needed** — `SignDocument.tsx` already renders whatever `pdf_url` is returned, and the email-attachment path in `submit-signature` already picks up the saved PDF bytes.

### Numbers to render on B1.2

Pull from `agreements.fields_json` for the most recent `type='fee_structure'` row:
- `feePerSession`, `numSessions`, `coachingDuration`, `handHoldingSupport`, `totalProgramDuration`
- `startDate`, `endDate`
- `totalFeesExclGst`, `gstAmount`, `totalInvestment`
- `paymentPlan`, `installmentSchedule`
- `modeOfPayment` (string or array → join with ", ")
- `amountPaidToday`, `balanceDue`

Currency formatting: simple `INR <value>` via `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })` inside the helper.

### Behaviour when fee_structure is missing

- B1.1 still renders (profile data is always present).
- B1.2 renders a single amber warning paragraph: *"No Fee Structure has been recorded for this Seeker yet. Please complete it under Seekers → Documents → Fee Structure before requesting signature."*
- The seeker is **not blocked from signing** today; if you'd like to block sending in this case, we can also add a guard inside `request-document-signature` that returns `400 fee_structure_missing` when the document category is `agreement`. Confirm preference if desired — default plan does not block.

## Verification after implementation

1. As admin, ensure the target seeker has a saved Fee Structure.
2. From `Seekers → Documents`, click **Send Email for Signature** for "Coaching Agreement Premium".
3. Open the email link in an incognito window.
4. The PDF preview must show: **Page 1 = B1.1 with the seeker's name/phone/email/start date**, **Page 2 = B1.2 with the full fees table**, then the original template pages.
5. Sign the document. Confirm the emailed signed PDF and the file in the `signatures` bucket also start with B1.1 + B1.2 and end with the existing B1.3 certificate page.
6. Repeat with a seeker who has no fee_structure — B1.2 must show the amber warning, and signing must still work (or be blocked, if that follow-up is selected).

## Optional follow-ups (not in this change unless requested)

- Restrict B1.1/B1.2 injection to `documents.category = 'agreement'` only.
- Add native Devanagari support by embedding a Noto Sans Devanagari TTF via `pdfDoc.embedFont(fontBytes, { subset: true })`.
- Block sending an "agreement" category document when no fee_structure exists.
