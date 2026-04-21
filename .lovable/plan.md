

## Goal
Fix the **HTML injection vulnerability** in `send-notification` edge function by escaping all user-submitted data before injecting into admin/applicant email HTML.

The other four findings are already marked `ignore: true` (outdated/accepted) — no action needed on those.

## Root cause

In `supabase/functions/send-notification/index.ts`, user-controlled fields (`applicant_name`, `applicant_email`, `applicant_mobile`, `admin_notes`, and every key/value in `form_data`) are interpolated directly into HTML template strings:

```ts
<h2>Applicant: ${data.applicant_name}</h2>
<td>${label}</td><td>${val}</td>
```

A registrant submitting `<script>` / `<a href="evil">` / styled markup gets that markup rendered inside the admin's inbox — classic HTML/phishing injection.

## Changes

**`supabase/functions/send-notification/index.ts`**

1. Add a small `escapeHtml(s)` helper at the top:
   ```ts
   function escapeHtml(v: unknown): string {
     return String(v ?? "")
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#39;");
   }
   ```

2. In `buildAdminEmailHtml`:
   - Wrap every `${...}` that contains user data with `escapeHtml(...)`: `applicant_name`, `applicant_email`, `applicant_mobile`, and the `label`/`val` cells in the details table.
   - `formType` comes from a fixed lookup map → safe, but escape the fallback `data.form_type` branch.

3. In `buildApplicantEmailHtml`:
   - Escape `applicant_name` and `admin_notes`.
   - For `admin_notes`, also convert newlines to `<br/>` **after** escaping (so `\n` from coach notes still renders as line breaks safely).

4. Subject lines (`New ${subjectLabel} — ${data.applicant_name}`): Resend treats subjects as plain text, but strip control chars / CRLF from `applicant_name` to prevent header injection — `String(name).replace(/[\r\n]/g, " ").slice(0, 200)`.

5. No behavior change for trusted fields (status icons, brand copy, fixed labels).

## Out of scope
- The four `ignore: true` findings (passwords in submissions, public bucket listing, always-true RLS on submissions, intentional public INSERT) — already documented as accepted/outdated.
- Refactoring the email templates' visual design.
- Changing the WhatsApp message body (plain text, not HTML — no injection vector).

## Post-fix
Mark the `agent_security` finding for "Unescaped User Data Injected Into Admin Notification Emails" as `mark_as_fixed` with a one-line explanation.

## Smoke test
1. Submit a registration with name `<script>alert(1)</script> Bob` → admin email shows literal text `<script>alert(1)</script> Bob`, no script execution, no broken layout.
2. Submit with `form_data.note = "<b>fake urgent</b>"` → renders as escaped text in the details table.
3. Approve an application with `admin_notes = "Line1\nLine2 <img src=x>"` → applicant email shows `Line1<br/>Line2 &lt;img src=x&gt;`.
4. Existing happy-path (normal name + email) still renders identically.

