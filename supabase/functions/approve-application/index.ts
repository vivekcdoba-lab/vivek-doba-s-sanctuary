import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.1/cors";

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

    // Validate caller is admin
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

    // Fetch submission
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

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u: any) => u.email === sub.email
    );

    let profileId: string;

    if (existingUser) {
      // User already exists - just get their profile
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("user_id", existingUser.id)
        .single();

      if (existingProfile) {
        profileId = existingProfile.id;
        // Update profile with submission data
        await supabaseAdmin
          .from("profiles")
          .update({
            city: fd.city || "",
            state: fd.state || "",
            company: fd.company || fd.companyName || "",
            occupation: fd.profession || fd.designation || fd.occupation || "",
            role: "seeker",
          })
          .eq("id", profileId);
      } else {
        return new Response(
          JSON.stringify({ error: "User exists but profile not found" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else {
      // Create new auth user - trigger will auto-create profile
      const tempPassword =
        "Welcome@" + Math.random().toString(36).slice(-8) + "!1";
      const { data: newUser, error: createErr } =
        await supabaseAdmin.auth.admin.createUser({
          email: sub.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: sub.full_name,
            phone: sub.mobile || "",
            role: "seeker",
            city: fd.city || "",
            state: fd.state || "",
            company: fd.company || fd.companyName || "",
            occupation: fd.profession || fd.designation || fd.occupation || "",
          },
        });

      if (createErr || !newUser?.user) {
        return new Response(
          JSON.stringify({
            error: "Failed to create user",
            details: createErr?.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Wait briefly for trigger to create profile
      await new Promise((r) => setTimeout(r, 1000));

      const { data: newProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("user_id", newUser.user.id)
        .single();

      if (!newProfile) {
        return new Response(
          JSON.stringify({ error: "Profile creation failed" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      profileId = newProfile.id;
    }

    // Try to create enrollment if course matches
    const programName = (
      fd.programName ||
      fd.workshopName ||
      fd.workshopId ||
      fd.programId ||
      ""
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

    // Update submission status
    await supabaseAdmin
      .from("submissions")
      .update({ status: "approved" })
      .eq("id", submission_id);

    return new Response(
      JSON.stringify({ success: true, profile_id: profileId }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error", details: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
