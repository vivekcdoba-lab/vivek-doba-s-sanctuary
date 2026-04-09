import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate JWT
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } =
      await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
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

      // Insert new session
      const { data: newSession, error: insertError } = await supabaseAdmin
        .from("user_sessions")
        .insert({
          user_id: userId,
          profile_id: profileId,
          role,
          status: "active",
          ip_address: ipAddress,
          user_agent: userAgent,
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
        .select("status, logout_reason")
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

      // Update last activity
      await supabaseAdmin
        .from("user_sessions")
        .update({ last_activity_at: new Date().toISOString() })
        .eq("id", session_id);

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
        .eq("id", session_id);

      return new Response(JSON.stringify({ closed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
