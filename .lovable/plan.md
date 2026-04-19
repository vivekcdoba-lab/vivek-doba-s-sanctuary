
This is a research question, not an implementation task. The user is asking how a newly approved seeker receives their password to log in.

From `supabase/functions/approve-application/index.ts`:

**Flow for a new seeker registering via `/register`:**

1. Seeker fills `/register` form → submits with their **own chosen password**
2. Row inserted into `submissions` table with `status: 'pending'` and password stored inside `form_data.password`
3. Admin reviews in `/admin/applications` and clicks Approve
4. `approve-application` edge function runs:
   - Detects `form_type = 'registration'` and `fd.password` exists → uses **the seeker's own password** (not a temp one)
   - Creates the auth user via `supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true })`
   - Sends approval email via Resend (subject: "✅ Application Approved — Welcome to VDTS")
   - Email contains: their email + a "Sign In" button → no password is shown (because they already know it)
   - Sanitizes `form_data` by deleting the password before marking submission approved
5. Seeker clicks the link, signs in with the password they chose at registration

**Flow for other intake forms (Discovery Call, Workshop, etc.) where seeker did NOT set a password:**

1. Edge function generates a **random 15-char temp password** (`randomTempPassword()`)
2. Sets `must_change_password = true` on profile
3. Email subject: "✅ Application Approved — Your VDTS account (temporary password inside)"
4. Email body **shows the temp password** in a code block + warning that it's temporary
5. On first login, `firstLoginFlow.ts` detects `must_change_password = true` → forces password change before continuing

**Email transport:** Resend (`RESEND_API_KEY` configured), from address pulled from `app_settings.email_from` or `RESEND_FROM` env, defaults to `VDTS <info@vivekdoba.com>`.

**Summary answer to give the user:**
- Registered via `/register`: they use the password **they chose at signup** — email just confirms approval, no password disclosed.
- Approved from any other intake form: a **temporary password is generated and emailed** to them; they must change it on first login.

No code changes needed — this is already implemented and working.
