import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { optionId, domNotes } = await req.json();

    if (!optionId) {
      return new Response(
        JSON.stringify({ error: "Missing optionId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Fetch the option
    const { data: option, error: fetchError } = await supabase
      .from("coaching_plan_options")
      .select("*")
      .eq("id", optionId)
      .single();

    if (fetchError || !option) {
      return new Response(
        JSON.stringify({ error: "Option not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark this option as approved
    await supabase
      .from("coaching_plan_options")
      .update({
        status: "approved",
        dom_notes: domNotes || null,
        approved_at: new Date().toISOString(),
      })
      .eq("id", optionId);

    // Reject the other options for this user/plan_type
    await supabase
      .from("coaching_plan_options")
      .update({ status: "rejected" })
      .eq("user_id", option.user_id)
      .eq("plan_type", option.plan_type)
      .neq("id", optionId);

    // Now trigger full plan generation with the approved approach context
    const generateUrl = option.plan_type === "workout"
      ? `${supabaseUrl}/functions/v1/generate-workout-plan`
      : `${supabaseUrl}/functions/v1/generate-meal-plan`;

    // Fire generation for each phase (workout) or single call (meal)
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceRoleKey}`,
    };

    if (option.plan_type === "workout") {
      // Generate all 3 phases with the approved approach context
      for (const phase of ["foundation", "build", "peak"]) {
        fetch(generateUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            userId: option.user_id,
            regenerate: true,
            phase,
            coachingApproach: {
              title: option.approach_title,
              summary: option.approach_summary,
              differentiators: option.key_differentiators,
              domNotes: domNotes || null,
            },
          }),
        }).catch((err) => console.error(`Workout ${phase} generation error:`, err));
      }
    } else {
      fetch(generateUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: option.user_id,
          regenerate: true,
          coachingApproach: {
            title: option.approach_title,
            summary: option.approach_summary,
            differentiators: option.key_differentiators,
            domNotes: domNotes || null,
          },
        }),
      }).catch((err) => console.error("Meal plan generation error:", err));
    }

    // Update profile status
    await supabase
      .from("profiles")
      .update({ coaching_plan_status: "approved" })
      .eq("user_id", option.user_id);

    console.log(`Approved coaching ${option.plan_type} option ${optionId} for user ${option.user_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${option.plan_type} plan approved and generation triggered`,
        approved_option: option.approach_title,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Approve coaching plan error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
