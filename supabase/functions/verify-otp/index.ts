import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { identifier, otp_code } = await req.json();

    if (!identifier || !otp_code) {
      return new Response(JSON.stringify({ error: "Missing identifier or OTP" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("identifier", identifier)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ valid: false, error: "OTP not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiry
    if (new Date(data.expires_at) < new Date()) {
      return new Response(JSON.stringify({ valid: false, error: "OTP expired" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already used
    if (data.is_used) {
      return new Response(JSON.stringify({ valid: false, error: "OTP already used" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check attempts (max 3)
    if (data.attempts >= 3) {
      return new Response(JSON.stringify({ valid: false, error: "Too many attempts" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prefer encrypted code if present; fall back to plaintext column for back-compat
    let storedCode: string | null = data.otp_code ?? null;
    if (data.code_enc) {
      try {
        const { data: dec, error: decErr } = await supabase.rpc("decrypt_field" as any, { _payload: data.code_enc });
        if (!decErr && dec) storedCode = dec as string;
      } catch (e) {
        console.error("OTP decrypt failed, falling back to plaintext:", e);
      }
    }

    if (storedCode !== otp_code) {
      // Increment attempts
      await supabase.from("otp_codes").update({ attempts: data.attempts + 1 }).eq("identifier", identifier);
      return new Response(JSON.stringify({ valid: false, error: "Invalid OTP" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark as used
    await supabase.from("otp_codes").update({ is_used: true }).eq("identifier", identifier);

    return new Response(JSON.stringify({ valid: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
