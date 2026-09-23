import { createEmailWebhookHandler } from 'npm:@lovable.dev/email-js@0.1.0'
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

type Outcome = 'bounced' | 'complained' | 'suppressed'
type SuppressionReason = 'bounce' | 'complaint' | 'unsubscribe'

async function recordOutcome(
  event: { event_id: string; data: { recipient: string; message_id?: string } },
  status: Outcome,
  reason: SuppressionReason,
  errorMessage: string
) {
  const recipient = event.data.recipient.toLowerCase()
  const eventKey = event.event_id

  const { data: existing, error: lookupError } = await supabase
    .from('email_send_log')
    .select('id')
    .eq('message_id', eventKey)
    .maybeSingle()
  if (lookupError) throw lookupError
  if (existing) return

  const { error: suppressionError } = await supabase
    .from('suppressed_emails')
    .upsert({ email: recipient, reason, metadata: null }, { onConflict: 'email' })
  if (suppressionError) {
    console.error('Failed to record email suppression', {
      event_id: event.event_id,
      code: suppressionError.code,
      message: suppressionError.message,
    })
    throw suppressionError
  }

  const { error: logError } = await supabase.from('email_send_log').insert({
    message_id: eventKey,
    template_name: 'system',
    recipient_email: recipient,
    status,
    error_message: errorMessage,
  })
  if (logError) {
    console.error('Failed to record email event', {
      event_id: event.event_id,
      code: logError.code,
      message: logError.message,
    })
    throw logError
  }
}

const handler = createEmailWebhookHandler({
  apiKey: Deno.env.get('LOVABLE_API_KEY')!,
  on: {
    'email.bounced': async (event) => {
      await recordOutcome(event, 'bounced', 'bounce', 'Email bounced')
    },
    'email.complaint': async (event) => {
      await recordOutcome(event, 'complained', 'complaint', 'Email complaint received')
    },
    'email.unsubscribed': async (event) => {
      await recordOutcome(event, 'suppressed', 'unsubscribe', 'Recipient unsubscribed')
    },
  },
})

Deno.serve((req) => handler(req))
