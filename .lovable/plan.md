

Two requirements:
1. Change the default sender across all edge functions from `noreply@vivekdoba.com` to `info@vivekdoba.com`.
2. Add admin UI to edit the "from email" address centrally — so all outgoing emails use that configured address.

## Approach

**Storage for the configurable sender:** Use the existing `assessment_config` pattern? No — that's assessment-specific. Best fit: create a tiny `app_settings` table (key/value JSON) so admins can store global config like `email_from`. Single row per key, RLS = admin-only write, public read (so edge functions reading via service role still work; but we'll fetch via service role anyway).

Actually simpler: a dedicated `email_settings` table with a single-row pattern. But to be future-proof, use `app_settings (key text PK, value jsonb, updated_at, updated_by)`.

### Migration
- Create `public.app_settings` table.
- RLS: anyone authenticated can read; only admins can insert/update.
- Seed row: `('email_from', '"VDTS <info@vivekdoba.com>"')`.

### Edge functions (5 files)
Replace each hardcoded `noreply@vivekdoba.com` with a runtime lookup:
```ts
async function getFromAddress(supabase): Promise<string> {
  const { data } = await supabase.from('app_settings').select('value').eq('key', 'email_from').maybeSingle();
  if (data?.value && typeof data.value === 'string') return data.value;
  return Deno.env.get('RESEND_FROM') || 'VDTS <info@vivekdoba.com>';
}
```
- `send-notification/index.ts`
- `approve-application/index.ts`
- `send-otp/index.ts`
- `daily-session-report/index.ts`
- `admin-create-user/index.ts`

Default fallback updated to `info@vivekdoba.com`.

### Admin UI
Add a card to `src/pages/admin/SettingsPage.tsx` (existing) — "Email Sender Configuration":
- Input for the from-address (with helper: `Display Name <email@domain.com>` format).
- Save button → upserts `app_settings` row with key=`email_from`.
- Show current value, with a note that the domain must be verified in Resend.

### Files
- New migration: create `app_settings` table + seed.
- Modify 5 edge functions.
- Modify `src/pages/admin/SettingsPage.tsx` (add a section).

### Won't do
- Won't add per-function override UI — single global from-address per user request.
- Won't change Resend domain verification (vivekdoba.com is presumably already verified for noreply; info@ uses same domain so it works automatically).

