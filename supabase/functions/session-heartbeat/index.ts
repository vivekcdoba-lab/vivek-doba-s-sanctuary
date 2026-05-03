import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Browser fingerprint: SHA-256 of UA + Accept-Language. Stable for the same
// browser/device, different across browsers — so a stolen access token
// replayed elsewhere will fail the next heartbeat and the session will close.
async function computeFingerprint(req: Request): Promise<string> {
  const ua = req.headers.get("user-agent") || "";
  const lang = req.headers.get("accept-language") || "";
  const buf = new TextEncoder().encode(`${ua}|${lang}`);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Allow unauthenticated 'end_beacon' calls (browser unload via sendBeacon
    // can't attach Authorization headers). The action only ever closes a
    // matching active session — it never grants access — so the blast radius
    // is limited to a denial-of-session for someone who already knows a
    // valid session_id UUID.
    let earlyBody: any = null;
    let earlyAction: string | undefined;
    try {
      const cloned = req.clone();
      earlyBody = await cloned.json();
      earlyAction = earlyBody?.action;
    } catch { /* ignore */ }

    if (earlyAction === "end_beacon") {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const sid = earlyBody?.session_id;
      if (!sid || typeof sid !== "string") {
        return new Response(JSON.stringify({ error: "session_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      }
      // Look up to compute duration; only close if currently active.
      const { data: row } = await supabaseAdmin
        .from("user_sessions")
        .select("id, login_at, status")
        .eq("id", sid)
        .maybeSingle();
      if (row && row.status === "active") {
        const duration = Math.floor((Date.now() - new Date(row.login_at).getTime()) / 1000);
        await supabaseAdmin
          .from("user_sessions")
          .update({
            status: "closed",
            logout_reason: "browser_close",
            logout_at: new Date().toISOString(),
            duration_seconds: duration,
          })
          .eq("id", sid)
          .eq("status", "active");
      }
      return new Response(JSON.stringify({ closed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate JWT signature using getClaims (does not require live auth session)
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", active: false, reason: "invalid_token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    const body = await req.json();
    const { action, session_id } = body;

    if (!action || !["start", "heartbeat", "end"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "Invalid action. Use start, heartbeat, or end" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    if (action === "start") {
      // Get profile info
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id, role")
        .eq("user_id", userId)
        .maybeSingle();

      const role = profile?.role || "seeker";
      const profileId = profile?.id || null;

      let forcedPrevious = false;

      // Single-device enforcement for seekers
      if (role === "seeker") {
        const { data: activeSessions } = await supabaseAdmin
          .from("user_sessions")
          .select("id, login_at")
          .eq("user_id", userId)
          .eq("status", "active");

        if (activeSessions && activeSessions.length > 0) {
          forcedPrevious = true;
          for (const s of activeSessions) {
            await supabaseAdmin
              .from("user_sessions")
              .update({
                status: "closed",
                logout_reason: "forced",
                logout_at: new Date().toISOString(),
                duration_seconds: Math.floor(
                  (Date.now() - new Date(s.login_at).getTime()) / 1000
                ),
              })
              .eq("id", s.id);
          }
        }
      }

      // Insert new session (with browser fingerprint binding)
      const fp = await computeFingerprint(req);
      const { data: newSession, error: insertError } = await supabaseAdmin
        .from("user_sessions")
        .insert({
          user_id: userId,
          profile_id: profileId,
          role,
          status: "active",
          ip_address: ipAddress,
          user_agent: userAgent,
          fingerprint_hash: fp,
        })
        .select("id")
        .single();

      if (insertError) {
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          session_id: newSession.id,
          forced_previous: forcedPrevious,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "heartbeat") {
      if (!session_id) {
        return new Response(
          JSON.stringify({ error: "session_id required for heartbeat" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Close inactive sessions globally
      await supabaseAdmin.rpc("close_inactive_sessions");

      // Check if this session is still active
      const { data: session } = await supabaseAdmin
        .from("user_sessions")
        .select("status, logout_reason, fingerprint_hash")
        .eq("id", session_id)
        .eq("user_id", userId)
        .maybeSingle();

      if (!session || session.status === "closed") {
        return new Response(
          JSON.stringify({
            active: false,
            reason: session?.logout_reason || "not_found",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fingerprint check: a stolen token replayed from another browser
      // will not match. Close the session and force re-login.
      const fpNow = await computeFingerprint(req);
      if (session.fingerprint_hash && session.fingerprint_hash !== fpNow) {
        await supabaseAdmin
          .from("user_sessions")
          .update({
            status: "closed",
            logout_reason: "fingerprint_mismatch",
            logout_at: new Date().toISOString(),
          })
          .eq("id", session_id)
          .eq("status", "active");
        return new Response(
          JSON.stringify({ active: false, reason: "fingerprint_mismatch" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Backfill fingerprint for sessions started before this rollout
      if (!session.fingerprint_hash) {
        await supabaseAdmin
          .from("user_sessions")
          .update({ fingerprint_hash: fpNow, last_activity_at: new Date().toISOString() })
          .eq("id", session_id);
      } else {
        await supabaseAdmin
          .from("user_sessions")
          .update({ last_activity_at: new Date().toISOString() })
          .eq("id", session_id);
      }

      return new Response(JSON.stringify({ active: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "end") {
      if (!session_id) {
        return new Response(
          JSON.stringify({ error: "session_id required for end" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: session } = await supabaseAdmin
        .from("user_sessions")
        .select("login_at")
        .eq("id", session_id)
        .eq("user_id", userId)
        .maybeSingle();

      const duration = session
        ? Math.floor((Date.now() - new Date(session.login_at).getTime()) / 1000)
        : null;

      await supabaseAdmin
        .from("user_sessions")
        .update({
          status: "closed",
          logout_reason: body.reason || "manual",
          logout_at: new Date().toISOString(),
          duration_seconds: duration,
        })
        .eq("id", session_id)
        .eq("user_id", userId);

      return new Response(JSON.stringify({ closed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("session-heartbeat error", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
