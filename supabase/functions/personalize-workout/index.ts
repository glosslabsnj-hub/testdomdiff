import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.39.0";
import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
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
      let exercises = cached.personalized_exercises;
      let notes = cached.modification_notes;

      // Normalize old format from generate-workout-plan (object with nested exercises array)
      if (exercises && !Array.isArray(exercises) && typeof exercises === 'object' && exercises.exercises) {
        const sectionMap: Record<string, string> = {
          mobility: 'warmup', bodyweight_foundation: 'warmup',
          conditioning: 'finisher',
        };
        const rawExercises = exercises.exercises || [];
        notes = notes || exercises.phase_summary || null;
        exercises = rawExercises.map((ex: any, idx: number) => ({
          original_exercise_name: ex.exercise_name,
          exercise_name: ex.exercise_name,
          section_type: sectionMap[ex.section_type] || ex.section_type,
          sets: ex.sets,
          reps_or_time: ex.reps_or_time,
          rest: ex.rest,
          notes: ex.notes,
          modification_reason: null,
          display_order: ex.display_order ?? idx,
          muscles_targeted: ex.muscles_targeted,
          form_tips: [ex.form_breakdown, ex.common_mistakes].filter(Boolean).join('\n'),
          scaling_options: typeof ex.scaling === 'object'
            ? Object.entries(ex.scaling).map(([k, v]) => `${k}: ${v}`).join(' | ')
            : ex.scaling_options || null,
          instructions: ex.form_breakdown || null,
        }));
      }

      // Normalize section types for array format with old type names
      if (Array.isArray(exercises)) {
        const sectionMap: Record<string, string> = {
          mobility: 'warmup', bodyweight_foundation: 'warmup',
          conditioning: 'finisher',
        };
        exercises = exercises.map((ex: any) => ({
          ...ex,
          section_type: sectionMap[ex.section_type] || ex.section_type,
        }));
      }

      if (Array.isArray(exercises) && exercises.length > 0) {
        return new Response(
          JSON.stringify({
            personalized: true,
            exercises,
            notes,
            cached: true,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Invalid cache data — delete and fall through to on-demand generation
      console.log(`Invalid cache for user ${userId}, week ${weekNumber}, day ${dayOfWeek} — regenerating`);
      await supabase
        .from("workout_personalizations")
        .delete()
        .eq("user_id", userId)
        .eq("week_number", weekNumber)
        .eq("day_of_week", dayOfWeek);
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("goal, experience, injuries, age, height, weight, gender, equipment, session_length_preference, training_days_per_week, activity_level, body_fat_estimate")
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
      `Gender: ${profile.gender || "male"}`,
      `Age: ${profile.age || "Not specified"}`,
      `Height: ${profile.height || "Not specified"}`,
      `Weight: ${profile.weight || "Not specified"}`,
      profile.injuries ? `Injuries/Limitations: ${profile.injuries}` : null,
      profile.equipment ? `Available Equipment: ${profile.equipment}` : null,
      profile.session_length_preference ? `Session Length Preference: ${profile.session_length_preference} minutes` : null,
      profile.training_days_per_week ? `Training Days Per Week: ${profile.training_days_per_week}` : null,
      profile.activity_level ? `Activity Level: ${profile.activity_level}` : null,
      profile.body_fat_estimate ? `Body Fat Estimate: ${profile.body_fat_estimate}` : null,
    ].filter(Boolean).join("\n");

    const exerciseList = exercises.map((ex: any) =>
      `- [${ex.section_type}] ${ex.exercise_name} | Sets: ${ex.sets || "N/A"} | Reps: ${ex.reps_or_time || "N/A"} | Rest: ${ex.rest || "N/A"} | Notes: ${ex.notes || "None"} | Scaling: ${ex.scaling_options || "None"}`
    ).join("\n");

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content: `You are Dom — a direct, motivational, no-nonsense fitness coach with prison-forged intensity. You're personalizing a workout for a specific user.

USER PROFILE:
${userContext}

PROGRAM CONTEXT:
Track: ${userTrack.name}
Phase: ${week.phase} (Week ${weekNumber} of 12)
Workout: ${dayWorkout.workout_name}

BASE EXERCISES:
${exerciseList}

PERSONALIZATION RULES:

EQUIPMENT ADAPTATION:
- If user has "No Equipment (Bodyweight Only)": keep all exercises bodyweight. Push-ups, pull-ups (if bar), squats, lunges, planks, burpees.
- If user has "Dumbbells": swap applicable exercises to dumbbell variants (e.g., bodyweight squats → goblet squats, push-ups → dumbbell bench press for advanced). Keep some bodyweight for conditioning.
- If user has "Barbell + Plates": use compound barbell movements (squats, deadlifts, bench press, overhead press, rows). These are the foundation.
- If user has "Resistance Bands": add banded variations for warmup, accessory work, and rehab movements.
- If user has "Kettlebells": incorporate swings, Turkish get-ups, goblet squats, cleans.
- If user has "Full Gym Access": use the optimal exercise for each muscle group — machines, cables, free weights, bodyweight as appropriate.
- Combine equipment intelligently. Someone with dumbbells AND bands gets different programming than dumbbells alone.

INJURY ADAPTATION:
- Shoulder injury: avoid overhead pressing, replace with landmine press or floor press. No behind-the-neck movements.
- Knee injury: avoid deep squats and jumping. Replace with box squats, leg press (if gym), or isometric wall sits.
- Back injury: avoid heavy deadlifts and good mornings. Replace with hip thrusts, reverse hypers, bird dogs.
- Always include appropriate warm-up movements for injured areas.

GENDER ADAPTATION:
- Female users: default to lighter starting weights, prioritize glute/hip work in lower body days, include more unilateral movements for stability. Adjust rep ranges slightly higher (10-15 vs 8-12). Include hip thrusts, Romanian deadlifts, lateral band walks as go-to movements.
- Male users: standard prescription. Can handle heavier compound focus.
- These are defaults — override based on experience level and stated goals.

EXPERIENCE SCALING:
- Beginner (0-6 months): -1 set per exercise, +15 seconds rest between sets, simpler movement patterns.
- Intermediate (6-24 months): standard prescription.
- Advanced (2+ years): +1-2 sets per exercise, -10 seconds rest, add intensity techniques (drop sets, supersets, pauses).

TRAINING DAYS COMPENSATION:
- 3 days/week: slightly higher volume per session (add 1 set to compound movements), full body focus.
- 4 days/week: upper/lower or push/pull split, standard volume.
- 5-6 days/week: can use more isolation work, lower volume per session, body part splits.

SESSION LENGTH:
- 30-45 min: 4-5 exercises max, minimal rest, supersets encouraged.
- 45-60 min: 5-7 exercises, standard rest periods.
- 60-90 min: 7-9 exercises, full rest, can include dedicated warm-up and cool-down blocks.

VOICE:
- Dom's style: direct, motivational, no-nonsense. Prison-forged intensity.
- Include brief motivational notes on key exercises.
- Form tips should be practical and safety-focused.

Keep section types (warmup/main/finisher/cooldown) the same.

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
      "notes": "string or null — Dom's voice, motivational",
      "modification_reason": "string or null",
      "display_order": number,
      "muscles_targeted": "string - primary and secondary muscles, comma separated",
      "form_tips": "string - 2-3 common mistakes and fixes, newline separated",
      "scaling_options": "string - Beginner: ... | Intermediate: ... | Advanced: ... | Beast Mode: ...",
      "instructions": "string - step-by-step form breakdown with breathing and tempo, newline separated"
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
