import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://esm.sh/zod@3.23.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%&*!?_\-+=]).{12,}$/;

const BodySchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(12).regex(PASSWORD_REGEX, 'Password does not meet complexity requirements'),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
    const callerEmail = userData.user.email;

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, 400);
    }
    const { current_password, new_password } = parsed.data;

    if (current_password === new_password) {
      return json({ error: 'New password must be different from current password' }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Authorization: caller must be super admin
    const { data: isSuper } = await admin.rpc('is_super_admin', { _user_id: callerUserId });
    if (!isSuper) return json({ error: 'Forbidden: super admin only' }, 403);

    if (!callerEmail) return json({ error: 'Caller has no email on file' }, 400);

    // Re-authenticate with current password using a fresh client
    const verifyClient = createClient(SUPABASE_URL, ANON_KEY);
    const { error: signInErr } = await verifyClient.auth.signInWithPassword({
      email: callerEmail,
      password: current_password,
    });
    if (signInErr) {
      return json({ error: 'Current password is incorrect' }, 401);
    }

    // Update password via service role
    const { error: updErr } = await admin.auth.admin.updateUserById(callerUserId, {
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

    // Caller name
    const { data: callerProfile } = await admin
      .from('profiles')
      .select('full_name, email')
      .eq('user_id', callerUserId)
      .maybeSingle();
    const callerName = callerProfile?.full_name || callerProfile?.email || 'Super Admin';
    const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Fetch all other admins
    const { data: admins } = await admin
      .from('profiles')
      .select('id, user_id, full_name, email')
      .eq('role', 'admin')
      .neq('user_id', callerUserId);

    const recipients = (admins || []).filter(a => a.email);

    // In-app notifications
    let notified = 0;
    for (const a of recipients) {
      try {
        await admin.from('notifications').insert({
          user_id: a.id,
          type: 'system',
          title: 'Super Admin password changed',
          message: `${callerName} changed their password on ${istTime} IST.`,
        });
        notified++;
      } catch (e) {
        console.error('notification failed for', a.email, e);
      }
    }

    // Resolve from-address
    let fromAddress = Deno.env.get('RESEND_FROM') || 'VDTS <info@vivekdoba.com>';
    try {
      const { data: setting } = await admin
        .from('app_settings').select('value').eq('key', 'email_from').maybeSingle();
      if (setting?.value && typeof setting.value === 'string') fromAddress = setting.value as string;
    } catch (e) {
      console.warn('app_settings lookup failed:', (e as Error).message);
    }

    // Emails
    let emailed = 0;
    const email_errors: string[] = [];
    if (RESEND_API_KEY) {
      const safeName = escapeHtml(callerName);
      const safeTime = escapeHtml(istTime);
      for (const a of recipients) {
        try {
          const html = `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222">
              <h2 style="color:#800020;margin:0 0 16px">Security notice: Super Admin password was changed</h2>
              <p>Hello ${escapeHtml(a.full_name || 'Admin')},</p>
              <p>This is a security notice that the Super Admin <strong>${safeName}</strong> changed their account password on <strong>${safeTime} IST</strong>.</p>
              <p>No action is required from you. This message is sent to all administrators for transparency and audit purposes.</p>
              <p style="background:#FFF8F0;border-left:4px solid #FF6B00;padding:12px;margin:16px 0">
                If you believe this change was unauthorized, contact support immediately at
                <a href="mailto:vdtssolutions@gmail.com">vdtssolutions@gmail.com</a>.
              </p>
              <p style="color:#666;font-size:12px;margin-top:24px">— Vivek Doba Training Solutions</p>
            </div>`;
          const r = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: fromAddress,
              to: [a.email],
              subject: 'Security notice: Super Admin password was changed',
              html,
            }),
          });
          if (r.ok) {
            emailed++;
          } else {
            const txt = await r.text();
            email_errors.push(`${a.email}: ${r.status} ${txt}`);
          }
        } catch (e) {
          email_errors.push(`${a.email}: ${(e as Error).message}`);
        }
      }
    } else {
      email_errors.push('RESEND_API_KEY not configured');
    }

    return json({
      success: true,
      notified,
      emailed,
      email_errors: email_errors.length ? email_errors : undefined,
    });
  } catch (e) {
    console.error('super-admin-change-own-password error', e);
    return json({ error: (e as Error).message || 'Server error' }, 500);
  }
});
