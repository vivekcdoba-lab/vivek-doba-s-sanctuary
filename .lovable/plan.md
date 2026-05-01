## Goals

1. Correct the support email shown on `/seeker/help`: change `support@vivekdoba.in` → **`info@vivekdoba.com`**.
2. Fix what currently happens when a seeker clicks **Submit Issue** / **Submit Suggestion** — today the form just inserts a `notifications` row addressed to the seeker themselves, so no admin ever sees it.

---

## Current behavior (what happens now)

`SeekerHelp.tsx` `submitIssue()` and `submitFeature()` both run:

```ts
supabase.from('notifications').insert({
  user_id: profile.id,                  // ← the seeker, not an admin
  type: 'system',
  title: '🐛 Issue Report: ...',
  message: ...,
});
```

Effects:
- Toast says "✅ Issue reported!" — but the row lands in the seeker's own notification feed.
- No admin notification, no inbox, no email, no record outside the seeker's bell icon.
- No category/severity, no status (open/in-progress/resolved), no admin reply path.

This is effectively a dead-end form. We will replace it with a real ticket pipeline.

---

## Proposed fix

### 1. New table `support_tickets`

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| seeker_id | uuid → profiles.id | who submitted |
| kind | text check (`issue`,`feature`) | |
| category | text nullable | issue type from dropdown |
| description | text not null | |
| status | text default `open` | `open`,`in_progress`,`resolved`,`closed` |
| admin_reply | text nullable | |
| resolved_at | timestamptz nullable | |
| created_at / updated_at | timestamptz | |

RLS:
- Seekers: insert + select their own rows.
- Admins: full access via `is_admin(auth.uid())`.

### 2. On submit (seeker side)

`submitIssue` / `submitFeature` in `SeekerHelp.tsx`:
- Insert into `support_tickets` (kind = `issue` | `feature`).
- Also insert a `notifications` row for **every admin** (loop or use a SECURITY DEFINER RPC `notify_admins_of_ticket(ticket_id)`) so admins see a bell alert linking to the new admin Support Inbox page.
- Toast: "✅ Reported — our team has been notified."

### 3. New admin page `/admin/support`

- Sidebar link: **Support Inbox** under Admin tools.
- Table grouped by tabs: **Issues** / **Feature Requests** / **Resolved**.
- Columns: Seeker, Category, Excerpt, Submitted, Status.
- Row click → side panel with full description, seeker contact, dropdown to change status, textarea for admin reply.
- Saving an admin reply also pushes a `notifications` row back to the seeker so they see it in their bell.

### 4. Email update

`SeekerHelp.tsx` line 135 + 139: replace `support@vivekdoba.in` (both the `mailto:` link and the visible label) with **`info@vivekdoba.com`**.

### 5. Optional outbound email (uses existing Resend integration)

When a ticket is created, fire a notification email to `info@vivekdoba.com` via the existing email infra so admins get an inbox copy too. If you'd rather keep it in-app only for now, we'll skip this — say the word.

---

## Files to change

- `supabase/migrations/<new>.sql` — create `support_tickets` table + RLS + `notify_admins_of_ticket` RPC.
- `src/pages/seeker/SeekerHelp.tsx` — update email string + rewrite both `submitIssue` / `submitFeature` to use the new table and admin notify RPC.
- `src/pages/admin/AdminSupportInbox.tsx` (new) — admin triage UI.
- `src/App.tsx` — add `/admin/support` route.
- `src/components/AdminLayout.tsx` (or admin sidebar source) — add "Support Inbox" link with a badge for unresolved count.

## Out of scope

- Live chat (already shown as "coming soon" placeholder — left untouched).
- WhatsApp deep-linking the issue text (can be added later).
