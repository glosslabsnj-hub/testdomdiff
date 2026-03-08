import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify caller is authenticated and is an admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the JWT and check admin role
    const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user: caller }, error: authError } = await authClient.auth.getUser();
    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check caller has admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: adminRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!adminRole) {
      return new Response(
        JSON.stringify({ error: "Forbidden: admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { userId, email, planType } = await req.json();

    // Validate required fields
    if (!userId || !email || !planType) {
      console.error("Missing required fields:", { userId, email, planType });
      return new Response(
        JSON.stringify({ error: "Missing required fields: userId, email, planType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate planType
    const validPlanTypes = ["membership", "transformation", "coaching"];
    if (!validPlanTypes.includes(planType)) {
      console.error("Invalid plan type:", planType);
      return new Response(
        JSON.stringify({ error: `Invalid plan type. Must be one of: ${validPlanTypes.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use the already-created admin service role client
    const supabase = adminClient;

    console.log(`Creating subscription for user ${userId} with plan ${planType}`);

    // Transformation is a one-time purchase with lifetime access (no expiry)
    // Monthly plans (membership/coaching) get expiry managed by Stripe webhooks
    const now = new Date();
    const expiresAt = null;

    // Check if subscription already exists
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingSub) {
      console.log("Subscription already exists for user:", userId);
      return new Response(
        JSON.stringify({ success: true, message: "Subscription already exists", subscriptionId: existingSub.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create subscription
    const { data: subData, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan_type: planType,
        status: "active",
        started_at: now.toISOString(),
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (subError) {
      console.error("Error creating subscription:", subError);
      return new Response(
        JSON.stringify({ error: `Failed to create subscription: ${subError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Subscription created:", subData.id);

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: userId,
          email: email,
        });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        // Don't fail - subscription is more critical
      } else {
        console.log("Profile created for user:", userId);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        subscriptionId: subData.id,
        message: `${planType} subscription created successfully` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Unexpected error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
