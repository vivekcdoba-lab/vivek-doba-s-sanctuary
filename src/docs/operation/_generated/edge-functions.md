# Edge Functions

_Generated: 2026-09-24T08:18:37.077Z_

Total: **29** serverless functions deployed via Lovable Cloud.

| Function | Purpose (from header) | Secrets used |
|---|---|---|
| `admin-create-user` | — | RESEND_FROM |
| `admin-reset-password` | — | — |
| `approve-application` | — | — |
| `auth-email-hook` | Configuration | LOVABLE_API_KEY, LOVABLE_SEND_URL |
| `daily-session-report` | HTML-escape DB-sourced values to prevent stored HTML injection in admin emails. | CRON_SECRET |
| `delete-seeker` | — | — |
| `get-signature-request` | — | — |
| `handle-email-events` | — | LOVABLE_API_KEY |
| `notify-contact-submission` | — | — |
| `notify-session-submitted` | Notify a seeker (email + in-app notification) that their coach has submitted | APP_PUBLIC_URL |
| `preview-transactional-email` | Renders all registered templates with their previewData. | LOVABLE_API_KEY |
| `request-document-signature` | — | APP_PUBLIC_URL |
| `resend-document-signature` | — | APP_PUBLIC_URL |
| `seed-test-notifications` | no body | — |
| `send-daily-seeker-reports` | — | CRON_SECRET |
| `send-evening-gratitude-nudge` | Daily 7 PM IST nudge to seekers: complete tasks + write gratitude. | — |
| `send-lgt-invite` | — | — |
| `send-lgt-report` | — | — |
| `send-notification` | RESEND_API_KEY no longer used — emails go through Lovable Emails queue | RESEND_FROM |
| `send-otp` | OTP must be callable without auth (it's used during login flow) | TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN |
| `send-pre-session-prep-reminder` | Hourly job. For seekers whose next session falls 23–25 hours from now, | — |
| `send-session-invite` | Send a calendar invite (.ics) email for a coaching session. | — |
| `send-test-email` | Sends one branded test email to each of admin / coach / seeker. | — |
| `send-whatsapp` | — | TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN |
| `session-heartbeat` | ignore | — |
| `sign-document-inline` | optional | — |
| `submit-signature` | notifications table optional | — |
| `super-admin-change-own-password` | — | — |
| `verify-otp` | — | — |
