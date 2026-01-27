import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Dom's style configuration by difficulty level
const DOM_STYLE_CONFIG = {
  beginner: {
    sets: { min: 3, max: 4 },
    reps: { min: 20, max: 25 },
    rest: "60s",
    finisherDuration: "60 sec",
    intensityCues: [
      "Focus on form, build the burn",
      "Control every rep, feel the muscle",
      "No shortcuts, full range of motion",
      "Build your foundation one rep at a time",
      "Form first, intensity follows",
      "Every rep counts",
    ],
  },
  intermediate: {
    sets: { min: 3, max: 4 },
    reps: { min: 20, max: 30 },
    rest: "50s",
    finisherDuration: "90 sec",
    intensityCues: [
      "Push through the burn",
      "No breaks, constant tension",
      "Grind it out",
      "Iron sharpens iron",
      "Embrace the discomfort",
      "The pain is temporary, strength is permanent",
    ],
  },
  advanced: {
    sets: { min: 4, max: 5 },
    reps: { min: 25, max: 35 },
    rest: "45s",
    finisherDuration: "3 min",
    intensityCues: [
      "Failure is the goal",
      "Leave nothing in the tank",
      "Iron sharpens iron",
      "No excuses, no mercy",
      "Push until you can't, then push more",
      "Embrace the burn, that's where growth happens",
    ],
  },
  conditioning: {
    sets: { min: 4, max: 5 },
    reps: { min: 30, max: 40 },
    rest: "30s",
    finisherDuration: "AMRAP to failure",
    intensityCues: [
      "Maximum effort, no holding back",
      "Sprint like your freedom depends on it",
      "Empty the tank",
      "Every second counts",
      "Leave it all on the floor",
      "No quit in you",
    ],
  },
};

// AMRAP Finisher pools by difficulty
const AMRAP_FINISHERS = {
  beginner: [
    { name: "AMRAP: Burpees", duration: "60s", notes: "As many as possible in 60 seconds. Chest to floor, explosive jump." },
    { name: "AMRAP: Push-up + Squat Combo", duration: "60s", notes: "Alternate 5 push-ups, 5 squats. Repeat until time." },
    { name: "AMRAP: Mountain Climbers", duration: "60s", notes: "Quick feet, hands planted. Go until you can't." },
    { name: "AMRAP: Jumping Jacks", duration: "60s", notes: "Arms overhead, feet wide. Keep pace consistent." },
    { name: "AMRAP: High Knees", duration: "60s", notes: "Drive knees to chest, pump arms. Don't slow down." },
    { name: "AMRAP: Bodyweight Squats", duration: "60s", notes: "Ass to grass, explode up. Count your reps." },
  ],
  intermediate: [
    { name: "AMRAP: Burpees + Tuck Jumps", duration: "90s", notes: "10 burpees, 10 tuck jumps. Repeat until time. No quitting." },
    { name: "AMRAP: Prison Cell Complex", duration: "2 min", notes: "5 push-ups, 10 squats, 5 lunges each leg. No rest between rounds." },
    { name: "AMRAP: Devil's Burpees", duration: "90s", notes: "Burpee with push-up at bottom, jump at top. Maximum effort." },
    { name: "AMRAP: Plank to Push-up Ladder", duration: "90s", notes: "1 push-up, hold plank 5 sec. 2 push-ups, hold 5 sec. Keep climbing." },
    { name: "AMRAP: Squat Jump + Lunge Combo", duration: "90s", notes: "5 squat jumps, 10 alternating lunges. Repeat until failure." },
    { name: "AMRAP: The Grinder", duration: "2 min", notes: "10 push-ups, 10 squats, 10 mountain climbers. No breaks." },
  ],
  advanced: [
    { name: "AMRAP: The Yard Sprint", duration: "3 min", notes: "10 burpees, 20 squats, 30 push-ups. Repeat until time. Leave nothing." },
    { name: "AMRAP: Iron Will", duration: "3 min", notes: "5 pull-ups (or max), 10 dips, 15 squats. Until failure. No excuses." },
    { name: "AMRAP: Solitary Confinement", duration: "4 min", notes: "Cell-sized chaos. 20 push-ups, 20 squats, 20 lunges, 20 mountain climbers. Repeat." },
    { name: "AMRAP: Prison Break", duration: "3 min", notes: "15 burpees, 15 squat jumps, 15 tuck jumps. Maximum violence of action." },
    { name: "AMRAP: The Warden's Challenge", duration: "4 min", notes: "10 diamond push-ups, 20 jump squats, 30 mountain climbers. Beat your count." },
    { name: "AMRAP: Lockdown Ladder", duration: "3 min", notes: "1-2-3-4-5 burpees with push-ups between each set. Keep climbing." },
  ],
  conditioning: [
    { name: "AMRAP: Sprint to Failure", duration: "5 min", notes: "20 burpees, 30 squat jumps, 40 mountain climbers. Repeat until you drop." },
    { name: "AMRAP: Total Body Destruction", duration: "4 min", notes: "Every 30 seconds: 5 burpees. Fill remaining time with high knees. No rest." },
    { name: "AMRAP: The Executioner", duration: "5 min", notes: "10 burpees, 10 tuck jumps, 10 push-ups, 10 squat jumps. Repeat to failure." },
    { name: "AMRAP: Cardio Carnage", duration: "4 min", notes: "30 mountain climbers, 20 squat jumps, 10 burpees. Leave everything on the floor." },
    { name: "AMRAP: Death Row", duration: "5 min", notes: "Every exercise to failure, one after another. Push-ups, squats, lunges, burpees." },
    { name: "AMRAP: Final Rep", duration: "4 min", notes: "As many rounds as possible: 5 burpees, 10 push-ups, 15 squats, 20 lunges." },
  ],
};

