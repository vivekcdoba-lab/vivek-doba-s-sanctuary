import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]!));
}

function randomTempPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '@#$%&*!?_-+=';
  const all = upper + lower + digits + special;
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  const chars = [pick(upper), pick(lower), pick(digits), pick(special)];
  for (let i = 0; i < 11; i++) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

function buildCredentialsEmail(opts: {
  name: string; email: string; password: string; isTemp: boolean; loginUrl: string;
}) {
  const { name, email, password, isTemp, loginUrl } = opts;
  const passwordNote = isTemp
    ? `<p style="margin:12px 0;color:#7a4a00;font-size:14px;">⚠️ This is a <strong>temporary password</strong>. You will be asked to set your own password the first time you sign in.</p>`
    : `<p style="margin:12px 0;color:#555;font-size:14px;">Use the password you set during registration to sign in.</p>`;
  const credRow = isTemp
    ? `<tr><td style="padding:6px 0;font-size:13px;color:#666;">Temp Password</td>
           <td style="padding:6px 0;font-size:14px;color:#222;font-weight:700;font-family:Menlo,Consolas,monospace;text-align:right;">${escapeHtml(password)}</td></tr>`
    : '';
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#FFF8F0;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F0;padding:32px 12px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;border:1px solid #f0e3cf;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#FF6B00,#800020);padding:28px;text-align:center;color:#fff;">
          <div style="font-size:36px;line-height:1;">🪷</div>
          <div style="margin-top:8px;font-size:20px;font-weight:700;">Vivek Doba Training Solutions</div>
          <div style="margin-top:4px;font-size:13px;opacity:.85;">Your application is approved</div>
        </td></tr>
        <tr><td style="padding:28px;">
          <h2 style="margin:0 0 8px;color:#222;font-size:20px;">Welcome, ${escapeHtml(name)} 🙏</h2>
          <p style="margin:0 0 16px;color:#444;font-size:15px;line-height:1.55;">
            Vivek Sir has reviewed and <strong>approved</strong> your application. Your seeker account is ready. Sign in below to begin your transformation journey.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F0;border:1px solid #f0e3cf;border-radius:12px;padding:16px;margin:12px 0 18px;">
            <tr><td style="padding:6px 0;font-size:13px;color:#666;">Email</td>
                <td style="padding:6px 0;font-size:14px;color:#222;font-weight:600;text-align:right;">${escapeHtml(email)}</td></tr>
            ${credRow}
          </table>
          ${passwordNote}
          <div style="text-align:center;margin:22px 0 8px;">
            <a href="${loginUrl}" style="display:inline-block;background:#FF6B00;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:15px;">Sign In</a>
          </div>
          <p style="margin:18px 0 0;color:#888;font-size:12px;text-align:center;">For any questions: 📞 9607050111 · 📧 info@vivekdoba.com</p>
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
  to: string; name: string; password: string; isTemp: boolean; loginUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) {
    console.error('[email] RESEND_API_KEY not configured');
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }
  const from = Deno.env.get('RESEND_FROM') || 'VDTS <noreply@vivekdoba.com>';
  try {
    const html = buildCredentialsEmail(opts);
    const subject = opts.isTemp
      ? '✅ Application Approved — Your VDTS account (temporary password inside)'
      : '✅ Application Approved — Welcome to VDTS';
    console.log('[email] sending', { to: opts.to, from, subject, isTemp: opts.isTemp });
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user: caller } } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (!caller) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("user_id", caller.id)
      .single();

    if (!callerProfile || callerProfile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { submission_id } = await req.json();
    if (!submission_id) {
      return new Response(JSON.stringify({ error: "submission_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: sub, error: subErr } = await supabaseAdmin
      .from("submissions")
      .select("*")
      .eq("id", submission_id)
      .single();

    if (subErr || !sub) {
      return new Response(JSON.stringify({ error: "Submission not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fd = (sub.form_data as Record<string, any>) || {};
    const isRegistration = sub.form_type === "registration";

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u: any) => u.email === sub.email
    );

    let profileId: string;
    let userIdForEmail: string;
    let credentialsForEmail: { password: string; isTemp: boolean } | null = null;

    if (existingUser) {
      userIdForEmail = existingUser.id;
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("user_id", existingUser.id)
        .single();

      if (existingProfile) {
        profileId = existingProfile.id;
        await supabaseAdmin
          .from("profiles")
          .update({
            city: fd.city || "",
            state: fd.state || "",
            company: fd.company || fd.companyName || "",
            occupation: fd.profession || fd.designation || fd.occupation || "",
            phone: fd.phone || "",
            whatsapp: fd.whatsapp || fd.phone || "",
            role: "seeker",
          })
          .eq("id", profileId);
        // Existing user — they already have credentials; email confirms approval (no password disclosed)
        credentialsForEmail = isRegistration && fd.password
          ? { password: fd.password, isTemp: false }
          : null;
      } else {
        return new Response(
          JSON.stringify({ error: "User exists but profile not found" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // New user — registration uses their chosen password; others get a temp password
      const useUserPassword = isRegistration && fd.password;
      const password = useUserPassword ? fd.password : randomTempPassword();
      const isTemp = !useUserPassword;

      const { data: newUser, error: createErr } =
        await supabaseAdmin.auth.admin.createUser({
          email: sub.email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: sub.full_name,
            phone: sub.mobile || fd.phone || "",
            role: "seeker",
            city: fd.city || "",
            state: fd.state || "",
            company: fd.company || fd.companyName || "",
            occupation: fd.profession || fd.designation || fd.occupation || "",
          },
        });

      if (createErr || !newUser?.user) {
        return new Response(
          JSON.stringify({ error: "Failed to create user", details: createErr?.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userIdForEmail = newUser.user.id;
      await new Promise((r) => setTimeout(r, 1000));

      const { data: newProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("user_id", newUser.user.id)
        .single();

      if (!newProfile) {
        return new Response(
          JSON.stringify({ error: "Profile creation failed" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      profileId = newProfile.id;

      const profileUpdate: Record<string, any> = {
        phone: fd.phone || sub.mobile || "",
        whatsapp: fd.whatsapp || fd.phone || "",
      };
      if (isTemp) {
        profileUpdate.must_change_password = true;
        profileUpdate.password_change_prompted = false;
      }
      await supabaseAdmin.from("profiles").update(profileUpdate).eq("id", profileId);

      credentialsForEmail = { password, isTemp };
    }

    // Try to create enrollment if course matches
    const programName = (
      fd.programName || fd.workshopName || fd.workshopId ||
      fd.programId || fd.course || ""
    ).toString().toLowerCase();

    if (programName) {
      const { data: courses } = await supabaseAdmin
        .from("courses")
        .select("id, tier")
        .eq("is_active", true);
      const matchedCourse = courses?.find((c: any) =>
        programName.includes(c.tier?.toLowerCase() || "___nomatch")
      );
      if (matchedCourse) {
        await supabaseAdmin.from("enrollments").insert({
          seeker_id: profileId,
          course_id: matchedCourse.id,
          tier: matchedCourse.tier,
          status: "active",
          payment_status: "pending",
        });
      }
    }

    // Sanitize and mark approved
    const sanitizedFormData = { ...fd };
    delete sanitizedFormData.password;
    await supabaseAdmin
      .from("submissions")
      .update({ status: "approved", form_data: sanitizedFormData })
      .eq("id", submission_id);

    // Send credentials / approval email DIRECTLY (no dependency on send-notification)
    let emailSent = false;
    let emailError: string | null = null;
    if (credentialsForEmail) {
      const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/$/, '') || 'https://vivekdoba.com';
      const loginUrl = `${origin.replace(/\/$/, '')}/login`;
      const result = await sendCredentialsEmail({
        to: sub.email,
        name: sub.full_name,
        password: credentialsForEmail.password,
        isTemp: credentialsForEmail.isTemp,
        loginUrl,
      });
      emailSent = result.ok;
      emailError = result.ok ? null : (result.error || 'unknown');
    }

    return new Response(
      JSON.stringify({
        success: true,
        profile_id: profileId,
        user_id: userIdForEmail,
        email_sent: emailSent,
        email_error: emailError,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Approve application error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
