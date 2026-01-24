import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WorkoutTemplate {
  name: string;
  desc: string;
  isRest?: boolean;
}

interface WorkoutTemplates {
  monday: WorkoutTemplate;
  tuesday: WorkoutTemplate;
  wednesday: WorkoutTemplate;
  thursday: WorkoutTemplate;
  friday: WorkoutTemplate;
  saturday: WorkoutTemplate;
  sunday: WorkoutTemplate;
}

// Prison-style workout templates by track type
const FAT_LOSS_WORKOUTS: WorkoutTemplates = {
  monday: { name: "Metabolic Push", desc: "High-rep push movements with cardio bursts" },
  tuesday: { name: "Cardio Pull", desc: "Back and biceps with conditioning intervals" },
  wednesday: { name: "Leg Burner", desc: "Lower body circuit for maximum calorie burn" },
  thursday: { name: "Upper Body HIIT", desc: "Upper body movements with HIIT protocol" },
  friday: { name: "Lower Body Blast", desc: "Leg-focused conditioning" },
  saturday: { name: "Full Body Inferno", desc: "Total body circuit - no rest for the wicked" },
  sunday: { name: "Active Recovery", desc: "Light movement and stretching", isRest: true },
};

const MUSCLE_WORKOUTS: WorkoutTemplates = {
  monday: { name: "Cell Block Chest", desc: "Push day - chest, shoulders, triceps" },
  tuesday: { name: "Yard Back", desc: "Pull day - back and biceps" },
  wednesday: { name: "Prison Legs", desc: "Leg day - quads, hams, glutes" },
  thursday: { name: "Iron Shoulders", desc: "Shoulder and arm focus" },
  friday: { name: "Power Day", desc: "Compound movements for strength" },
  saturday: { name: "Pump Session", desc: "High-volume accessory work" },
  sunday: { name: "Rest & Recover", desc: "Complete rest - let the muscle grow", isRest: true },
};

const RECOMP_WORKOUTS: WorkoutTemplates = {
  monday: { name: "Strength Push", desc: "Heavy push with metabolic finisher" },
  tuesday: { name: "Cardio Conditioning", desc: "Pure conditioning and core" },
  wednesday: { name: "Strength Pull", desc: "Heavy pull with explosive work" },
  thursday: { name: "HIIT Circuit", desc: "Full body interval training" },
  friday: { name: "Strength Legs", desc: "Lower body strength with conditioning" },
  saturday: { name: "Hybrid Burner", desc: "Strength and cardio complex" },
  sunday: { name: "Active Recovery", desc: "Mobility and light movement", isRest: true },
};

