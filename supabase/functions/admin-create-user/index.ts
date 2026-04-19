import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%&*!?_\-+=]).{12,}$/;

function randomPassword() {
  // Generate a 14-char password guaranteed to satisfy PASSWORD_REGEX
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '@#$%&*!?_-+=';
  const all = upper + lower + digits + special;
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  let chars = [pick(upper), pick(digits), pick(special)];
  for (let i = 0; i < 11; i++) chars.push(pick(all));
  // shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  const pwd = chars.join('');
  return PASSWORD_REGEX.test(pwd) ? pwd : pwd + 'Aa9!';
}

const PERMISSION_KEYS = [
  'manage_users','manage_coaches','manage_seekers','manage_courses',
  'manage_payments','manage_content','view_analytics','manage_settings',
];

function sanitizePermissions(input: any): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  if (!input || typeof input !== 'object') return out;
  for (const k of PERMISSION_KEYS) out[k] = !!input[k];
  return out;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]!));
}

function buildEmail(opts: { name: string; email: string; password: string; role: string; isTemp: boolean; loginUrl: string; }) {
  const { name, email, password, role, isTemp, loginUrl } = opts;
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const passwordNote = isTemp
    ? `<p style="margin:12px 0;color:#7a4a00;font-size:14px;">⚠️ This is a <strong>temporary password</strong>. You will be asked to set your own password the first time you sign in.</p>`
    : `<p style="margin:12px 0;color:#555;font-size:14px;">You may keep this password or change it from your profile after signing in.</p>`;

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#FFF8F0;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F0;padding:32px 12px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #f0e3cf;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#FF6B00,#800020);padding:28px;text-align:center;color:#ffffff;">
          <div style="font-size:36px;line-height:1;">ॐ</div>
          <div style="margin-top:8px;font-size:20px;font-weight:700;">Vivek Doba Training Solutions</div>
          <div style="margin-top:4px;font-size:13px;opacity:.85;">Begin your sacred session</div>
        </td></tr>
        <tr><td style="padding:28px;">
          <h2 style="margin:0 0 8px;color:#222;font-size:20px;">Welcome, ${escapeHtml(name)} 🙏</h2>
          <p style="margin:0 0 16px;color:#444;font-size:15px;line-height:1.55;">
            A ${escapeHtml(roleLabel)} account has been created for you on the VDTS platform. Use the credentials below to sign in.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F0;border:1px solid #f0e3cf;border-radius:12px;padding:16px;margin:12px 0 18px;">
            <tr><td style="padding:6px 0;font-size:13px;color:#666;">Email</td>
                <td style="padding:6px 0;font-size:14px;color:#222;font-weight:600;text-align:right;">${escapeHtml(email)}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:#666;">Password</td>
                <td style="padding:6px 0;font-size:14px;color:#222;font-weight:700;font-family:Menlo,Consolas,monospace;text-align:right;">${escapeHtml(password)}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:#666;">Role</td>
                <td style="padding:6px 0;font-size:14px;color:#222;font-weight:600;text-align:right;">${escapeHtml(roleLabel)}</td></tr>
          </table>
          ${passwordNote}
          <div style="text-align:center;margin:22px 0 8px;">
            <a href="${loginUrl}" style="display:inline-block;background:#FF6B00;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:15px;">Sign In</a>
          </div>
          <p style="margin:18px 0 0;color:#888;font-size:12px;text-align:center;">If you didn't expect this email, you can safely ignore it.</p>
        </td></tr>
        <tr><td style="background:#FFF8F0;padding:14px;text-align:center;color:#888;font-size:12px;border-top:1px solid #f0e3cf;">
          © Vivek Doba Training Solutions
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function sendCredentialsEmail(opts: {
  to: string; name: string; role: string; password: string; isTemp: boolean; loginUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) {
    console.error('[email] RESEND_API_KEY not configured');
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }
  // Sender uses the verified vivekdoba.com domain. Override via RESEND_FROM env if needed.
  const from = Deno.env.get('RESEND_FROM') || 'VDTS <noreply@vivekdoba.com>';
  try {
    const html = buildEmail(opts);
    const subject = opts.isTemp
      ? 'Your VDTS account — temporary password inside'
      : 'Your VDTS account credentials';
    console.log('[email] sending', { to: opts.to, from, subject, isTemp: opts.isTemp });
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [opts.to], subject, html }),
    });
    const bodyText = await res.text();
    if (!res.ok) {
      console.error('[email] resend failed', res.status, bodyText.slice(0, 500));
      return { ok: false, error: `Resend ${res.status}: ${bodyText.slice(0, 200)}` };
    }
    console.log('[email] resend ok', bodyText.slice(0, 200));
    return { ok: true };
  } catch (e) {
    console.error('[email] exception', (e as Error).message);
    return { ok: false, error: (e as Error).message };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: callerProfile } = await admin
      .from('profiles').select('role, admin_level').eq('user_id', userData.user.id).maybeSingle();
    if (callerProfile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: admin only' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const callerIsSuper = callerProfile?.admin_level === 'super_admin';

    const body = await req.json().catch(() => ({}));
    const {
      email, full_name, phone, role,
      password = null,
      city = '', state = '', company = '', occupation = '', gender = '',
      course_id = null,
      admin_level = null,
      admin_permissions = null,
      auto_generate_password = false,
    } = body || {};

    if (!email || !full_name || !phone || !role) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!['admin', 'coach', 'seeker'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Invalid role' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Resolve admin level + permissions (only if creating an admin)
    let resolvedLevel: string | null = null;
    let resolvedPerms: Record<string, boolean> | null = null;
    if (role === 'admin') {
      resolvedLevel = admin_level === 'super_admin' ? 'super_admin' : 'admin';
      if (resolvedLevel === 'super_admin' && !callerIsSuper) resolvedLevel = 'admin';
      if (resolvedLevel === 'super_admin') {
        resolvedPerms = PERMISSION_KEYS.reduce((acc, k) => { acc[k] = true; return acc; }, {} as Record<string, boolean>);
      } else {
        resolvedPerms = sanitizePermissions(admin_permissions);
      }
    }

    // Duplicate check
    const { data: dup } = await admin.rpc('check_profile_duplicate', { _email: email, _phone: phone });
    if (dup === 'email') {
      return new Response(JSON.stringify({ error: 'Email already registered' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (dup === 'phone') {
      return new Response(JSON.stringify({ error: 'Phone already in use' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Decide password by role:
    //  - seeker: ALWAYS auto-generate temp password (force change on first login)
    //  - admin/coach: REQUIRE admin-typed password (validated 12-char)
    let finalPassword: string;
    let isTempPassword: boolean;
    let mustChange: boolean;

    if (role === 'seeker' || auto_generate_password === true) {
      finalPassword = randomPassword();
      isTempPassword = true;
      mustChange = true;
    } else {
      if (!password || typeof password !== 'string') {
        return new Response(JSON.stringify({ error: 'Password is required when creating an admin or coach' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (!PASSWORD_REGEX.test(password)) {
        return new Response(JSON.stringify({ error: 'Password must be min 12 chars with 1 uppercase, 1 number, and 1 special character (@#$%&*!?_-+=)' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      finalPassword = password;
      isTempPassword = false;
      mustChange = false;
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password: finalPassword,
      email_confirm: true,
      user_metadata: { full_name, phone, city, state, company, occupation, role },
    });
    if (createErr || !created?.user) {
      return new Response(JSON.stringify({ error: createErr?.message || 'Failed to create user' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const newUserId = created.user.id;

    const updatePayload: Record<string, any> = {
      role, full_name, phone, city, state, company, occupation,
      gender: gender || null,
      must_change_password: mustChange,
      password_change_prompted: false,
    };
    if (role === 'admin') {
      updatePayload.admin_level = resolvedLevel;
      updatePayload.admin_permissions = resolvedPerms;
    }

    const { error: updErr } = await admin.from('profiles').update(updatePayload).eq('user_id', newUserId);
    if (updErr) {
      return new Response(JSON.stringify({ error: 'User created but profile update failed: ' + updErr.message, user_id: newUserId }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (role === 'seeker' && course_id) {
      const { data: prof } = await admin.from('profiles').select('id').eq('user_id', newUserId).maybeSingle();
      if (prof?.id) {
        await admin.from('enrollments').insert({ seeker_id: prof.id, course_id, status: 'active' });
      }
    }

    // Compose login URL — derived from request origin so it works on preview & prod
    const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/$/, '') || 'https://vivekdoba.com';
    const loginUrl = `${origin.replace(/\/$/, '')}/login`;

    // Send credentials email (non-blocking failure → still return success)
    const emailResult = await sendCredentialsEmail({
      to: email, name: full_name, role, password: finalPassword, isTemp: isTempPassword, loginUrl,
    });

    return new Response(JSON.stringify({
      success: true,
      user_id: newUserId,
      email,
      email_sent: emailResult.ok,
      email_error: emailResult.ok ? null : emailResult.error,
      is_temp_password: isTempPassword,
      must_change_password: mustChange,
      admin_level: resolvedLevel,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
