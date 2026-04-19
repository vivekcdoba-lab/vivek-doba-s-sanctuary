import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const targetEmail = "vdtssolutions@gmail.com";
  const newPassword = "Eshanvi@2026";

  // Find user by email
  let userId: string | null = null;
  let page = 1;
  while (page < 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const found = data.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (found) { userId = found.id; break; }
    if (data.users.length < 200) break;
    page++;
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "user not found", email: targetEmail }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const { error: updErr } = await admin.auth.admin.updateUserById(userId, { password: newPassword });
  if (updErr) {
    return new Response(JSON.stringify({ error: updErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Clear must_change_password flag if set, so they can log in normally
  await admin.from("profiles").update({ must_change_password: false }).eq("user_id", userId);

  return new Response(JSON.stringify({ ok: true, email: targetEmail, user_id: userId }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
