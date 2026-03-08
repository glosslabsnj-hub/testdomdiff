import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the caller is an authenticated admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create a client with the caller's JWT to verify identity
    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user: callerUser }, error: authError } = await callerClient.auth.getUser();
    if (authError || !callerUser) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role client for admin operations
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Check that caller is an admin
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRole) {
      return new Response(JSON.stringify({ error: "Forbidden: admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, password, firstName, lastName, planType, isAdmin, action, userId: deleteUserId } = await req.json();

    // Handle delete action
    if (action === "delete" && deleteUserId) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(deleteUserId);
      if (deleteError) {
        return new Response(JSON.stringify({ error: deleteError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true, message: `User ${deleteUserId} deleted` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Create the user via admin API
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (userError) {
      console.error("Error creating user:", userError);
      return new Response(JSON.stringify({ error: userError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    console.log("User created:", userId);

    // Step 2: Create profile with intake completed
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: userId,
      email: email,
      first_name: firstName,
      last_name: lastName,
      intake_completed_at: new Date().toISOString(),
      onboarding_video_watched: true,
    });

    if (profileError) {
      console.error("Error creating profile:", profileError);
    }

    // Step 3: Create subscription
    // Transformation is a one-time purchase with lifetime access (no expiry)
    // Monthly plans (membership/coaching) get expiry managed by Stripe webhooks
    const expiresAt = null;

    const { error: subError } = await supabase.from("subscriptions").insert({
      user_id: userId,
      plan_type: planType,
      status: "active",
      started_at: new Date().toISOString(),
      expires_at: expiresAt,
    });

    if (subError) {
      console.error("Error creating subscription:", subError);
    }

    // Step 4: Assign admin role if requested
    if (isAdmin) {
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: "admin",
      });

      if (roleError) {
        console.error("Error assigning admin role:", roleError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        message: `Account created for ${email} with ${planType} subscription${isAdmin ? " and admin role" : ""}` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
