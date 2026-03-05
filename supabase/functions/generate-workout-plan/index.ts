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

1. MOBILITY & ACTIVATION (5-8 min)
   - Joint circles, dynamic stretches, movement prep
   - Target the muscle groups you're about to work
   - Get blood flowing, get loose, prevent injury
   - ALWAYS included. No shortcuts.

2. BODYWEIGHT FOUNDATION (10-15 min)
   - Push-ups (variation based on level) — ALWAYS
   - Burpees (variation based on level) — almost always
   - Squats or lunges — every session
   - Core work (planks, mountain climbers, dead bugs)
   - This is the non-negotiable base. Even on "gym days."

3. MAIN WORK (15-30 min depending on session length)
   - If bodyweight only: advanced progressions, circuits, EMOM, AMRAP
   - If dumbbells: compound movements (goblet squats, DB bench, rows, lunges, presses)
   - If barbell: big compound lifts (squat, bench, deadlift, OHP, rows)
   - If full gym: strategic mix of free weights, cables, machines + bodyweight supersets
   - ALWAYS pair exercises (supersets or circuits) to keep heart rate up

4. CONDITIONING FINISHER (5-10 min)
   - AMRAP, Tabata, EMOM, or timed circuit
   - Full-body, maximum effort
   - This is where you find out who you really are
   - Burpees, mountain climbers, squat jumps, push-ups — the basics at max intensity

5. COOLDOWN & STRETCH (3-5 min)
   - Static stretching for worked muscles
   - Deep breathing
   - Dom's faith moment: brief scripture or reflection (optional, included naturally)

=== PROGRESSION PHILOSOPHY ===
- Weeks 1-4 (FOUNDATION): Learn the movements. Build the habit. Establish the baseline. Still hard. Still intense. But focused on FORM and CONSISTENCY. RPE 7-8.
- Weeks 5-8 (BUILD): Add volume. Reduce rest. Introduce harder variations. More conditioning. RPE 8-9.
- Weeks 9-12 (PEAK): Maximum intensity. Advanced progressions. Minimal rest. Complex circuits. This is where you break through or break down. RPE 9-10.

=== DOM'S VOICE IN THE WORKOUT ===
- Every workout has a title that sounds like it came from prison: "Cell Block Push," "Yard Time Conditioning," "Solitary Strength," "The Warden's Circuit"
- Exercise notes should be motivational and direct: "No half reps. Full range of motion or it doesn't count." / "This is where most people quit. You're not most people." / "30 seconds rest. Not 31. Not 35. Thirty."
- Include form cues that are practical, not clinical: "Chest to the floor on push-ups. If your chest doesn't touch, you didn't do a push-up." / "Squat until your hip crease is below your knee. Anything above parallel is a curtsy, not a squat."

