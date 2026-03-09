import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.39.0";
import { getCorsHeaders } from "../_shared/cors.ts";

// Dom's non-negotiable workout philosophy — every plan follows these rules
const DOM_WORKOUT_PHILOSOPHY = `You are Dom Different — a man who built his body in a federal prison cell with NOTHING but bodyweight and iron will. You're building a workout program for someone who joined your platform because they're ready to change their life. This is NOT a regular gym program. This is a SENTENCE — and they're going to serve every rep.

=== DOM'S NON-NEGOTIABLE TRAINING RULES ===

1. MOBILITY IN EVERY WORKOUT — No exceptions. Every single session starts with mobility work. World's greatest stretch, hip openers, shoulder circles, ankle mobility, thoracic rotation. You move well or you break. Period. Even if you're 500 pounds, you're doing mobility. Your joints need it MORE than anyone.

2. PUSH-UPS IN EVERY WORKOUT — Every. Single. Day. If you're 500 pounds and can't do a push-up, you're doing wall push-ups. If wall push-ups are too easy, incline push-ups. If you can bang out 50 regular push-ups, you're doing decline diamonds. Push-ups are the foundation of everything Dom built in that cell. They are NON-NEGOTIABLE.

3. BURPEES IN ALMOST EVERY WORKOUT — Unless the user has a specific medical condition that prevents jumping or getting on the floor, burpees are in there. Modified burpees for beginners (step back, no jump). Half burpees for intermediates. Full burpees with push-up and jump for everyone else. Burpees built Dom's conditioning when he had no treadmill, no bike, no track. Just a cell and the will to survive.

4. BODYWEIGHT IS KING — Even if someone has access to a full gym with every machine imaginable, they are STILL doing bodyweight work every session. Push-ups, pull-ups (or progressions), squats, lunges, planks, burpees, mountain climbers. Equipment ADDS to the bodyweight foundation — it never replaces it. You earned your strength with your own body first. Then you add weight.

5. HIGH INTENSITY, HIGH REPS — This is not a comfortable program. Sets of 15-25 reps for bodyweight. Minimal rest (30-60 seconds). Circuits and supersets. AMRAP finishers. Timed rounds. This is prison-style conditioning — you go until you can't, then you rest 30 seconds and go again. The clock doesn't stop because you're tired.

6. PROGRESSIVE OVERLOAD WITHOUT A GYM — More reps. Less rest. Harder variations. Slower tempo. Pause reps. Single-leg/arm progressions. Add a backpack with books for weight. You don't need plates to get stronger. You need discipline and creativity.

=== WORKOUT STRUCTURE (every session follows this) ===

1. WARM-UP (section_type: "warmup") — 4-6 exercises
   - Joint circles, dynamic stretches, movement prep
   - Target the muscle groups you're about to work
   - ALWAYS include push-ups (scaled to their level)
   - ALWAYS include burpees (unless medical condition prevents it)
   - Include squats/lunges and core activation
   - Get blood flowing, get loose, prevent injury

2. MAIN WORK (section_type: "main") — 4-6 exercises
   - If bodyweight only: advanced progressions, circuits, EMOM, AMRAP
   - If dumbbells: compound movements (goblet squats, DB bench, rows, lunges, presses)
   - If barbell: big compound lifts (squat, bench, deadlift, OHP, rows)
   - If full gym: strategic mix of free weights, cables, machines + bodyweight supersets
   - ALWAYS pair exercises (supersets or circuits) to keep heart rate up

3. FINISHER (section_type: "finisher") — 1-2 exercises/circuits
   - AMRAP, Tabata, EMOM, or timed circuit
   - Full-body, maximum effort
   - Burpees, mountain climbers, squat jumps, push-ups — the basics at max intensity

4. COOL-DOWN (section_type: "cooldown") — 2-3 stretches
   - Static stretching for worked muscles
   - Deep breathing

=== EXERCISE DETAIL REQUIREMENTS ===
Every exercise must include:
- "instructions": Step-by-step form breakdown. How to set up, execute, and finish the rep. Include breathing pattern and tempo. Write so someone who has NEVER done this exercise can do it perfectly.
- "form_tips": 2-3 common mistakes and how to fix them. Practical cues, not clinical.
- "muscles_targeted": Primary and secondary muscles, comma-separated.
- "scaling_options": Four tiers in one string — "Beginner: [version] | Intermediate: [version] | Advanced: [version] | Beast Mode: [version]"
- "notes": Dom's voice. Direct, motivational, no-nonsense. Brief form cue or motivational push.

=== DOM'S VOICE ===
- Every workout has a title that sounds like it came from prison: "Cell Block Push," "Yard Time Conditioning," "Solitary Strength," "The Warden's Circuit"
- Exercise notes should be motivational and direct: "No half reps. Full range of motion or it doesn't count." / "This is where most people quit. You're not most people." / "30 seconds rest. Not 31. Not 35. Thirty."
- Form cues should be practical: "Chest to the floor on push-ups. If your chest doesn't touch, you didn't do a push-up." / "Squat until your hip crease is below your knee."`;

