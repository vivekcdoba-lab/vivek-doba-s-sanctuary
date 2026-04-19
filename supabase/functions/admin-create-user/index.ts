import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function randomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let p = '';
  for (let i = 0; i < 16; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
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
      // Only super admins can create another super admin
      if (resolvedLevel === 'super_admin' && !callerIsSuper) {
        resolvedLevel = 'admin';
      }
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

    const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%&*!?_\-+=]).{12,}$/;
    let adminProvidedPassword = false;
    let finalPassword: string;
    if (password && typeof password === 'string') {
      if (!PASSWORD_REGEX.test(password)) {
        return new Response(JSON.stringify({ error: 'Password must be min 12 chars with 1 uppercase, 1 number, and 1 special character (@#$%&*!?_-+=)' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      finalPassword = password;
      adminProvidedPassword = true;
    } else {
      finalPassword = randomPassword();
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

    return new Response(JSON.stringify({
      success: true,
      user_id: newUserId,
      email,
      temp_password: adminProvidedPassword ? null : finalPassword,
      password_set_by_admin: adminProvidedPassword,
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
