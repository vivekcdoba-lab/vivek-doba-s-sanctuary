

# Plan: Update Sender Email to noreply@vivekdoba.com

## Changes

Update 3 edge functions to replace all `onboarding@resend.dev` sender addresses with `noreply@vivekdoba.com` and change admin recipient from `vivekcdoba@gmail.com` to `info@vivekdoba.com`.

### Files to Edit

1. **`supabase/functions/send-otp/index.ts`**
   - `from: "VDTS <onboarding@resend.dev>"` → `from: "VDTS <noreply@vivekdoba.com>"`

2. **`supabase/functions/send-notification/index.ts`**
   - `ADMIN_EMAIL` → `"info@vivekdoba.com"`
   - `from: "VDTS Notifications <onboarding@resend.dev>"` → `from: "VDTS Notifications <noreply@vivekdoba.com>"`
   - `from: "Vivek Doba Training Solutions <onboarding@resend.dev>"` → `from: "Vivek Doba Training Solutions <noreply@vivekdoba.com>"`

3. **`supabase/functions/daily-session-report/index.ts`**
   - `ADMIN_EMAIL` → `"info@vivekdoba.com"`
   - `from: "VDTS Reports <onboarding@resend.dev>"` → `from: "VDTS Reports <noreply@vivekdoba.com>"`

### Prerequisite
Domain `vivekdoba.com` must be verified in Resend for sending to work. WhatsApp number `+919607050111` is already correct — no changes needed.

### No deletions, no style changes, no DB changes.