// Map category name to difficulty key
function getCategoryDifficulty(categoryName: string): keyof typeof DOM_STYLE_CONFIG {
  const name = categoryName?.toLowerCase() || "";
  if (name.includes("beginner") || name.includes("basics")) return "beginner";
  if (name.includes("foundation")) return "intermediate";
  if (name.includes("intermediate") || name.includes("growth")) return "intermediate";
  if (name.includes("advanced") || name.includes("performance")) return "advanced";
  if (name.includes("athletic") || name.includes("conditioning")) return "conditioning";
  return "beginner";
}

// Transform exercise to Dom's style
function transformExercise(
  exercise: { sets: string | null; reps_or_time: string | null; rest: string | null; notes: string | null; section_type: string | null },
  config: typeof DOM_STYLE_CONFIG[keyof typeof DOM_STYLE_CONFIG]
): { sets: string; reps_or_time: string; rest: string; notes: string } {
  const sectionType = exercise.section_type || "main";
  
  // Warmups get different treatment - keep lower volume
  if (sectionType === "warmup") {
    return {
      sets: "2",
      reps_or_time: "15-20",
      rest: "0s",
      notes: exercise.notes || "Get the blood flowing, prepare for battle",
    };
  }
  
  // Get a random intensity cue
  const randomCue = config.intensityCues[Math.floor(Math.random() * config.intensityCues.length)];
  
  // Main exercises get high-rep treatment
  const newSets = Math.floor(Math.random() * (config.sets.max - config.sets.min + 1)) + config.sets.min;
  const newReps = `${config.reps.min}-${config.reps.max}`;
  
  // Combine existing notes with intensity cue
  const existingNotes = exercise.notes || "";
  const newNotes = existingNotes ? `${existingNotes}. ${randomCue}` : randomCue;
  
  return {
    sets: String(newSets),
    reps_or_time: newReps,
    rest: config.rest,
    notes: newNotes,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results = {
      exercisesUpdated: 0,
      finishersAdded: 0,
      templatesProcessed: 0,
      errors: [] as string[],
    };

    // Get all templates with their categories
    const { data: templates, error: templatesError } = await supabase
      .from("program_templates")
      .select(`
        id,
        name,
        category:program_template_categories(name)
      `)
      .eq("is_active", true);

    if (templatesError) throw templatesError;

    console.log(`Processing ${templates?.length || 0} templates`);

    if (!templates) {
      return new Response(
        JSON.stringify({ success: false, message: "No templates found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const template of templates) {
      try {
        // Handle category which can be array or object depending on Supabase join
        const categoryData = template.category;
        const categoryObj = Array.isArray(categoryData) ? categoryData[0] : categoryData;
        const categoryName = categoryObj?.name || "Beginner Basics";
        const difficulty = getCategoryDifficulty(categoryName);
        const config = DOM_STYLE_CONFIG[difficulty];
        const finisherPool = AMRAP_FINISHERS[difficulty];

        console.log(`Processing ${template.name} (${categoryName} -> ${difficulty})`);

        // Get all weeks for this template
        const { data: weeks } = await supabase
          .from("program_template_weeks")
          .select("id")
          .eq("template_id", template.id);

        if (!weeks || weeks.length === 0) continue;

        // Get all days for these weeks
        const weekIds = weeks.map(w => w.id);
        const { data: days } = await supabase
          .from("program_template_days")
          .select("id, is_rest_day")
          .in("week_id", weekIds);

        if (!days) continue;

        // Process each day
        for (const day of days) {
          if (day.is_rest_day) continue;

          // Get exercises for this day
          const { data: exercises } = await supabase
            .from("program_template_exercises")
            .select("*")
            .eq("day_id", day.id)
            .order("display_order");

          if (!exercises) continue;

          // Track if we have an AMRAP finisher
          let hasAmrapFinisher = false;
          let maxOrder = 0;

          // Update each exercise to Dom's style
          for (const exercise of exercises) {
            maxOrder = Math.max(maxOrder, exercise.display_order || 0);
            
            // Check if already an AMRAP finisher
            if (exercise.exercise_name?.includes("AMRAP")) {
              hasAmrapFinisher = true;
              continue;
            }

            // Transform to Dom's style
            const transformed = transformExercise(exercise, config);

            const { error: updateError } = await supabase
              .from("program_template_exercises")
              .update({
                sets: transformed.sets,
                reps_or_time: transformed.reps_or_time,
                rest: transformed.rest,
                notes: transformed.notes,
              })
              .eq("id", exercise.id);

            if (updateError) {
              console.error(`Error updating exercise ${exercise.id}:`, updateError);
              continue;
            }

            results.exercisesUpdated++;
          }

          // Add AMRAP finisher if missing
          if (!hasAmrapFinisher) {
            // Pick a random finisher from the pool
            const finisher = finisherPool[Math.floor(Math.random() * finisherPool.length)];

            const { error: insertError } = await supabase
              .from("program_template_exercises")
              .insert({
                day_id: day.id,
                section_type: "finisher",
                exercise_name: finisher.name,
                sets: "1",
                reps_or_time: finisher.duration,
                rest: "0s",
                notes: finisher.notes,
                display_order: maxOrder + 1,
              });

            if (insertError) {
              console.error(`Error inserting finisher for day ${day.id}:`, insertError);
            } else {
              results.finishersAdded++;
            }
          }
        }

        results.templatesProcessed++;
        console.log(`Completed ${template.name}`);

      } catch (err) {
        const error = err as Error;
        console.error(`Error processing ${template.name}:`, error.message);
        results.errors.push(`${template.name}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Transformed ${results.templatesProcessed} templates to Dom's style`,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
