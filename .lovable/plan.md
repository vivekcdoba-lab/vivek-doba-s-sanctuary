
The user wants me to test the admin creation flow end-to-end. This requires browser automation to:
1. Log in as an existing admin
2. Navigate to /admin/add-user
3. Create a new admin with a custom 12-char password
4. Log out and log in as the new admin
5. Verify the optional password change prompt appears

This is a testing task that needs browser tools (which are available in default mode). I'm in plan mode (read-only), so I'll present this plan for approval.

## Plan

### Test scenario
End-to-end verification of the new admin-creation + password flow built in the previous turns.

### Steps
1. **Login as existing admin** — use `vivek@gmail.com` test account (from memory/test-credentials)
2. **Navigate to `/admin/add-user`** — verify page loads
3. **Fill Step 1** with role=Admin:
   - Full name: `Test Admin E2E`
   - Email: `testadmin-e2e-{timestamp}@example.com` (unique to avoid duplicate-check 409)
   - Phone: unique 10-digit number
   - Password: `TestAdmin@2026!` (12+ chars, uppercase, number, special)
   - Confirm password: same
   - Verify "Next" enables only when password validates + matches
4. **Step 2** — pick admin level (Admin) + a couple of permissions
5. **Step 3** — review screen shows masked password
6. **Submit** — verify success toast "credentials emailed"
7. **Verify in DB** via `supabase--read_query`:
   - profile row exists with role=admin, admin_level set, must_change_password=false, password_change_prompted=false
8. **Check edge function logs** — confirm Resend email send succeeded (or surface error)
9. **Logout** current admin
10. **Login as new admin** with the password just set
11. **Verify the one-time "Change password?" dialog appears** with "Change Now" / "Keep Current" buttons
12. **Click "Keep Current"** — verify dialog closes, lands on admin dashboard, and DB now shows `password_change_prompted=true`
13. **Cleanup** — delete the test admin profile + auth user via SQL/edge function so we don't pollute the DB

### What I'll report
- Pass/fail for each step with screenshots at key moments (Step 1 form, success toast, login prompt dialog, dashboard)
- Any console errors or failed network calls
- Email-send status from edge function logs
- Final DB state confirmation

### What I will NOT do without asking
- Will not test the seeker auto-temp-password flow in the same run (separate scenario, can do after)
- Will not delete any pre-existing user

### If something fails
I'll stop, report the exact failure (screenshot + log excerpt), and propose a fix in a follow-up plan rather than silently retrying.
