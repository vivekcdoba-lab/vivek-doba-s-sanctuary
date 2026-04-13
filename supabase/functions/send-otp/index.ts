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
    const { email, phone, full_name, type } = await req.json();
    
    if (!type || !["email", "sms", "both"].includes(type)) {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    
    // Store OTP in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store OTP with 15 min expiry
    const { error: storeError } = await supabase.from("otp_codes").upsert({
      identifier: email || phone,
      otp_code: otp,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      attempts: 0,
      is_used: false,
    }, { onConflict: "identifier" });

    if (storeError) {
      console.error("OTP store error:", storeError);
      return new Response(JSON.stringify({ error: "Failed to generate OTP" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: { email?: boolean; sms?: boolean } = {};

    // Send Email OTP
    if (type === "email" || type === "both") {
      try {
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        if (RESEND_API_KEY) {
          const emailRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "VDTS <noreply@vivekdoba.com>",
              to: [email],
              subject: "OTP for Login request",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #B8860B;">VDTS - Verification Code</h2>
                  <p>Dear ${full_name || "Seeker"},</p>
                  <p>OTP for Signin request is <strong style="font-size: 24px; color: #B8860B;">${otp}</strong>.</p>
                  <p>This OTP is valid for 15 minutes or 1 successful attempt whichever is earlier.</p>
                  <p>Please do not share this One Time Password with anyone.</p>
                  <p>If this request is not made by you, please contact us.</p>
                  <br/>
                  <p>Regards,</p>
                  <p><strong>VDTS Team</strong></p>
                </div>
              `,
            }),
          });
          results.email = emailRes.ok;
        }
      } catch (e) {
        console.error("Email OTP error:", e);
        results.email = false;
      }
    }

    // Send SMS OTP via Twilio
    if (type === "sms" || type === "both") {
      try {
        const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
        const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
        
        if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
          const smsPhone = phone?.startsWith("+") ? phone : `+91${phone}`;
          
          const smsRes = await fetch(twilioUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
            },
            body: new URLSearchParams({
              To: smsPhone,
              From: "+919607050111",
              Body: `OTP for Signin request is ${otp}`,
            }),
          });
          results.sms = smsRes.ok;
          if (!smsRes.ok) {
            const err = await smsRes.text();
            console.error("Twilio error:", err);
          }
        }
      } catch (e) {
        console.error("SMS OTP error:", e);
        results.sms = false;
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("OTP function error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