=== SCALING RULES ===
Every exercise must have scaling options:
- BEGINNER: The version a 500lb person who's never exercised can attempt. Wall push-ups. Step-back burpees. Chair-assisted squats. EVERYONE starts. No one gets excused.
- INTERMEDIATE: Standard versions with good form expectations.
- ADVANCED: Added complexity, tempo, load, or volume.
- BEAST MODE: For people who need to be humbled. Decline diamond push-ups with pause. Burpee + pull-up combos. Pistol squats. Muscle-ups.`;

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

function getPhaseForWeek(weekNumber: number): keyof typeof PHASE_DESCRIPTIONS {
  if (weekNumber <= 4) return "foundation";
  if (weekNumber <= 8) return "build";
  return "peak";
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

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, regenerate, phase: requestedPhase } = await req.json();

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

    // Check if plan already exists (unless regenerating)
    if (!regenerate) {
      const { data: existing } = await supabase
        .from("workout_personalizations")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      if (existing && existing.length > 0) {
        return new Response(
          JSON.stringify({ success: true, message: "Workout plan already exists", cached: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // Clear existing plan for regeneration
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

    // Membership (Solitary) doesn't get AI-generated plans
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

    // If a specific phase is requested, only generate that phase (avoids timeout)
    const phases = requestedPhase
      ? [requestedPhase as "foundation" | "build" | "peak"]
      : ["foundation", "build", "peak"] as const;

    console.log(`Generating ${planType} workout plan for user ${userId} — ${trainingDays} days/week, goal: ${userGoal}, phases: ${phases.join(", ")}`);

    const allPersonalizations: any[] = [];

    for (const phaseKey of phases) {
      const phase = PHASE_DESCRIPTIONS[phaseKey];
      const startWeek = phaseKey === "foundation" ? 1 : phaseKey === "build" ? 5 : 9;

      const tierContext = planType === "coaching"
        ? `\n\nTHIS IS A FREE WORLD (1:1 COACHING) CLIENT — Premium tier. Generate MORE detailed coach notes, MORE specific scaling options, MORE personalized exercise selection based on their detailed profile. Include advanced techniques, tempo prescriptions, and RPE targets for each exercise. This person is paying top dollar for the most detailed, personalized program possible.`
        : `\n\nTHIS IS A GENERAL POPULATION CLIENT — 12-week transformation tier. Generate solid, comprehensive workouts with clear scaling options and form cues. Dom's energy in every note.`;

      const prompt = `${DOM_WORKOUT_PHILOSOPHY}
${tierContext}

USER PROFILE:
${userContext}

CURRENT PHASE: ${phase.title} (Weeks ${phase.weeks})
PHASE DESCRIPTION: ${phase.description}
INTENSITY TARGET: ${phase.intensity}
PHASE FOCUS: ${phase.focus}

PROGRAM TRACK: ${userTrack?.name || "General Fitness"}

Generate a COMPLETE week of workouts for this phase. The user trains ${trainingDays} days per week on these days: ${dayNames.join(", ")}.

For EACH training day, generate the full workout following the exact structure:
1. MOBILITY & ACTIVATION (3-5 exercises)
2. BODYWEIGHT FOUNDATION (3-5 exercises — MUST include push-ups and usually burpees)
3. MAIN WORK (4-8 exercises based on session length)
4. CONDITIONING FINISHER (1-3 exercises/circuits)
5. COOLDOWN (2-4 stretches)

Remember:
- PUSH-UPS are in EVERY session. Scale appropriately for their level.
- BURPEES are in ALMOST every session (skip only if they have a condition preventing floor work or jumping).
- BODYWEIGHT exercises are in EVERY session, even if they have a full gym.
- Equipment exercises ADD to the bodyweight base, they don't replace it.
- Include 4 progression tiers for each exercise: Beginner, Intermediate, Advanced, Beast Mode.

=== EXERCISE DETAIL REQUIREMENTS (NON-NEGOTIABLE) ===
Every single exercise must be EXTREMELY well-explained. A user should be able to read the description and perform the exercise perfectly with ZERO prior experience. Include:

1. FORM BREAKDOWN: Step-by-step how to perform the movement. Where to place hands/feet, body position, range of motion, tempo. Write it like you're coaching someone who has never done this exercise.

2. BREATHING PATTERN: When to inhale, when to exhale. "Inhale on the way down, exhale as you push up." This matters for every exercise.

3. COMMON MISTAKES: 2-3 things people do wrong and how to fix them. "Don't let your hips sag — squeeze your glutes like you're cracking a walnut. If your lower back hurts, your core isn't engaged."

4. MUSCLE ACTIVATION CUES: What should they FEEL working? "You should feel this in your chest and triceps. If you feel it in your shoulders, bring your hands wider."

5. TEMPO: Specify the tempo for each exercise (e.g., "3 seconds down, 1 second pause, 2 seconds up" or "explosive up, controlled 3-count down").

Also generate PROGRESSION NOTES for weeks 2-4 of this phase:
- Week 2: What changes from week 1 (e.g., +2 reps, -5s rest, new variation)
- Week 3: What changes from week 2
- Week 4: What changes from week 3

Respond ONLY with valid JSON:
{
  "phase": "${phaseKey}",
  "phase_title": "${phase.title}",
  "workouts": {
    "Day1Name": {
      "workout_name": "string — prison-style name",
      "workout_description": "string — 1-2 sentences, Dom's voice",
      "estimated_duration": "string — e.g., '45 min'",
      "sections": [
        {
          "section_type": "mobility|bodyweight_foundation|main|conditioning|cooldown",
          "section_title": "string",
          "exercises": [
            {
              "exercise_name": "string",
              "sets": "string (e.g., '4')",
              "reps_or_time": "string (e.g., '15-20' or '45s')",
              "rest": "string (e.g., '30s')",
              "tempo": "string — e.g., '3-1-2-0' (eccentric-pause-concentric-pause in seconds)",
              "notes": "string — Dom's voice, motivational + practical",
              "form_breakdown": "string — detailed step-by-step form instructions. How to set up, execute, and finish the rep. Write this so someone who has NEVER done this exercise can do it perfectly.",
              "breathing": "string — when to inhale and exhale during the movement",
              "common_mistakes": "string — 2-3 mistakes people make and how to fix them",
              "muscles_targeted": "string — primary and secondary muscles",
              "muscle_activation_cue": "string — what they should FEEL and where",
              "scaling": {
                "beginner": "string — the 500lb beginner version with full form explanation",
                "intermediate": "string — standard version",
                "advanced": "string — harder version with technique details",
                "beast_mode": "string — for people who need humbling"
              }
            }
          ]
        }
      ]
    }
  },
  "weekly_progression": {
    "week_2": "string — specific changes (reps, rest, tempo, variations)",
    "week_3": "string — specific changes",
    "week_4": "string — specific changes"
  },
  "phase_summary": "string — 2-3 sentences summarizing this phase, Dom's voice"
}

Use the actual day names (${dayNames.join(", ")}) as keys in the workouts object. Generate REAL, SPECIFIC exercises — not placeholders. Every exercise must have COMPLETE form instructions.`;

      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16000,
        messages: [{ role: "user", content: prompt }],
      });

      const aiText = response.content[0].type === "text" ? response.content[0].text : "";
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        console.error(`Failed to parse AI response for phase ${phaseKey}:`, aiText.substring(0, 500));
        continue;
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error(`JSON parse error for phase ${phaseKey}:`, e);
        continue;
      }

      // Store 4 weeks for this phase
      for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
        const weekNumber = startWeek + weekOffset;
        const progressionKey = weekOffset === 0 ? null : `week_${weekOffset + 1}`;
        const progressionNote = progressionKey ? parsed.weekly_progression?.[progressionKey] || null : null;

        for (let dayIndex = 0; dayIndex < dayNames.length; dayIndex++) {
          const dayName = dayNames[dayIndex];
          const dayWorkout = parsed.workouts?.[dayName];

          if (!dayWorkout) continue;

          // Flatten all exercises with section info
          const exercises: any[] = [];
          let displayOrder = 0;

          for (const section of dayWorkout.sections || []) {
            for (const ex of section.exercises || []) {
              exercises.push({
                exercise_name: ex.exercise_name,
                section_type: section.section_type,
                section_title: section.section_title,
                sets: ex.sets,
                reps_or_time: ex.reps_or_time,
                rest: ex.rest,
                tempo: ex.tempo,
                notes: ex.notes,
                form_breakdown: ex.form_breakdown,
                breathing: ex.breathing,
                common_mistakes: ex.common_mistakes,
                muscles_targeted: ex.muscles_targeted,
                muscle_activation_cue: ex.muscle_activation_cue,
                scaling: ex.scaling,
                display_order: displayOrder++,
              });
            }
          }

          allPersonalizations.push({
            user_id: userId,
            track_id: userTrack?.id || null,
            week_number: weekNumber,
            day_of_week: dayIndex,
            personalized_exercises: {
              workout_name: dayWorkout.workout_name,
              workout_description: dayWorkout.workout_description,
              estimated_duration: dayWorkout.estimated_duration,
              phase: phaseKey,
              phase_title: parsed.phase_title,
              phase_summary: parsed.phase_summary,
              progression_note: progressionNote,
              exercises,
            },
            modification_notes: `${parsed.phase_title} — Week ${weekNumber}${progressionNote ? ` | Progression: ${progressionNote}` : ""}`,
          });
        }
      }

      console.log(`Phase ${phaseKey} generated: ${Object.keys(parsed.workouts || {}).length} days`);
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

    console.log(`Workout plan generated and stored: ${allPersonalizations.length} total day-workouts for user ${userId}`);

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
