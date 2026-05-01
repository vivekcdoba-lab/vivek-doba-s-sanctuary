# Roles & Authentication

## Role matrix

| Role | Description | Self-signup? | Default route |
|---|---|---|---|
| **seeker** | The customer / sadhak | ✅ via `/register` (with admin approval) | `/seeker/home` |
| **coach** | Trained coach (or admin doubling as coach) | ❌ admin-created | `/coach/dashboard` |
| **admin** | Operations / management | ❌ admin-created | `/admin/dashboard` |
| **super_admin** | Special admin level — only one allowed to demote others | ❌ super-admin-only | `/admin/dashboard` |

`admin_level` lives on the profile (`super_admin` or `admin`); `is_also_coach` flag lets an admin appear as a coach too.

## Security helpers (DB)

All RLS policies route through these `SECURITY DEFINER` helpers to avoid recursion:

| Function | Returns | Purpose |
|---|---|---|
| `is_admin(_user_id)` | bool | Any role='admin' |
| `is_super_admin(_user_id)` | bool | role='admin' AND admin_level='super_admin' |
| `is_coach(_user_id)` | bool | role='coach' OR is_also_coach=true |
| `is_assigned_coach(_user_id, _seeker_profile_id)` | bool | True if coach has a `coach_seekers` link to that seeker |
| `get_seeker_link_group(_seeker_id)` | uuid | Returns the seeker's joint-payment group, if any |

## RLS pattern (canonical)

```sql
CREATE POLICY "Seekers view own X"
  ON public.x FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = x.seeker_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Admins manage all X"
  ON public.x FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Assigned coaches view seeker X"
  ON public.x FOR SELECT TO authenticated
  USING (public.is_assigned_coach(auth.uid(), x.seeker_id));
```

## Session lifecycle

- **Idle timeout**: 60 minutes (closed automatically by `close_inactive_sessions`).
- **Hard cap**: 12 hours (absolute timeout).
- **Single-device**: seekers cannot be active on two devices simultaneously; older session is closed.
- **Heartbeat**: `session-heartbeat` edge function pings every few minutes to keep `user_sessions.last_activity_at` fresh.
- **Retention**: closed sessions older than 30 days are purged.

## Verification

- **OTP**: 3 attempts max, 6-digit code, 10-minute expiry, both email + SMS.
- **Password reset**: edge function `admin-reset-password` (admin) and Supabase magic link (self).
- **Registration approval**: every new seeker hits the queue at `/admin/applications` and is approved by `approve-application`.

## Hardening

- Role escalation blocked by `prevent_role_escalation` trigger.
- Admin-level changes blocked unless caller is super-admin (`prevent_admin_level_escalation`).
- Email + phone are encrypted at rest with rotating keys (`encryption_keys`, `rotate_encryption_keys`).
- Lookup hashes (`email_hash`, `phone_hash`) allow duplicate-detection without exposing plaintext.