// Phase descriptions for the 12-week program
const PHASE_DESCRIPTIONS = {
  foundation: {
    weeks: "1-4",
    title: "Foundation Phase — Laying the Concrete",
    description: "Establish discipline. Learn movements. Build the habit. You're building the foundation that everything else sits on. Miss a day and the whole structure cracks.",
    intensity: "RPE 7-8. Challenging but sustainable. You should be uncomfortable, not destroyed.",
    focus: "Form, consistency, mobility, building work capacity. Every rep counts."
  },
  build: {
    weeks: "5-8",
    title: "Build Phase — Stacking Bricks",
    description: "Now we push. More volume, less rest, harder variations. Your body adapted to the foundation — time to force it to grow.",
    intensity: "RPE 8-9. You should be questioning your life choices during conditioning finishers.",
    focus: "Progressive overload, increased conditioning, advanced variations, mental toughness."
  },
  peak: {
    weeks: "9-12",
    title: "Peak Phase — Breaking Through the Wall",
    description: "This is where transformation happens. Maximum intensity. Complex movements. Minimal rest. You've built the foundation and stacked the bricks. Now we see what you're made of.",
    intensity: "RPE 9-10. Go until failure, rest, go again. Leave nothing.",
    focus: "Peak performance, maximum conditioning, program mastery, mental fortitude."
  }
};

// Map day names to actual day-of-week indices (matches frontend: Monday=0 through Sunday=6)
const DAY_TO_INDEX: Record<string, number> = {
  Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3,
  Friday: 4, Saturday: 5, Sunday: 6,
};

interface UserProfile {
  goal: string;
  experience: string;
  injuries: string;
  age: number;
  height: string;
  weight: string;
  equipment: string;
  session_length_preference: string;
  training_days_per_week: number;
  activity_level: string;
  body_fat_estimate: string;
  // Free World extras
  training_style: string;
  sleep_quality: string;
  stress_level: string;
  previous_training: string;
  medical_conditions: string;
  short_term_goals: string;
  long_term_goals: string;
  goal_type: string;
}

function buildUserContext(profile: UserProfile, planType: string): string {
  const lines = [
    `GOAL: ${profile.goal_type || profile.goal || "Not specified"}`,
    `EXPERIENCE LEVEL: ${profile.experience || "Not specified"}`,
    `AGE: ${profile.age || "Not specified"}`,
    `HEIGHT: ${profile.height || "Not specified"}`,
    `WEIGHT: ${profile.weight || "Not specified"}`,
    `AVAILABLE EQUIPMENT: ${profile.equipment || "Bodyweight only"}`,
    `TRAINING DAYS PER WEEK: ${profile.training_days_per_week || 4}`,
    `SESSION LENGTH: ${profile.session_length_preference || "45-60 min"}`,
  ];

  if (profile.injuries) lines.push(`INJURIES/LIMITATIONS: ${profile.injuries}`);
  if (profile.activity_level) lines.push(`CURRENT ACTIVITY LEVEL: ${profile.activity_level}`);
  if (profile.body_fat_estimate) lines.push(`BODY FAT ESTIMATE: ${profile.body_fat_estimate}`);

  // Free World gets deeper context
  if (planType === "coaching") {
    if (profile.training_style) lines.push(`PREFERRED TRAINING STYLE: ${profile.training_style}`);
    if (profile.previous_training) lines.push(`PREVIOUS TRAINING HISTORY: ${profile.previous_training}`);
    if (profile.sleep_quality) lines.push(`SLEEP QUALITY: ${profile.sleep_quality}`);
    if (profile.stress_level) lines.push(`STRESS LEVEL: ${profile.stress_level}`);
    if (profile.medical_conditions) lines.push(`MEDICAL CONDITIONS: ${profile.medical_conditions}`);
    if (profile.short_term_goals) lines.push(`SHORT-TERM GOALS (4 weeks): ${profile.short_term_goals}`);
    if (profile.long_term_goals) lines.push(`LONG-TERM GOALS (3-6 months): ${profile.long_term_goals}`);
  }

  return lines.join("\n");
}

