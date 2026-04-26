## Goal
Send a single plain-text/HTML test email to **coachviveklgt@gmail.com** from **info@vivekdoba.com** (no fallback) and capture the exact Resend API response so we can confirm whether the sender domain is actually verified.

## Approach
Run a one-off script through `code--exec` that calls the Resend API directly using the project's existing `RESEND_API_KEY` secret. No new edge function, no UI changes, no DB writes.

### Steps
1. **Fetch the `RESEND_API_KEY`** from project secrets at runtime (`secrets--fetch_secrets`) — already exists, no setup needed.
2. **POST to `https://api.resend.com/emails`** with:
   - `from: "VDTS <info@vivekdoba.com>"`
   - `to: ["coachviveklgt@gmail.com"]`
   - `subject: "VDTS — Deliverability Test"`
   - Branded HTML body matching the existing VDTS email template (saffron header, ॐ symbol, plain confirmation message).
3. **Log the full Resend response** — HTTP status, response body, and `id` (if successful) or error type (if rejected, e.g. `validation_error: from domain not verified`).
4. **Report back to you** with one of:
   - ✅ Sent — Resend message ID + ask you to confirm inbox/spam receipt.
   - ❌ Rejected — exact Resend error so we know whether to verify the domain in Resend or switch to fallback.

### Files Affected
- None. This is a one-off `code--exec` curl/script. Nothing in the codebase will be modified.

### Why this is useful
Past email failures to this address suggest the `vivekdoba.com` domain is unverified in Resend. This test confirms or denies that hypothesis directly, without changing any production flow.

**On approval:** I'll run the script and report the Resend response back to you.