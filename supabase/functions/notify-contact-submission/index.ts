import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/send-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const ADMIN_EMAIL = "info@vivekdoba.com";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const escapeHtml = (value: unknown) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  try {
    const { submission_id } = await req.json();
    if (!uuidPattern.test(String(submission_id ?? ""))) return new Response(JSON.stringify({ error: "Invalid submission" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await admin.from("contact_submissions").select("id,name,email,phone,message,business_type,annual_turnover_range,program_interest,notification_sent_at,created_at").eq("id", submission_id).maybeSingle();
    if (error || !data) return new Response(JSON.stringify({ error: "Submission not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (data.notification_sent_at) return new Response(JSON.stringify({ success: true, already_sent: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const rows = [
      ["Name", data.name], ["Phone", data.phone], ["Email", data.email], ["Business type", data.business_type],
      ["Annual turnover", data.annual_turnover_range], ["Program interest", data.program_interest], ["Message", data.message],
    ].filter(([, value]) => value).map(([label, value]) => `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eadfd4">${escapeHtml(label)}</th><td style="padding:8px;border-bottom:1px solid #eadfd4">${escapeHtml(value)}</td></tr>`).join("");
    const result = await sendEmail(admin, {
      to: ADMIN_EMAIL,
      subject: `New website enquiry — ${String(data.name).replace(/[\r\n]+/g, " ").slice(0, 100)}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto"><h1 style="color:#7d241d">New website enquiry</h1><table style="width:100%;border-collapse:collapse">${rows}</table></div>`,
      text: `New website enquiry from ${data.name}. Phone: ${data.phone || "Not provided"}. Email: ${data.email}.`,
      label: "website_contact_enquiry",
    });
    if (!result.ok) throw new Error(result.error || "Email could not be sent");
    await admin.from("contact_submissions").update({ notification_sent_at: new Date().toISOString() }).eq("id", data.id).is("notification_sent_at", null);
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("contact notification failed", error instanceof Error ? error.message : String(error));
    return new Response(JSON.stringify({ error: "Notification could not be sent" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
