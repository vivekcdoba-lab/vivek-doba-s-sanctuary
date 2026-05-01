# External Integrations

| Service | Used for | Secrets | Where |
|---|---|---|---|
| **Resend** | Transactional email (welcome, OTP, daily reports, support replies) | `RESEND_API_KEY` | Edge functions: `send-otp`, `send-daily-seeker-reports`, `send-test-email`, `process-email-queue`, `send-lgt-invite`, etc. |
| **Twilio** | SMS OTP + WhatsApp messages | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | Edge: `send-otp` (SMS branch), `send-whatsapp` |
| **Lovable AI Gateway** | AI summaries, content generation, chat | `LOVABLE_API_KEY` | Any future AI edge function |
| **Google Fit** | Health data sync (steps, heart rate, sleep) | _(OAuth on client)_ | Direct REST from browser |
| **PWA / Push** | Installable app + push notifications | _(VAPID keys when enabled)_ | Service worker |

## Email infrastructure

- Outbound queue: **pgmq** (Postgres message queue) backed by `enqueue_email`, `read_email_batch`, `delete_email`, `move_to_dlq`.
- Drained by `process-email-queue` edge function on a cron.
- Suppressions: `suppressed_emails` (bounces, unsubscribes).
- Per-recipient state: `email_send_state` to dedupe and rate-limit.
- Audit: `email_log`, `email_send_log`.
- Inbound webhook: Resend → Lovable Cloud edge function → `support_tickets` enrichment (planned).

## SMS / WhatsApp

- OTP SMS via Twilio Programmable Messaging.
- WhatsApp via Twilio's WhatsApp Business API sandbox (production needs approved templates).
- Rate limited per recipient.

## Lovable AI models available

- `google/gemini-2.5-pro` — best for big-context reasoning
- `google/gemini-2.5-flash` — balanced
- `google/gemini-2.5-flash-lite` — cheap classification
- `openai/gpt-5` — top reasoning
- `openai/gpt-5-mini` — balanced
- `openai/gpt-5-nano` — speed

No API key required — calls go through `LOVABLE_API_KEY` automatically.

## PWA

- Installable on iOS/Android home screen and desktop.
- Apple meta tags configured for proper iOS install.
- Scope limited to `/install` to prevent the entire app being a captured PWA — keeps deep links shareable.