// Exercise templates by section type and phase
const getExercises = (trackType: string, dayType: string, phase: string) => {
  const reps = phase === "foundation" ? "15-20" : phase === "build" ? "10-15" : "8-12 or AMRAP";
  const rest = phase === "foundation" ? "45-60 sec" : phase === "build" ? "30-45 sec" : "20-30 sec";

  // Universal warmup
  const warmup = [
    { name: "Jumping Jacks", sets: "1", reps: "30 sec", rest: "0", notes: "Get the blood flowing" },
    { name: "Arm Circles", sets: "1", reps: "20 each direction", rest: "0", notes: "Loosen up shoulders" },
    { name: "Bodyweight Squats", sets: "1", reps: "15", rest: "0", notes: "Warm up the legs" },
    { name: "Push-up to Downward Dog", sets: "1", reps: "10", rest: "30 sec", notes: "Full body activation" },
  ];

  // Universal cooldown
  const cooldown = [
    { name: "Standing Quad Stretch", sets: "1", reps: "30 sec each", rest: "0", notes: "Hold steady" },
    { name: "Shoulder Stretch", sets: "1", reps: "30 sec each", rest: "0", notes: "Arm across body" },
    { name: "Deep Breathing", sets: "1", reps: "10 breaths", rest: "0", notes: "Calm the nervous system" },
  ];

  let main: any[] = [];
  let finisher: any[] = [];

  // Fat Loss exercises
  if (trackType === "fat_loss") {
    if (dayType.includes("push") || dayType.includes("chest")) {
      main = [
        { name: "Burpees", sets: "4", reps: reps, rest, notes: "Explosive! Full extension at top" },
        { name: "Push-ups", sets: "4", reps: reps, rest, notes: "Chest to floor, full lockout" },
        { name: "Mountain Climbers", sets: "3", reps: "30 sec", rest: "20 sec", notes: "Fast pace, drive those knees" },
        { name: "Diamond Push-ups", sets: "3", reps: reps, rest, notes: "Hands together, elbows tight" },
        { name: "Plank Shoulder Taps", sets: "3", reps: "20 total", rest, notes: "Keep hips stable" },
      ];
      finisher = [
        { name: "Burpee Ladder", sets: "1", reps: "10-1 countdown", rest: "0", notes: "Start with 10, then 9, 8... no rest!" },
      ];
    } else if (dayType.includes("pull") || dayType.includes("back")) {
      main = [
        { name: "Inverted Rows", sets: "4", reps: reps, rest, notes: "Use a sturdy bar or table" },
        { name: "Superman Holds", sets: "3", reps: "30 sec", rest, notes: "Squeeze glutes and back" },
        { name: "Towel Rows", sets: "3", reps: reps, rest, notes: "Wrap towel around pole, pull hard" },
        { name: "Reverse Snow Angels", sets: "3", reps: "15", rest, notes: "Face down, arms sweep wide" },
        { name: "High Knees", sets: "3", reps: "30 sec", rest: "15 sec", notes: "Keep the pace up!" },
      ];
      finisher = [
        { name: "Row Hold + High Knees", sets: "3", reps: "20 sec hold + 20 knees", rest: "30 sec", notes: "Superset - no break between" },
      ];
    } else if (dayType.includes("leg")) {
      main = [
        { name: "Jump Squats", sets: "4", reps: reps, rest, notes: "Explode up, soft landing" },
        { name: "Reverse Lunges", sets: "3", reps: "12 each leg", rest, notes: "Step back, knee kisses floor" },
        { name: "Prisoner Squats", sets: "4", reps: reps, rest, notes: "Hands behind head, chest up" },
        { name: "Glute Bridges", sets: "3", reps: reps, rest, notes: "Squeeze hard at top" },
        { name: "Calf Raises", sets: "3", reps: "20", rest: "20 sec", notes: "Full range of motion" },
      ];
      finisher = [
        { name: "Squat Jump Tabata", sets: "8", reps: "20 sec on, 10 sec off", rest: "0", notes: "4 minutes of pain, pure results" },
      ];
    } else if (dayType.includes("upper") || dayType.includes("hiit")) {
      main = [
        { name: "Push-up to Renegade Row", sets: "4", reps: "10", rest, notes: "Push-up, row left, row right = 1 rep" },
        { name: "Pike Push-ups", sets: "3", reps: reps, rest, notes: "Hips high, head toward floor" },
        { name: "Dips (chair or bench)", sets: "3", reps: reps, rest, notes: "90 degree elbow bend" },
        { name: "Plank Up-Downs", sets: "3", reps: "10 each arm", rest, notes: "Forearm to hand, stay tight" },
        { name: "Shadow Boxing", sets: "3", reps: "60 sec", rest: "30 sec", notes: "Throw real punches, move your feet" },
      ];
      finisher = [
        { name: "100 Burpee Challenge", sets: "1", reps: "For time", rest: "0", notes: "Break as needed, just finish" },
      ];
    } else { // full body
      main = [
        { name: "Burpee Box Jump", sets: "4", reps: "10", rest, notes: "Burpee into jump onto step/box" },
        { name: "Walkout Push-ups", sets: "3", reps: "10", rest, notes: "Walk hands out, push-up, walk back" },
        { name: "Squat Thrusters", sets: "4", reps: reps, rest, notes: "Squat, explode up with arms overhead" },
        { name: "Plank Jacks", sets: "3", reps: "20", rest, notes: "Jumping jacks in plank position" },
        { name: "Broad Jumps", sets: "3", reps: "10", rest, notes: "Maximum distance each jump" },
        { name: "V-Ups", sets: "3", reps: "15", rest, notes: "Touch toes at top" },
      ];
      finisher = [
        { name: "Death by Burpees", sets: "1", reps: "EMOM - add 1 each minute", rest: "0", notes: "Minute 1 = 1 burpee, minute 2 = 2... until failure" },
      ];
    }
  }
  // Muscle Building exercises
  else if (trackType === "muscle") {
    if (dayType.includes("chest") || dayType.includes("push")) {
      main = [
        { name: "Wide Push-ups", sets: "4", reps: reps, rest, notes: "Hands wider than shoulders, squeeze chest" },
        { name: "Close-Grip Push-ups", sets: "4", reps: reps, rest, notes: "Hands under chest, tricep focus" },
        { name: "Decline Push-ups", sets: "3", reps: reps, rest, notes: "Feet elevated, more chest activation" },
        { name: "Dumbbell Floor Press", sets: "4", reps: reps, rest, notes: "Control the weight, squeeze at top" },
        { name: "Pike Push-ups", sets: "3", reps: reps, rest, notes: "Shoulder builder" },
        { name: "Tricep Dips", sets: "3", reps: reps, rest, notes: "Deep stretch, full lockout" },
      ];
      finisher = [
        { name: "Push-up Drop Set", sets: "1", reps: "Wide to close to knees", rest: "0", notes: "No rest - go to failure on each variation" },
      ];
    } else if (dayType.includes("back") || dayType.includes("pull")) {
      main = [
        { name: "Pull-ups or Inverted Rows", sets: "4", reps: reps, rest, notes: "Full stretch, squeeze at top" },
        { name: "Dumbbell Rows", sets: "4", reps: "12 each", rest, notes: "Pull to hip, squeeze lats" },
        { name: "Face Pulls (band or towel)", sets: "3", reps: reps, rest, notes: "Pull to face, external rotation" },
        { name: "Superman Pulses", sets: "3", reps: "20", rest, notes: "Small pulses, constant tension" },
        { name: "Bicep Curls", sets: "3", reps: reps, rest, notes: "Slow negative, squeeze at top" },
        { name: "Hammer Curls", sets: "3", reps: reps, rest, notes: "Neutral grip, brachialis focus" },
      ];
      finisher = [
        { name: "21s Curl Finisher", sets: "2", reps: "7+7+7", rest: "60 sec", notes: "7 bottom half, 7 top half, 7 full" },
      ];
    } else if (dayType.includes("leg")) {
      main = [
        { name: "Goblet Squats", sets: "4", reps: reps, rest, notes: "Hold weight at chest, deep squat" },
        { name: "Bulgarian Split Squats", sets: "3", reps: "10 each", rest, notes: "Rear foot elevated, control descent" },
        { name: "Romanian Deadlifts", sets: "4", reps: reps, rest, notes: "Hinge at hips, feel hamstrings stretch" },
        { name: "Walking Lunges", sets: "3", reps: "12 each", rest, notes: "Big steps, knee kisses floor" },
        { name: "Calf Raises", sets: "4", reps: "20", rest: "30 sec", notes: "Pause at top, full stretch at bottom" },
        { name: "Glute Bridges", sets: "3", reps: reps, rest, notes: "Pause and squeeze 2 sec at top" },
      ];
      finisher = [
        { name: "Wall Sit Challenge", sets: "3", reps: "45 sec hold", rest: "30 sec", notes: "Thighs parallel, back flat on wall" },
      ];
    } else if (dayType.includes("shoulder") || dayType.includes("arm")) {
      main = [
        { name: "Pike Push-ups", sets: "4", reps: reps, rest, notes: "Feet elevated for more challenge" },
        { name: "Lateral Raises", sets: "3", reps: reps, rest, notes: "Control the weight, slight bend in elbow" },
        { name: "Front Raises", sets: "3", reps: reps, rest, notes: "Alternate arms, core tight" },
        { name: "Arnold Press", sets: "3", reps: reps, rest, notes: "Rotate from curl to press" },
        { name: "Skull Crushers", sets: "3", reps: reps, rest, notes: "Keep elbows fixed, extend fully" },
        { name: "Diamond Push-ups", sets: "3", reps: reps, rest, notes: "Tricep finisher" },
      ];
      finisher = [
        { name: "Shoulder Burnout", sets: "1", reps: "10 each direction lateral raise", rest: "0", notes: "Front, side, rear - no rest" },
      ];
    } else if (dayType.includes("power") || dayType.includes("compound")) {
      main = [
        { name: "Dumbbell Thrusters", sets: "4", reps: "10", rest: "60 sec", notes: "Squat to press - one fluid motion" },
        { name: "Renegade Rows", sets: "4", reps: "8 each", rest, notes: "Push-up position, row each side" },
        { name: "Devil Press", sets: "3", reps: "10", rest: "60 sec", notes: "Burpee with dumbbell snatch" },
        { name: "Goblet Squats", sets: "4", reps: reps, rest, notes: "Heavy and controlled" },
        { name: "Floor Press", sets: "4", reps: reps, rest, notes: "Pause at bottom" },
      ];
      finisher = [
        { name: "Farmer Carry", sets: "3", reps: "40 yard walk", rest: "45 sec", notes: "Heavy as possible, grip tight" },
      ];
    } else { // pump session
      main = [
        { name: "Push-up Variations", sets: "3", reps: "10 each type", rest, notes: "Wide, regular, diamond" },
        { name: "Curl 21s", sets: "3", reps: "21 total", rest, notes: "7 bottom, 7 top, 7 full" },
        { name: "Tricep Extensions", sets: "3", reps: "15", rest, notes: "Squeeze at full extension" },
        { name: "Lateral Raise Drop Set", sets: "3", reps: "10+10+10", rest, notes: "Drop weight twice, no rest" },
        { name: "Plank Hold", sets: "3", reps: "45 sec", rest, notes: "Tight core, don't sag" },
      ];
      finisher = [
        { name: "100 Push-up Challenge", sets: "1", reps: "For time", rest: "0", notes: "Any variation, just finish" },
      ];
    }
  }
  // Recomposition exercises
  else {
    if (dayType.includes("push")) {
      main = [
        { name: "Push-ups", sets: "4", reps: "12", rest: "45 sec", notes: "Controlled tempo" },
        { name: "Dumbbell Floor Press", sets: "4", reps: reps, rest, notes: "Heavy, pause at bottom" },
        { name: "Pike Push-ups", sets: "3", reps: reps, rest, notes: "Shoulder focus" },
        { name: "Burpees", sets: "3", reps: "10", rest, notes: "Explosive finish" },
        { name: "Dips", sets: "3", reps: reps, rest, notes: "Full depth" },
      ];
      finisher = [
        { name: "Push-up AMRAP", sets: "2", reps: "60 sec max reps", rest: "60 sec", notes: "Go until failure" },
      ];
    } else if (dayType.includes("conditioning") || dayType.includes("cardio")) {
      main = [
        { name: "Burpees", sets: "4", reps: "12", rest: "30 sec", notes: "Full extension every rep" },
        { name: "Mountain Climbers", sets: "4", reps: "40 sec", rest: "20 sec", notes: "Sprint pace" },
        { name: "Jump Squats", sets: "3", reps: "15", rest: "30 sec", notes: "Explode up" },
        { name: "High Knees", sets: "3", reps: "40 sec", rest: "20 sec", notes: "Drive those knees" },
        { name: "Plank Jacks", sets: "3", reps: "20", rest: "30 sec", notes: "Keep core tight" },
        { name: "Box Jumps or Step-ups", sets: "3", reps: "15", rest, notes: "Use stairs if no box" },
      ];
      finisher = [
        { name: "Tabata Burpees", sets: "8", reps: "20 sec on, 10 off", rest: "0", notes: "4 minutes of pure conditioning" },
      ];
    } else if (dayType.includes("pull")) {
      main = [
        { name: "Pull-ups or Inverted Rows", sets: "4", reps: reps, rest, notes: "Full range" },
        { name: "Dumbbell Rows", sets: "4", reps: "10 each", rest, notes: "Heavy, squeeze lats" },
        { name: "Superman Holds", sets: "3", reps: "30 sec", rest, notes: "Constant tension" },
        { name: "Explosive Rows", sets: "3", reps: "8", rest, notes: "Fast pull, slow lower" },
        { name: "Bicep Curls", sets: "3", reps: reps, rest, notes: "Strict form" },
      ];
      finisher = [
        { name: "Row + Jump Complex", sets: "3", reps: "10 rows + 10 jumps", rest: "45 sec", notes: "Strength meets power" },
      ];
    } else if (dayType.includes("hiit") || dayType.includes("circuit")) {
      main = [
        { name: "Devil Press", sets: "4", reps: "8", rest, notes: "Burpee + dumbbell snatch" },
        { name: "Thrusters", sets: "4", reps: "10", rest, notes: "Squat to press" },
        { name: "Renegade Rows", sets: "3", reps: "8 each", rest, notes: "Plank row" },
        { name: "Jump Lunges", sets: "3", reps: "10 each", rest, notes: "Explosive" },
        { name: "Plank Up-Downs", sets: "3", reps: "10 each arm", rest, notes: "Stay tight" },
      ];
      finisher = [
        { name: "EMOM Burpees", sets: "10", reps: "5 burpees per minute", rest: "remaining time", notes: "10 minute challenge" },
      ];
    } else if (dayType.includes("leg")) {
      main = [
        { name: "Goblet Squats", sets: "4", reps: reps, rest, notes: "Deep, controlled" },
        { name: "Romanian Deadlifts", sets: "4", reps: "10", rest, notes: "Feel the stretch" },
        { name: "Jump Squats", sets: "3", reps: "12", rest, notes: "Explosive power" },
        { name: "Bulgarian Split Squats", sets: "3", reps: "10 each", rest, notes: "Balance and strength" },
        { name: "Calf Raises", sets: "3", reps: "20", rest: "20 sec", notes: "Full ROM" },
      ];
      finisher = [
        { name: "Squat Hold + Jumps", sets: "3", reps: "30 sec hold + 10 jumps", rest: "45 sec", notes: "Burn then explode" },
      ];
    } else { // hybrid
      main = [
        { name: "Thrusters", sets: "4", reps: "10", rest, notes: "Full body power" },
        { name: "Burpee Pull-ups", sets: "3", reps: "8", rest: "60 sec", notes: "Burpee into pull-up if possible" },
        { name: "Dumbbell Complex", sets: "3", reps: "5 each movement", rest: "60 sec", notes: "Row, clean, press, squat - no drop" },
        { name: "Mountain Climbers", sets: "3", reps: "30 sec", rest: "30 sec", notes: "Sprint pace" },
        { name: "Plank Hold", sets: "3", reps: "45 sec", rest: "30 sec", notes: "Core control" },
      ];
      finisher = [
        { name: "Chipper", sets: "1", reps: "50 squats, 40 push-ups, 30 lunges, 20 burpees, 10 pull-ups", rest: "0", notes: "For time - no stopping" },
      ];
    }
  }

  return { warmup, main, finisher, cooldown };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all weeks grouped by track
    const { data: weeks, error: weeksError } = await supabase
      .from("program_weeks")
      .select(`
        id,
        week_number,
        phase,
        track_id,
        program_tracks (
          id,
          name,
          goal_match
        )
      `)
      .order("week_number");

    if (weeksError) throw weeksError;

    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    let totalDayWorkouts = 0;
    let totalExercises = 0;

    for (const week of weeks || []) {
      const trackName = (week as any).program_tracks?.name || "";
      const trackType = trackName.toLowerCase().includes("fat") ? "fat_loss" 
        : trackName.toLowerCase().includes("muscle") ? "muscle" 
        : "recomp";
      
      const workoutTemplates = trackType === "fat_loss" ? FAT_LOSS_WORKOUTS 
        : trackType === "muscle" ? MUSCLE_WORKOUTS 
        : RECOMP_WORKOUTS;

      for (let i = 0; i < days.length; i++) {
        const day = days[i];
        const template = workoutTemplates[day as keyof typeof workoutTemplates];
        
        // Check if day workout already exists
        const { data: existing } = await supabase
          .from("program_day_workouts")
          .select("id")
          .eq("week_id", week.id)
          .eq("day_of_week", day)
          .single();

        let dayWorkoutId: string;

        if (existing) {
          dayWorkoutId = existing.id;
        } else {
          // Create day workout
          const { data: dayWorkout, error: dayError } = await supabase
            .from("program_day_workouts")
            .insert({
              week_id: week.id,
              day_of_week: day,
              workout_name: template.name,
              workout_description: template.desc,
              is_rest_day: template.isRest || false,
              display_order: i,
            })
            .select()
            .single();

          if (dayError) {
            console.error(`Error creating day workout for week ${week.week_number} ${day}:`, dayError);
            continue;
          }
          dayWorkoutId = dayWorkout.id;
          totalDayWorkouts++;
        }

        // Skip exercises for rest days
        if (template.isRest) continue;

        // Check if exercises already exist for this day
        const { count } = await supabase
          .from("program_day_exercises")
          .select("*", { count: "exact", head: true })
          .eq("day_workout_id", dayWorkoutId);

        if (count && count > 0) continue; // Already has exercises

        // Get exercises for this day
        const exercises = getExercises(trackType, template.name.toLowerCase(), week.phase);
        const allExercises: any[] = [];
        let order = 0;

        for (const ex of exercises.warmup) {
          allExercises.push({
            day_workout_id: dayWorkoutId,
            section_type: "warmup",
            exercise_name: ex.name,
            sets: ex.sets,
            reps_or_time: ex.reps,
            rest: ex.rest,
            notes: ex.notes,
            display_order: order++,
          });
        }

        for (const ex of exercises.main) {
          allExercises.push({
            day_workout_id: dayWorkoutId,
            section_type: "main",
            exercise_name: ex.name,
            sets: ex.sets,
            reps_or_time: ex.reps,
            rest: ex.rest,
            notes: ex.notes,
            display_order: order++,
          });
        }

        for (const ex of exercises.finisher) {
          allExercises.push({
            day_workout_id: dayWorkoutId,
            section_type: "finisher",
            exercise_name: ex.name,
            sets: ex.sets,
            reps_or_time: ex.reps,
            rest: ex.rest,
            notes: ex.notes,
            display_order: order++,
          });
        }

        for (const ex of exercises.cooldown) {
          allExercises.push({
            day_workout_id: dayWorkoutId,
            section_type: "cooldown",
            exercise_name: ex.name,
            sets: ex.sets,
            reps_or_time: ex.reps,
            rest: ex.rest,
            notes: ex.notes,
            display_order: order++,
          });
        }

        if (allExercises.length > 0) {
          const { error: exError } = await supabase
            .from("program_day_exercises")
            .insert(allExercises);

          if (exError) {
            console.error(`Error creating exercises for week ${week.week_number} ${day}:`, exError);
          } else {
            totalExercises += allExercises.length;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${totalDayWorkouts} day workouts and ${totalExercises} exercises`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
