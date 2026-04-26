import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://esm.sh/zod@3.23.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%&*!?_\-+=]).{12,}$/;

const BodySchema = z.object({
  target_user_id: z.string().uuid(),
  new_password: z.string().min(12).regex(PASSWORD_REGEX, 'Password does not meet complexity requirements'),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing authorization' }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: 'Unauthorized' }, 401);
    const callerUserId = userData.user.id;

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, 400);
    }
    const { target_user_id, new_password } = parsed.data;

    if (target_user_id === callerUserId) {
      return json({ error: 'Use your account settings to change your own password' }, 403);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Authorization: caller must be admin
    const { data: isAdmin } = await admin.rpc('is_admin', { _user_id: callerUserId });
    if (!isAdmin) return json({ error: 'Forbidden: admin only' }, 403);

    // Get target profile
    const { data: targetProfile, error: tpErr } = await admin
      .from('profiles')
      .select('id, user_id, email, full_name, role')
      .eq('user_id', target_user_id)
      .maybeSingle();
    if (tpErr || !targetProfile) return json({ error: 'Target user not found' }, 404);

    // If target is admin, caller must be super_admin
    if (targetProfile.role === 'admin') {
      const { data: isSuper } = await admin.rpc('is_super_admin', { _user_id: callerUserId });
      if (!isSuper) return json({ error: 'Only super admins can reset another admin\'s password' }, 403);
    }

    // Update password via service role
    const { error: updErr } = await admin.auth.admin.updateUserById(target_user_id, {
      password: new_password,
    });
    if (updErr) {
      const msg = updErr.message || 'Failed to update password';
      const isWeak = /weak|pwned|leaked|easy to guess|compromised/i.test(msg);
      return json(
        { error: isWeak ? 'This password has appeared in a known data breach. Please choose a stronger, unique password.' : msg },
        isWeak ? 400 : 500,
      );
    }

    // Caller name for email
    const { data: callerProfile } = await admin
      .from('profiles')
      .select('full_name, email')
      .eq('user_id', callerUserId)
      .maybeSingle();
    const callerName = callerProfile?.full_name || callerProfile?.email || 'an administrator';

    const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // In-app notification (non-fatal)
    try {
      await admin.from('notifications').insert({
        user_id: targetProfile.id,
        type: 'system',
        title: 'Password Changed',
        message: `Your account password was reset by ${callerName} on ${istTime} IST. If you did not request this, contact support immediately.`,
      });
    } catch (e) {
      console.error('notification insert failed', e);
    }

    // Email via Resend (non-fatal) — with verified-domain fallback
    let email_sent = false;
    let email_error: string | undefined;
    let email_sender_used: string | undefined;
    const FALLBACK_SENDER = 'VDTS <onboarding@resend.dev>';

    if (RESEND_API_KEY && targetProfile.email) {
      let fromAddress = Deno.env.get('RESEND_FROM') || 'VDTS <info@vivekdoba.com>';
      try {
        const { data: setting } = await admin
          .from('app_settings').select('value').eq('key', 'email_from').maybeSingle();
        if (setting?.value && typeof setting.value === 'string') fromAddress = setting.value as string;
      } catch (e) {
        console.warn('app_settings lookup failed:', (e as Error).message);
      }

      const buildHtml = (note?: string) => `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222">
          <h2 style="color:#800020;margin:0 0 16px">Your VDTS account password was changed</h2>
          <p>Hi ${targetProfile.full_name || 'there'},</p>
          <p>This is a security notice that your account password was reset by <strong>${callerName}</strong> on <strong>${istTime} IST</strong>.</p>
          <p>You will need to use the new password on your next login. Please change it after signing in.</p>
          <p style="background:#FFF8F0;border-left:4px solid #FF6B00;padding:12px;margin:16px 0">
            <strong>Did not request this?</strong> Contact support immediately at
            <a href="mailto:vdtssolutions@gmail.com">vdtssolutions@gmail.com</a>.
          </p>
          ${note ? `<p style="color:#9a6500;font-size:12px;margin-top:16px">${note}</p>` : ''}
          <p style="color:#666;font-size:12px;margin-top:24px">— Vivek Doba Training Solutions</p>
        </div>`;

      const sendOnce = async (from: string, html: string) => {
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
            to: [targetProfile.email],
            subject: 'Your VDTS account password was changed',
            html,
          }),
        });
        const bodyText = await r.text();
        let bodyJson: any = null;
        try { bodyJson = JSON.parse(bodyText); } catch { /* not json */ }
        console.log(`[admin-reset-password] resend from="${from}" status=${r.status} body=${bodyText.slice(0, 500)}`);
        return { ok: r.ok, status: r.status, body: bodyJson, raw: bodyText };
      };

      try {
        // Attempt 1: configured sender
        let result = await sendOnce(fromAddress, buildHtml());
        if (result.ok) {
          email_sent = true;
          email_sender_used = fromAddress;
        } else {
          // Detect domain / from-address verification failure
          const msg: string = (result.body?.message || result.raw || '').toString().toLowerCase();
          const looksLikeDomainIssue =
            result.status === 403 ||
            result.body?.name === 'validation_error' ||
            msg.includes('domain') ||
            msg.includes('verify') ||
            msg.includes('not allowed') ||
            msg.includes('from');

          if (looksLikeDomainIssue && fromAddress !== FALLBACK_SENDER) {
            console.warn('[admin-reset-password] primary sender failed, retrying with fallback sender');
            const note = `Note: this email was sent from a temporary verified address because the configured sender (${fromAddress}) could not be used. Ask your admin to verify the domain.`;
            const retry = await sendOnce(FALLBACK_SENDER, buildHtml(note));
            if (retry.ok) {
              email_sent = true;
              email_sender_used = FALLBACK_SENDER;
              email_error = `Primary sender "${fromAddress}" rejected (${result.status}). Sent via fallback.`;
            } else {
              email_error = `Primary: ${result.status} ${result.raw.slice(0, 200)}; Fallback: ${retry.status} ${retry.raw.slice(0, 200)}`;
            }
          } else {
            email_error = `Resend ${result.status}: ${result.raw.slice(0, 300)}`;
          }
        }
      } catch (e) {
        email_error = (e as Error).message;
        console.error('email failed', e);
      }
    } else {
      email_error = 'Resend not configured or target has no email';
    }

    return json({ success: true, password_updated: true, email_sent, email_error, email_sender_used });
  } catch (e) {
    console.error('admin-reset-password error', e);
    return json({ error: (e as Error).message || 'Server error' }, 500);
  }
});
