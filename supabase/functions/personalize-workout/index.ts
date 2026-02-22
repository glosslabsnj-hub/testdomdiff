import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://domdifferent.com",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, weekNumber, dayOfWeek } = await req.json();

    if (!userId || !weekNumber || dayOfWeek === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userId, weekNumber, dayOfWeek" }),
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

    // Check if personalization already exists (cache)
    const { data: cached } = await supabase
      .from("workout_personalizations")
      .select("personalized_exercises, modification_notes")
      .eq("user_id", userId)
      .eq("week_number", weekNumber)
      .eq("day_of_week", dayOfWeek)
      .maybeSingle();

    if (cached) {
      return new Response(
        JSON.stringify({
          personalized: true,
          exercises: cached.personalized_exercises,
          notes: cached.modification_notes,
          cached: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("goal, experience, injuries, age, height, weight, equipment, session_length_preference, training_days_per_week, activity_level, body_fat_estimate")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user's subscription to check tier
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan_type")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    // Solitary (membership) users don't get personalization
    if (!subscription || subscription.plan_type === "membership") {
      return new Response(
        JSON.stringify({ personalized: false, reason: "Personalization not available for this tier" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user's program track
    const { data: tracks } = await supabase
      .from("program_tracks")
      .select("id, name, goal_match")
      .eq("is_active", true);

    const userGoal = (profile.goal || "").toLowerCase().trim();
    const userTrack = (tracks || []).find(
      (t: any) => t.goal_match.toLowerCase().trim() === userGoal
    ) || (tracks || [])[0];

    if (!userTrack) {
      return new Response(
        JSON.stringify({ personalized: false, reason: "No program track found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the base workout for this week/day
    const dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const dayName = dayNames[dayOfWeek] || "monday";

    const { data: week } = await supabase
      .from("program_weeks")
      .select("id, phase, title")
      .eq("track_id", userTrack.id)
      .eq("week_number", weekNumber)
      .maybeSingle();

    if (!week) {
      return new Response(
        JSON.stringify({ personalized: false, reason: "Week not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: dayWorkout } = await supabase
      .from("program_day_workouts")
      .select("id, workout_name, is_rest_day")
      .eq("week_id", week.id)
      .eq("day_of_week", dayName)
      .maybeSingle();

    if (!dayWorkout || dayWorkout.is_rest_day) {
      return new Response(
        JSON.stringify({ personalized: false, reason: "Rest day or no workout found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: exercises } = await supabase
      .from("program_day_exercises")
      .select("id, section_type, exercise_name, sets, reps_or_time, rest, notes, scaling_options, display_order")
      .eq("day_workout_id", dayWorkout.id)
      .order("display_order");

    if (!exercises || exercises.length === 0) {
      return new Response(
        JSON.stringify({ personalized: false, reason: "No exercises found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build personalization prompt
    const client = new Anthropic({ apiKey: anthropicKey });

    const userContext = [
      `Goal: ${profile.goal || "Not specified"}`,
      `Experience: ${profile.experience || "Not specified"}`,
      `Age: ${profile.age || "Not specified"}`,
      `Height: ${profile.height || "Not specified"}`,
      `Weight: ${profile.weight || "Not specified"}`,
      profile.injuries ? `Injuries/Limitations: ${profile.injuries}` : null,
      profile.equipment ? `Available Equipment: ${profile.equipment}` : null,
      profile.session_length_preference ? `Session Length Preference: ${profile.session_length_preference}` : null,
      profile.activity_level ? `Activity Level: ${profile.activity_level}` : null,
      profile.body_fat_estimate ? `Body Fat Estimate: ${profile.body_fat_estimate}` : null,
    ].filter(Boolean).join("\n");

    const exerciseList = exercises.map((ex: any) =>
      `- [${ex.section_type}] ${ex.exercise_name} | Sets: ${ex.sets || "N/A"} | Reps: ${ex.reps_or_time || "N/A"} | Rest: ${ex.rest || "N/A"} | Notes: ${ex.notes || "None"} | Scaling: ${ex.scaling_options || "None"}`
    ).join("\n");

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `You are a prison-style bodyweight fitness coach personalizing a workout for a specific user.

USER PROFILE:
${userContext}

PROGRAM CONTEXT:
Track: ${userTrack.name}
Phase: ${week.phase} (Week ${weekNumber} of 12)
Workout: ${dayWorkout.workout_name}

BASE EXERCISES:
${exerciseList}

PERSONALIZATION RULES:
1. Keep the same exercises unless an injury requires a swap
2. For injuries: swap problematic exercises with safe alternatives that work similar muscles
3. Adjust sets/reps based on experience:
   - Beginner: Reduce sets by 1, increase rest by 15s, stick to lower rep ranges
   - Intermediate: Keep as programmed
   - Advanced: Add 1-2 sets, reduce rest by 10s, push higher rep ranges
4. Keep section types (warmup/main/finisher/cooldown) the same
5. All exercises must remain bodyweight-only (prison-style, no equipment needed)
6. If user has equipment (dumbbells, bands), you may add optional equipment variations in notes

Respond ONLY with valid JSON matching this structure:
{
  "exercises": [
    {
      "original_exercise_name": "string",
      "exercise_name": "string",
      "section_type": "warmup|main|finisher|cooldown",
      "sets": "string",
      "reps_or_time": "string",
      "rest": "string",
      "notes": "string or null",
      "modification_reason": "string or null",
      "display_order": number
    }
  ],
  "summary": "Brief 1-2 sentence summary of key modifications made"
}`,
        },
      ],
    });

    // Parse AI response
    const aiText = response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to parse AI response:", aiText);
      return new Response(
        JSON.stringify({ personalized: false, reason: "AI response parsing failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Cache the personalization
    await supabase.from("workout_personalizations").upsert(
      {
        user_id: userId,
        track_id: userTrack.id,
        week_number: weekNumber,
        day_of_week: dayOfWeek,
        personalized_exercises: parsed.exercises,
        modification_notes: parsed.summary,
      },
      { onConflict: "user_id,track_id,week_number,day_of_week" }
    );

    console.log(`Workout personalized for user ${userId}, week ${weekNumber}, day ${dayOfWeek}`);

    return new Response(
      JSON.stringify({
        personalized: true,
        exercises: parsed.exercises,
        notes: parsed.summary,
        cached: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Personalization error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ personalized: false, reason: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
