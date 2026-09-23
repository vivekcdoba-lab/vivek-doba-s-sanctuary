// Sends one branded test email to each of admin / coach / seeker.
// Requires service-role auth.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { requireAdminOrCron } from '../_shared/require-admin.ts';
import { sendEmail } from '../_shared/send-email.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const RECIPIENTS: Array<{ email: string; role: string; name: string }> = [
  { email: 'vivekcdoba@gmail.com',   role: 'admin',  name: 'Admin' },
  { email: 'coachviveklgt@gmail.com', role: 'coach',  name: 'Coach' },
  { email: 'crwanare@gmail.com',     role: 'seeker', name: 'Seeker' },
];

function html(roleLabel: string) {
  return `<!DOCTYPE html><html><body style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#FFF8F0;padding:24px;color:#1a1a1a">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #f0e0d0">
    <div style="background:linear-gradient(135deg,#FF6B00,#800020);padding:20px 24px;color:#fff">
      <div style="font-size:12px;opacity:.85;letter-spacing:.5px">VDBM — EMAIL TEST</div>
      <div style="font-size:20px;font-weight:700;margin-top:4px">✅ Email infrastructure is live</div>
    </div>
    <div style="padding:24px;line-height:1.7;font-size:14px">
      <p>Hi <b>${roleLabel}</b>,</p>
      <p>This is a test email from <b>Vivek Doba Business Mastery</b> sent through our verified domain <b>notify.vivekdoba.com</b>.</p>
      <p>If you received this, the full email pipeline (queue → dispatcher → Lovable Emails → inbox) is working end-to-end.</p>
      <p style="margin-top:20px;color:#666;font-size:13px">Sent at: ${new Date().toISOString()}</p>
    </div>
    <div style="padding:16px 24px;border-top:1px solid #f0e0d0;font-size:11px;color:#888">
      You're receiving this because you're listed as a ${roleLabel.toLowerCase()} test recipient. Safe to ignore.
    </div>
  </div></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const denied = await requireAdminOrCron(req, corsHeaders);
  if (denied) return denied;

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const results: Array<{ to: string; sent: boolean; error?: string }> = [];

    for (const r of RECIPIENTS) {
      const result = await sendEmail(supabase, {
        to: r.email,
        subject: `✅ VDBM Test Email — ${r.name}`,
        html: html(r.name),
        text: `Hi ${r.name}, this is a test email from VDBM via notify.vivekdoba.com. If you got this, the pipeline works.`,
        label: 'test_email',
      });
      results.push({ to: r.email, sent: result.ok, error: result.error });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Test email sends completed.',
      results,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({
      success: false,
      error: e instanceof Error ? e.message : String(e),
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
