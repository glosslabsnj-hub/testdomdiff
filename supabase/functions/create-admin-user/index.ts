import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://domdifferent.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, firstName, lastName, planType, isAdmin, action, userId: deleteUserId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

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
    const expiresAt = planType === "transformation" 
      ? new Date(Date.now() + 84 * 24 * 60 * 60 * 1000).toISOString() 
      : null;

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
