## Goal
Fix signature emails not arriving by switching the four signature edge functions from the Lovable connector gateway (silent failures) to the direct Resend API — same transport already used successfully by the seeker-approval flow.

## Changes

### 1. Edge functions — direct Resend API
For each of:
- `supabase/functions/request-document-signature/index.ts`
- `supabase/functions/sign-document-inline/index.ts`
- `supabase/functions/submit-signature/index.ts`
- `supabase/functions/resend-document-signature/index.ts`

Replace the gateway block:
```ts
await fetch("https://connector-gateway.lovable.dev/resend/emails", {
  headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "X-Connection-Api-Key": RESEND_API_KEY, ... }, ...
})
```
with direct Resend:
```ts
const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${RESEND_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "Vivek Doba <info@vivekdoba.com>",
    to: [seeker.email],
    subject,
    html,
  }),
});
const emailJson = await res.json().catch(() => ({}));
if (!res.ok) console.error("resend_failed", res.status, emailJson);
```

- Drop the `LOVABLE_API_KEY` requirement from the guard (keep `RESEND_API_KEY` check).
- Capture `email_sent: boolean` and `email_error?: string` per request, and include them in the function's JSON response (alongside existing `created[]` / `signed[]`).
- Keep all existing PDF generation, DB inserts, and templates unchanged.

### 2. Frontend — surface real send status
- `src/components/SendForSignatureDialog.tsx`: read `data.created[].email_sent` / `email_error`. Show success toast only when at least one email actually sent; otherwise show destructive toast with the Resend error message and keep the dialog open so the user can retry.
- `src/components/SignHereDialog.tsx`: same treatment for `data.signed[]`.

### 3. Deploy + verify
- Deploy all 4 functions.
- `curl_edge_functions` POST to `request-document-signature` with a known seeker → confirm response includes `email_sent: true`.
- Tail `edge_function_logs` for `request-document-signature` and `sign-document-inline` → confirm no `resend_failed` entries.
- `grep -r "connector-gateway.lovable.dev/resend" supabase/functions/` → must return 0 matches.

## Files affected
- `supabase/functions/request-document-signature/index.ts`
- `supabase/functions/sign-document-inline/index.ts`
- `supabase/functions/submit-signature/index.ts`
- `supabase/functions/resend-document-signature/index.ts`
- `src/components/SendForSignatureDialog.tsx`
- `src/components/SignHereDialog.tsx`

## Out of scope
- No DB / RLS changes.
- No template / PDF / sender-address changes (sender stays `info@vivekdoba.com`, already verified).
- No changes to other email functions (they already work via direct Resend or are out of this report's scope).