function getDayNames(trainingDays: number): string[] {
  switch (trainingDays) {
    case 3: return ["Monday", "Wednesday", "Friday"];
    case 4: return ["Monday", "Tuesday", "Thursday", "Friday"];
    case 5: return ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"];
    case 6: return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    default: return ["Monday", "Tuesday", "Thursday", "Friday"];
  }
}

// No longer used — AI now generates all 4 weeks with unique exercises per week

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, regenerate, phase: requestedPhase, coachingApproach } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: userId" }),
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

    // Check if this specific phase already exists (unless regenerating)
    const phaseStartWeek = requestedPhase === "foundation" ? 1 : requestedPhase === "build" ? 5 : 9;
    if (!regenerate && requestedPhase) {
      const { data: existing } = await supabase
        .from("workout_personalizations")
        .select("id")
        .eq("user_id", userId)
        .eq("week_number", phaseStartWeek)
        .limit(1);

      if (existing && existing.length > 0) {
        return new Response(
          JSON.stringify({ success: true, message: "Phase already generated", cached: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Clear only the requested phase on regeneration
    if (regenerate && requestedPhase) {
      await supabase
        .from("workout_personalizations")
        .delete()
        .eq("user_id", userId)
        .gte("week_number", phaseStartWeek)
        .lte("week_number", phaseStartWeek + 3);
    } else if (regenerate) {
      await supabase
        .from("workout_personalizations")
        .delete()
        .eq("user_id", userId);
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("goal, goal_type, experience, injuries, age, height, weight, equipment, session_length_preference, training_days_per_week, activity_level, body_fat_estimate, training_style, sleep_quality, stress_level, previous_training, medical_conditions, short_term_goals, long_term_goals")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get subscription tier
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan_type")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    const planType = subscription?.plan_type || "transformation";

    // Membership (Solitary) doesn't get custom plans
    if (planType === "membership") {
      return new Response(
        JSON.stringify({ error: "Custom workout plans are not available for Solitary Confinement tier. Upgrade to General Population or Free World." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Match to program track
    const { data: tracks } = await supabase
      .from("program_tracks")
      .select("id, name, goal_match")
      .eq("is_active", true);

    const userGoal = (profile.goal_type || profile.goal || "").toLowerCase().trim();
    const userTrack = (tracks || []).find(
      (t: any) => t.goal_match.toLowerCase().trim() === userGoal
    ) || (tracks || [])[0];

    const client = new Anthropic({ apiKey: anthropicKey });
    const userContext = buildUserContext(profile as UserProfile, planType);
    const trainingDays = profile.training_days_per_week || 4;
    const dayNames = getDayNames(trainingDays);

    // Determine which phases to generate
    const phases = requestedPhase
      ? [requestedPhase as "foundation" | "build" | "peak"]
      : ["foundation", "build", "peak"] as const;

    console.log(`Generating ${planType} workout plan for user ${userId} — ${trainingDays} days/week, goal: ${userGoal}, phases: ${phases.join(", ")}`);

    const allPersonalizations: any[] = [];

    for (const phaseKey of phases) {
      const phase = PHASE_DESCRIPTIONS[phaseKey];
      const startWeek = phaseKey === "foundation" ? 1 : phaseKey === "build" ? 5 : 9;

      let tierContext: string;
      if (planType === "coaching") {
        tierContext = `\n\nTHIS IS A FREE WORLD (1:1 COACHING) CLIENT — Premium tier. Generate MORE detailed coach notes, MORE specific scaling options, MORE personalized exercise selection based on their detailed profile. Include advanced techniques, tempo prescriptions, and RPE targets for each exercise.`;
        if (coachingApproach) {
          tierContext += `\n\nAPPROVED APPROACH FOR THIS CLIENT:\nTitle: ${coachingApproach.title}\nApproach: ${coachingApproach.summary}\nKey Focus Areas: ${(coachingApproach.differentiators || []).join(", ")}`;
          if (coachingApproach.domNotes) {
            tierContext += `\nPersonal Notes: ${coachingApproach.domNotes}`;
          }
          tierContext += `\n\nFOLLOW THIS APPROVED APPROACH. The workout style, exercise selection, and programming should reflect these specific choices.`;
        }
      } else {
        tierContext = `\n\nTHIS IS A GENERAL POPULATION CLIENT — 12-week transformation tier. Generate solid, comprehensive workouts with clear scaling options and form cues. Dom's energy in every note. Tailor every exercise to their exact body weight, equipment, injuries, and experience level.`;
      }

      // Generate all days in PARALLEL to stay within edge function timeout
      // Each call now produces 4 UNIQUE weekly workouts (not clones)
      const dayPromises = dayNames.map(async (dayName) => {
        const dayIndex = DAY_TO_INDEX[dayName];
        if (dayIndex === undefined) return [];

        const prompt = `You are Dom Different — built his body in a federal prison cell. High intensity. High reps. No bullshit.

Generate 4 UNIQUE weekly workouts for ${dayName} across this 4-week phase. Each week MUST have DIFFERENT main exercises — swap movements, change grips, vary angles, rotate muscle emphasis. The warmup and cooldown can share some staples (push-ups, burpees, stretches) but the MAIN WORK and FINISHER must be distinctly different each week. This is REAL progressive programming, not the same workout with different numbers.

USER: ${profile.experience || "Intermediate"} | ${profile.weight || "N/A"} | Equipment: ${profile.equipment || "Bodyweight only"} | Goal: ${userGoal} | Session: ${profile.session_length_preference || "45-60 min"}${profile.injuries ? ` | Injuries: ${profile.injuries}` : ''}
${tierContext}

PHASE: ${phase.title} — ${phase.description}
INTENSITY: ${phase.intensity}

=== WEEKLY PROGRESSION RULES ===
Week 1 of phase: Introduce the movement patterns. ${phaseKey === "foundation" ? "3 sets, moderate reps (12-15), 45-60s rest." : phaseKey === "build" ? "4 sets, higher reps (15-20), 30-45s rest." : "4-5 sets, max reps, 20-30s rest."}
Week 2: Rotate ~50% of main exercises to variations (e.g., flat bench -> incline, back squat -> front squat, pull-ups -> chin-ups). Add 1-2 reps or reduce rest by 5-10s.
Week 3: Introduce new movement patterns or intensity techniques (drop sets, supersets, tempo work). Different finisher circuit. Push harder.
Week 4: Peak week for this phase. Hardest variations, highest volume, least rest. Test their limits before the next phase begins.

=== DOM'S NON-NEGOTIABLE RULES ===
1. PUSH-UPS IN EVERY WARMUP. Wall push-ups if they're 500 lbs, decline diamonds if they're advanced. Non-negotiable.
2. BURPEES IN EVERY WARMUP. Modified step-back for beginners, full burpee+push-up+jump for beasts. Unless medical condition prevents it.
3. HIGH REPS, ALWAYS: Compound lifts 12-20 reps (NOT 6-8). Bodyweight 20-30+ reps. This is NOT powerlifting.
4. SHORT REST: 30-45 seconds. 60 seconds absolute max on heavy compounds. No standing around texting.
5. SUPERSETS EVERYTHING: Pair exercises. Push/pull, upper/lower. Keep the heart rate up.
6. BODYWEIGHT IS KING: Even with full gym, every session has bodyweight work. Equipment adds to the foundation, never replaces it.
7. FINISHER IS BRUTAL: AMRAP, Tabata, or timed circuit. Burpees, mountain climbers, squat jumps. Leave nothing.
8. DIFFERENT EXERCISES EACH DAY: ${dayName} must NOT repeat the same lead exercises as other training days. Vary movements, grips, angles, tempos.

STRUCTURE per week: warmup (4-6 exercises w/ mobility + push-ups + burpees), main (4-6 exercises in supersets), finisher (1-2 AMRAP/circuits), cooldown (2-3 stretches).

Dom's voice in notes: "No half reps." / "30 seconds rest. Not 31." / "This is where most people quit. You're not most people."

Respond ONLY with valid JSON — no markdown, no explanation. Return an object with keys "week_1", "week_2", "week_3", "week_4", each containing an "exercises" array:
{"week_1":{"exercises":[...]},"week_2":{"exercises":[...]},"week_3":{"exercises":[...]},"week_4":{"exercises":[...]}}

Each exercise object: {"exercise_name":"string","section_type":"warmup|main|finisher|cooldown","sets":"string","reps_or_time":"string","rest":"string","notes":"Dom's voice, 1 sentence","instructions":"Form breakdown","form_tips":"Common mistakes","muscles_targeted":"comma separated","scaling_options":"Beginner: X | Intermediate: X | Advanced: X | Beast Mode: X"}`;

        try {
          const response = await client.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 16000,
            messages: [{ role: "user", content: prompt }],
          });

          const aiText = response.content[0].type === "text" ? response.content[0].text : "";
          console.log(`${phaseKey}/${dayName}: stop=${response.stop_reason}, len=${aiText.length}`);

          const jsonMatch = aiText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            console.error(`No JSON for ${phaseKey}/${dayName}`);
            return [];
          }

          const parsed = JSON.parse(jsonMatch[0]);

          const results: any[] = [];
          for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
            const weekNumber = startWeek + weekOffset;
            const weekKey = `week_${weekOffset + 1}`;
            let weekData = parsed[weekKey];

            // Fallback: if AI returned flat "exercises" array (old format), use it for all weeks
            if (!weekData && parsed.exercises && weekOffset === 0) {
              weekData = { exercises: parsed.exercises };
            }
            if (!weekData || !Array.isArray(weekData.exercises) || weekData.exercises.length === 0) {
              console.warn(`No exercises for ${phaseKey}/${dayName}/week_${weekOffset + 1}`);
              continue;
            }

            const finalExercises = weekData.exercises.map((ex: any, idx: number) => ({
              original_exercise_name: ex.exercise_name,
              exercise_name: ex.exercise_name,
              section_type: ex.section_type,
              sets: ex.sets,
              reps_or_time: ex.reps_or_time,
              rest: ex.rest,
              notes: ex.notes,
              modification_reason: null,
              display_order: idx,
              muscles_targeted: ex.muscles_targeted,
              form_tips: ex.form_tips,
              scaling_options: ex.scaling_options,
              instructions: ex.instructions,
            }));

            console.log(`${phaseKey}/${dayName}/week${weekOffset + 1}: ${finalExercises.length} exercises`);

            results.push({
              user_id: userId,
              track_id: userTrack?.id || null,
              week_number: weekNumber,
              day_of_week: dayIndex,
              personalized_exercises: finalExercises,
              modification_notes: `${phase.title} — Week ${weekNumber}`,
            });
          }
          return results;
        } catch (dayError) {
          console.error(`Error ${phaseKey}/${dayName}:`, dayError);
          return [];
        }
      });

      const dayResults = await Promise.all(dayPromises);
      for (const results of dayResults) {
        allPersonalizations.push(...results);
      }

      console.log(`Phase ${phaseKey} complete: ${dayResults.reduce((sum, r) => sum + r.length, 0)} records`);
    }

    // Batch insert all personalizations
    if (allPersonalizations.length > 0) {
      const { error: insertError } = await supabase
        .from("workout_personalizations")
        .upsert(allPersonalizations, { onConflict: "user_id,track_id,week_number,day_of_week" });

      if (insertError) {
        console.error("Failed to store workout plan:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to store workout plan", details: insertError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`Workout plan stored: ${allPersonalizations.length} total day-workouts for user ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${planType === "coaching" ? "Free World" : "General Population"} workout plan generated`,
        plan_type: planType,
        total_workouts: allPersonalizations.length,
        weeks: 12,
        days_per_week: trainingDays,
        track: userTrack?.name || "General Fitness",
        cached: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Workout plan generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
