import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.39.0";
import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, planType = "workout" } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if options already exist for this user
    const { data: existing } = await supabase
      .from("coaching_plan_options")
      .select("id")
      .eq("user_id", userId)
      .eq("plan_type", planType)
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ success: true, message: "Options already generated", cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update profile status
    await supabase
      .from("profiles")
      .update({ coaching_plan_status: "generating" })
      .eq("user_id", userId);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, goal, goal_type, experience, injuries, age, height, weight, equipment, session_length_preference, training_days_per_week, activity_level, body_fat_estimate, training_style, sleep_quality, stress_level, previous_training, medical_conditions, short_term_goals, long_term_goals, dietary_restrictions, meal_prep_preference, biggest_obstacle, motivation")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const client = new Anthropic({ apiKey: anthropicKey });
    const userName = profile.first_name || "this client";

    const profileContext = [
      `Name: ${userName}`,
      `Goal: ${profile.goal_type || profile.goal || "Not specified"}`,
      `Experience: ${profile.experience || "Not specified"}`,
      `Age: ${profile.age || "Not specified"}`,
      `Height: ${profile.height || "Not specified"}`,
      `Weight: ${profile.weight || "Not specified"}`,
      `Equipment: ${profile.equipment || "Bodyweight only"}`,
      `Training days/week: ${profile.training_days_per_week || 4}`,
      `Session length: ${profile.session_length_preference || "45-60 min"}`,
      profile.injuries ? `Injuries: ${profile.injuries}` : null,
      profile.activity_level ? `Activity level: ${profile.activity_level}` : null,
      profile.body_fat_estimate ? `Body fat: ${profile.body_fat_estimate}` : null,
      profile.training_style ? `Preferred style: ${profile.training_style}` : null,
      profile.previous_training ? `Training history: ${profile.previous_training}` : null,
      profile.sleep_quality ? `Sleep: ${profile.sleep_quality}` : null,
      profile.stress_level ? `Stress: ${profile.stress_level}` : null,
      profile.medical_conditions ? `Medical: ${profile.medical_conditions}` : null,
      profile.short_term_goals ? `Short-term goals: ${profile.short_term_goals}` : null,
      profile.long_term_goals ? `Long-term goals: ${profile.long_term_goals}` : null,
      profile.dietary_restrictions ? `Dietary restrictions: ${profile.dietary_restrictions}` : null,
      profile.meal_prep_preference ? `Meal prep preference: ${profile.meal_prep_preference}` : null,
      profile.biggest_obstacle ? `Biggest obstacle: ${profile.biggest_obstacle}` : null,
      profile.motivation ? `Motivation: ${profile.motivation}` : null,
    ].filter(Boolean).join("\n");

    const isWorkout = planType === "workout";

    const prompt = isWorkout
      ? `You are Dom Different, a fitness coach who built his body in federal prison with nothing but bodyweight and iron will. You're designing a 12-week workout program for a FREE WORLD (1:1 coaching) client. This is your premium tier.

CLIENT PROFILE:
${profileContext}

Generate exactly 3 DIFFERENT workout plan approaches for this client. Each approach should be genuinely different in philosophy, not just minor variations. Think about what would actually work best for this specific person given their goals, limitations, equipment, and experience.

Each approach should have:
1. A compelling title (Dom's voice, prison metaphor)
2. A 2-3 sentence summary explaining the approach and why it fits this client
3. A sample week overview (day-by-day brief descriptions)
4. 3-4 key differentiators (what makes this approach unique)

Respond ONLY with valid JSON:
{
  "options": [
    {
      "option_number": 1,
      "approach_title": "string",
      "approach_summary": "string - 2-3 sentences, Dom's voice, explain WHY this approach fits the client",
      "sample_week": {
        "Monday": "string - brief description of that day's focus",
        "Tuesday": "string",
        "Wednesday": "string",
        "Thursday": "string",
        "Friday": "string",
        "Saturday": "string or 'Rest'",
        "Sunday": "Rest"
      },
      "key_differentiators": ["string", "string", "string"]
    }
  ]
}`
      : `You are Dom Different, designing a nutrition plan for a FREE WORLD (1:1 coaching) client.

CLIENT PROFILE:
${profileContext}

Generate exactly 3 DIFFERENT meal plan approaches for this client. Each should be genuinely different in philosophy (not just calorie tweaks). Consider their goals, dietary restrictions, meal prep preferences, and lifestyle.

Each approach should have:
1. A compelling title (Dom's voice)
2. A 2-3 sentence summary explaining the approach
3. A sample day overview (meals + snacks)
4. 3-4 key differentiators

Respond ONLY with valid JSON:
{
  "options": [
    {
      "option_number": 1,
      "approach_title": "string",
      "approach_summary": "string - 2-3 sentences explaining why this approach fits",
      "sample_day": {
        "meal_1": "string - brief description",
        "meal_2": "string",
        "meal_3": "string",
        "snack_1": "string",
        "snack_2": "string"
      },
      "key_differentiators": ["string", "string", "string"],
      "daily_targets": {
        "calories": "string range",
        "protein": "string",
        "carbs": "string",
        "fat": "string"
      }
    }
  ]
}`;

    console.log(`Generating ${planType} coaching options for user ${userId}`);

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const aiText = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("Failed to parse AI response:", aiText.substring(0, 500));
      return new Response(
        JSON.stringify({ error: "Failed to generate options" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const options = parsed.options;

    if (!options || options.length === 0) {
      return new Response(
        JSON.stringify({ error: "No options generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store options
    const rows = options.map((opt: any, idx: number) => ({
      user_id: userId,
      plan_type: planType,
      option_number: idx + 1,
      status: "pending_review",
      approach_title: opt.approach_title,
      approach_summary: opt.approach_summary,
      sample_week_overview: isWorkout ? opt.sample_week : opt.sample_day,
      key_differentiators: opt.key_differentiators || [],
    }));

    const { error: insertError } = await supabase
      .from("coaching_plan_options")
      .upsert(rows, { onConflict: "user_id,plan_type,option_number" });

    if (insertError) {
      console.error("Failed to store options:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to store options", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update profile status
    await supabase
      .from("profiles")
      .update({ coaching_plan_status: "pending_review" })
      .eq("user_id", userId);

    console.log(`Generated ${options.length} ${planType} coaching options for user ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        options_count: options.length,
        plan_type: planType,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Coaching options generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
