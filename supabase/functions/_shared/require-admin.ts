// Shared helper to require admin (or service-role) auth on edge functions.
// Returns null if authorized, otherwise a Response to return immediately.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export async function requireAdminOrCron(
  req: Request,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  // 1) Cron secret short-circuit
  const cronSecret = Deno.env.get("CRON_SECRET");
  const providedCron = req.headers.get("x-cron-secret");
  if (cronSecret && providedCron && providedCron === cronSecret) return null;

  // 2) Bearer token: must be a valid admin JWT (or service-role)
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const token = authHeader.slice("Bearer ".length).trim();

  // Service-role key shortcut
  if (token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) return null;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );

  const { data: claimsRes, error } = await supabase.auth.getClaims(token);
  if (error || !claimsRes?.claims?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Verify admin role via profiles using the service-role client
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("user_id", claimsRes.claims.sub)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return null;
}
