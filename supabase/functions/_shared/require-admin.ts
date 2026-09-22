// Shared helper to require admin (or service-role) auth on edge functions.
// Returns null if authorized, otherwise a Response to return immediately.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export async function requireAdminOrCron(
  req: Request,
  corsHeaders: Record<string, string>,
  allowScheduledAnon = false,
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

  // Managed pg_cron invokes explicitly opted-in scheduled functions with the
  // project's anon key. Compare it directly because anon JWTs have no user
  // subject and therefore cannot pass the admin lookup below.
  if (allowScheduledAnon && token === Deno.env.get("SUPABASE_ANON_KEY")) return null;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );

  let claimsRes;
  try {
    const result = await supabase.auth.getClaims(token);
    if (result.error) {
      console.error("[require-admin] token validation failed", result.error.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    claimsRes = result.data;
  } catch (error) {
    console.error("[require-admin] token validation threw", error);
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Scheduled database jobs may carry a valid service-role JWT that is not
  // byte-for-byte identical to the currently exposed environment value.
  if (claimsRes?.claims?.role === "service_role") return null;

  if (!claimsRes?.claims?.sub) {
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
