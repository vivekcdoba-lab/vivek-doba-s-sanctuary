

## Security Hardening Plan

After a comprehensive audit of your 83-table database, 197 RLS policies, 8 realtime tables, edge functions, and client-side code, here is the full security picture and fixes needed.

---

### Current Security Strengths (Already Good)

- RLS enabled on all 83 tables
- `is_admin()` SECURITY DEFINER function prevents recursion
- `prevent_role_escalation` trigger blocks seekers from changing their role
- `validate_seeker_session_update` trigger protects coach-only session fields
- Edge functions (`approve-application`, `session-heartbeat`) properly validate JWT + admin role
- HIBP password protection available
- Single-device enforcement for seekers
- 60-minute inactivity timeout with auto-close
- Generic login error messages prevent email enumeration

---

### Issues Found and Fixes

#### 1. CRITICAL: Realtime Channel Authorization Missing
**Risk**: Any authenticated seeker can subscribe to ANY realtime channel and see live changes on `sessions`, `messages`, `user_sessions` (IP addresses), `notifications` of OTHER users.

**Fix**: Add RLS policies on `realtime.messages` table to restrict channel subscriptions by topic. Since we cannot modify the `realtime` schema directly, the safer approach is to **remove sensitive tables from realtime publication** and only keep tables where broadcast is safe, or implement channel-topic authorization via a migration.

#### 2. WARN: Submissions INSERT Policy is `WITH CHECK (true)` for `anon`
**Risk**: This allows anonymous spam submissions. While intentional for public forms, it's open to abuse.

**Fix**: Add rate limiting via a database function or edge function proxy. Also add input length constraints on the submissions table columns.

#### 3. MEDIUM: `send-notification` Edge Function Has No Auth Check
**Risk**: Anyone who knows the function URL can call it to send emails via your Resend account (email abuse, quota drain).

**Fix**: Add JWT validation and admin role check, OR restrict to only be called from other edge functions using a shared secret.

#### 4. MEDIUM: `send-whatsapp` and `send-otp` Edge Functions Need Auth Audit
**Risk**: If these lack auth checks, attackers could send SMS/WhatsApp messages at your cost.

**Fix**: Verify and add JWT + role validation to these functions.

#### 5. LOW: CORS `Access-Control-Allow-Origin: *` on All Edge Functions
**Risk**: Any website can call your edge functions (though JWT still protects most).

**Fix**: Restrict CORS origin to your app domain(s) only.

#### 6. IMPROVEMENT: Add Database-Level Rate Limiting for Assessments
**Risk**: A seeker could spam-create hundreds of assessment records.

**Fix**: Add a trigger that limits assessment creation to max 1 per type per day per seeker.

---

### Migration (1 SQL file)

1. Remove sensitive tables from realtime publication (keep only `notifications`, `session_notifications`)
2. Add a rate-limit trigger for assessment tables
3. Add column length constraints on `submissions` table

### Edge Function Updates

1. **`send-notification/index.ts`** — Add JWT + admin role validation before sending emails
2. **`send-whatsapp/index.ts`** — Verify auth check exists, add if missing  
3. **`send-otp/index.ts`** — Verify auth check exists (OTP may need to be callable without auth for login flow)
4. All edge functions — Restrict CORS origin to `https://*.lovable.app` and production domain

### No Client-Side Changes Needed
The client code already uses generic error messages, proper auth guards, and does not expose sensitive data. No frontend changes required.

---

### Technical Details

**Realtime fix SQL:**
```sql
ALTER PUBLICATION supabase_realtime DROP TABLE sessions;
ALTER PUBLICATION supabase_realtime DROP TABLE messages;
ALTER PUBLICATION supabase_realtime DROP TABLE session_comments;
ALTER PUBLICATION supabase_realtime DROP TABLE user_sessions;
ALTER PUBLICATION supabase_realtime DROP TABLE submissions;
ALTER PUBLICATION supabase_realtime DROP TABLE follow_ups;
```

**send-notification auth fix pattern:**
```typescript
const authHeader = req.headers.get("Authorization");
if (!authHeader?.startsWith("Bearer ")) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
}
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
if (!user) return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
```

**Assessment rate-limit trigger:**
```sql
CREATE FUNCTION check_assessment_rate_limit() RETURNS trigger ...
-- Prevents more than 3 assessments per type per day per seeker
```

