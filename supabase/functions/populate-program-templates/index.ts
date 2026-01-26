import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Day order for program generation
const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Get workout day distribution based on days per week
function getWorkoutDayIndices(daysPerWeek: number): number[] {
  switch (daysPerWeek) {
    case 3: return [0, 2, 4]; // Mon, Wed, Fri
    case 4: return [0, 1, 3, 4]; // Mon, Tue, Thu, Fri
    case 5: return [0, 1, 2, 4, 5]; // Mon, Tue, Wed, Fri, Sat
    case 6: return [0, 1, 2, 3, 4, 5]; // Mon-Sat
    default: return [0, 2, 4]; // Default to 3 days
  }
}

// Exercise pools by difficulty level
const EXERCISE_POOLS = {
  beginner: {
    push: [
      { name: "Push-ups", sets: "3", reps: "8-12", rest: "60s", notes: "Keep core tight, lower chest to floor" },
      { name: "DB Bench Press", sets: "3", reps: "10-12", rest: "60s", notes: "Control the descent, press through chest" },
      { name: "Overhead Press", sets: "3", reps: "10", rest: "60s", notes: "Brace core, press straight up" },
      { name: "Incline DB Press", sets: "3", reps: "10-12", rest: "60s", notes: "30-degree angle, full range of motion" },
      { name: "DB Shoulder Press", sets: "3", reps: "10", rest: "60s", notes: "Seated or standing, control the weight" },
      { name: "Tricep Dips (Bench)", sets: "3", reps: "10-15", rest: "45s", notes: "Keep elbows close, lower with control" },
    ],
    pull: [
      { name: "Lat Pulldown", sets: "3", reps: "10-12", rest: "60s", notes: "Pull to upper chest, squeeze lats" },
      { name: "DB Row", sets: "3", reps: "10-12", rest: "60s", notes: "Pull elbow back, squeeze shoulder blade" },
      { name: "Cable Row", sets: "3", reps: "10-12", rest: "60s", notes: "Sit tall, pull to belly button" },
      { name: "Face Pulls", sets: "3", reps: "15", rest: "45s", notes: "Pull to face, externally rotate" },
      { name: "Assisted Pull-ups", sets: "3", reps: "8-10", rest: "60s", notes: "Full hang, pull chin over bar" },
      { name: "Bicep Curls", sets: "3", reps: "12", rest: "45s", notes: "Control the negative, no swinging" },
    ],
    legs: [
      { name: "Goblet Squat", sets: "3", reps: "10-12", rest: "60s", notes: "Knees track over toes, depth matters" },
      { name: "Leg Press", sets: "3", reps: "12-15", rest: "60s", notes: "Full range, don't lock knees" },
      { name: "Romanian Deadlift", sets: "3", reps: "10-12", rest: "60s", notes: "Hinge at hips, slight knee bend" },
      { name: "Walking Lunges", sets: "3", reps: "10 each", rest: "60s", notes: "Step long, knee over ankle" },
      { name: "Leg Curl", sets: "3", reps: "12-15", rest: "45s", notes: "Squeeze hamstrings at top" },
      { name: "Calf Raises", sets: "3", reps: "15-20", rest: "45s", notes: "Full stretch, pause at top" },
    ],
    core: [
      { name: "Plank", sets: "3", reps: "30-45s", rest: "30s", notes: "Straight line from head to heels" },
      { name: "Dead Bug", sets: "3", reps: "10 each", rest: "30s", notes: "Keep lower back pressed to floor" },
      { name: "Bird Dog", sets: "3", reps: "10 each", rest: "30s", notes: "Opposite arm/leg, maintain balance" },
      { name: "Pallof Press", sets: "3", reps: "10 each", rest: "30s", notes: "Resist rotation, brace core" },
      { name: "Mountain Climbers", sets: "3", reps: "20 each", rest: "30s", notes: "Keep hips level, quick feet" },
      { name: "Russian Twist", sets: "3", reps: "15 each", rest: "30s", notes: "Rotate from core, not arms" },
    ],
    warmup: [
      { name: "Jumping Jacks", sets: "2", reps: "30", rest: "0s", notes: "Get the heart rate up" },
      { name: "Bodyweight Squats", sets: "2", reps: "15", rest: "0s", notes: "Full depth, controlled" },
      { name: "Arm Circles", sets: "2", reps: "20 each", rest: "0s", notes: "Forward then backward" },
      { name: "Hip Circles", sets: "2", reps: "10 each", rest: "0s", notes: "Open up the hips" },
      { name: "Leg Swings", sets: "2", reps: "10 each", rest: "0s", notes: "Front to back, side to side" },
      { name: "Cat-Cow Stretch", sets: "2", reps: "10", rest: "0s", notes: "Flow with breath" },
    ],
  },
  intermediate: {
    push: [
      { name: "Barbell Bench Press", sets: "4", reps: "8-10", rest: "90s", notes: "Arch back, drive feet into floor" },
      { name: "Military Press", sets: "4", reps: "8-10", rest: "90s", notes: "Strict form, no leg drive" },
      { name: "Dips", sets: "3", reps: "10-12", rest: "60s", notes: "Lean forward for chest, upright for triceps" },
      { name: "Cable Flyes", sets: "3", reps: "12-15", rest: "60s", notes: "Slight bend in elbows, squeeze chest" },
      { name: "Close-Grip Bench Press", sets: "3", reps: "10-12", rest: "60s", notes: "Hands shoulder-width, elbows tucked" },
      { name: "Lateral Raises", sets: "3", reps: "12-15", rest: "45s", notes: "Lead with pinkies, control descent" },
    ],
    pull: [
      { name: "Pull-ups", sets: "4", reps: "6-10", rest: "90s", notes: "Dead hang to chin over bar" },
      { name: "Barbell Row", sets: "4", reps: "8-10", rest: "90s", notes: "45-degree torso, pull to lower chest" },
      { name: "T-Bar Row", sets: "3", reps: "10-12", rest: "60s", notes: "Neutral grip, squeeze lats" },
      { name: "Chin-ups", sets: "3", reps: "8-10", rest: "60s", notes: "Supinated grip, bicep emphasis" },
      { name: "Seated Cable Row", sets: "3", reps: "10-12", rest: "60s", notes: "Pull to sternum, hold contraction" },
      { name: "Hammer Curls", sets: "3", reps: "10-12", rest: "45s", notes: "Neutral grip, brachialis focus" },
    ],
    legs: [
      { name: "Back Squat", sets: "4", reps: "6-8", rest: "120s", notes: "Below parallel, drive through heels" },
      { name: "Deadlift", sets: "4", reps: "5-6", rest: "120s", notes: "Hinge at hips, bar close to body" },
      { name: "Bulgarian Split Squat", sets: "3", reps: "10 each", rest: "60s", notes: "Rear foot elevated, vertical torso" },
      { name: "Leg Curl", sets: "3", reps: "10-12", rest: "60s", notes: "Control eccentric, squeeze at top" },
      { name: "Leg Extension", sets: "3", reps: "12-15", rest: "45s", notes: "Pause at top, squeeze quads" },
      { name: "Standing Calf Raises", sets: "4", reps: "12-15", rest: "45s", notes: "Full stretch, pause at top" },
    ],
    core: [
      { name: "Hanging Leg Raise", sets: "3", reps: "10-12", rest: "45s", notes: "Control the swing, lift with abs" },
      { name: "Ab Wheel Rollout", sets: "3", reps: "8-12", rest: "45s", notes: "Brace core, maintain tension" },
      { name: "Cable Crunch", sets: "3", reps: "12-15", rest: "45s", notes: "Crunch ribs to hips" },
      { name: "Side Plank", sets: "3", reps: "30s each", rest: "30s", notes: "Stack hips, maintain straight line" },
      { name: "Weighted Plank", sets: "3", reps: "45-60s", rest: "45s", notes: "Add plate on back for challenge" },
      { name: "Woodchops", sets: "3", reps: "12 each", rest: "45s", notes: "Rotate through core, not arms" },
    ],
    warmup: [
      { name: "Jump Rope", sets: "2", reps: "60s", rest: "0s", notes: "Light bouncing, stay on toes" },
      { name: "Bodyweight Squats", sets: "2", reps: "15", rest: "0s", notes: "Full depth, tempo controlled" },
      { name: "Band Pull-Aparts", sets: "2", reps: "15", rest: "0s", notes: "Squeeze shoulder blades" },
      { name: "World's Greatest Stretch", sets: "1", reps: "5 each", rest: "0s", notes: "Flow through each position" },
      { name: "Glute Bridges", sets: "2", reps: "10", rest: "0s", notes: "Squeeze glutes at top" },
      { name: "Arm Swings", sets: "2", reps: "20", rest: "0s", notes: "Dynamic, increasing range" },
    ],
  },
  advanced: {
    push: [
      { name: "Pause Bench Press", sets: "4", reps: "5-6", rest: "120s", notes: "2-sec pause at chest, explosive up" },
      { name: "Push Press", sets: "4", reps: "6-8", rest: "90s", notes: "Dip and drive, lock out overhead" },
      { name: "Weighted Dips", sets: "4", reps: "8-10", rest: "90s", notes: "Add weight, control descent" },
      { name: "Incline Barbell Press", sets: "4", reps: "8-10", rest: "90s", notes: "30-degree angle, touch upper chest" },
      { name: "Decline Bench Press", sets: "3", reps: "8-10", rest: "75s", notes: "Target lower chest" },
      { name: "Arnold Press", sets: "3", reps: "10-12", rest: "60s", notes: "Rotate through full range" },
    ],
    pull: [
      { name: "Weighted Pull-ups", sets: "4", reps: "6-8", rest: "120s", notes: "Add weight progressively" },
      { name: "Pendlay Row", sets: "4", reps: "5-6", rest: "90s", notes: "Dead stop each rep, explosive pull" },
      { name: "Meadows Row", sets: "3", reps: "10-12", rest: "60s", notes: "Landmine setup, great lat stretch" },
      { name: "Chest-Supported Row", sets: "3", reps: "10-12", rest: "60s", notes: "No momentum, pure back work" },
      { name: "Weighted Chin-ups", sets: "3", reps: "6-8", rest: "90s", notes: "Full range, controlled negative" },
      { name: "Barbell Curl", sets: "3", reps: "8-10", rest: "60s", notes: "Strict form, no body English" },
    ],
    legs: [
      { name: "Pause Squats", sets: "4", reps: "4-6", rest: "150s", notes: "2-sec pause in hole, drive up" },
      { name: "Deficit Deadlift", sets: "4", reps: "4-6", rest: "150s", notes: "Stand on 2-4 inch platform" },
      { name: "Front Squat", sets: "4", reps: "6-8", rest: "120s", notes: "Elbows high, upright torso" },
      { name: "Hip Thrust", sets: "4", reps: "8-10", rest: "90s", notes: "Pause at top, squeeze glutes" },
      { name: "Nordic Curl", sets: "3", reps: "6-8", rest: "90s", notes: "Control the eccentric, assist up" },
      { name: "Single-Leg RDL", sets: "3", reps: "8 each", rest: "60s", notes: "Balance and hamstring focus" },
    ],
    core: [
      { name: "Dragon Flag", sets: "3", reps: "6-8", rest: "60s", notes: "Control both phases, full tension" },
      { name: "Hanging Windshield Wipers", sets: "3", reps: "8-10", rest: "60s", notes: "Keep legs straight, rotate fully" },
      { name: "Ab Wheel (Standing)", sets: "3", reps: "6-8", rest: "60s", notes: "Full extension, maintain plank" },
      { name: "L-Sit Hold", sets: "3", reps: "20-30s", rest: "45s", notes: "Parallettes or floor" },
      { name: "Weighted Decline Sit-up", sets: "3", reps: "10-12", rest: "45s", notes: "Hold plate at chest" },
      { name: "Pallof Press (Heavy)", sets: "3", reps: "10 each", rest: "45s", notes: "Increase resistance, resist rotation" },
    ],
    warmup: [
      { name: "Rowing Machine", sets: "1", reps: "3 min", rest: "0s", notes: "Easy pace, full body warm-up" },
      { name: "Dynamic Hip Openers", sets: "2", reps: "10 each", rest: "0s", notes: "90/90 transitions, flow" },
      { name: "Shoulder Dislocates", sets: "2", reps: "10", rest: "0s", notes: "Band or PVC, overhead mobility" },
      { name: "Cossack Squat", sets: "2", reps: "8 each", rest: "0s", notes: "Side-to-side, hip mobility" },
      { name: "Spiderman Lunge w/ Reach", sets: "2", reps: "6 each", rest: "0s", notes: "Open hip, rotate and reach" },
      { name: "Light Muscle Snatch", sets: "2", reps: "8", rest: "0s", notes: "PVC or empty bar, overhead path" },
    ],
  },
  conditioning: {
    hiit: [
      { name: "Burpees", sets: "4", reps: "10", rest: "30s", notes: "Chest to floor, explosive jump" },
      { name: "Box Jumps", sets: "4", reps: "10", rest: "30s", notes: "Land soft, step down" },
      { name: "Kettlebell Swings", sets: "4", reps: "15", rest: "30s", notes: "Hip hinge, glute drive" },
      { name: "Battle Ropes", sets: "4", reps: "30s", rest: "30s", notes: "Alternating waves, stay low" },
      { name: "Sprint Intervals", sets: "6", reps: "20s", rest: "40s", notes: "Max effort each sprint" },
      { name: "Bike Sprints", sets: "8", reps: "15s", rest: "45s", notes: "All-out effort, high resistance" },
    ],
    circuits: [
      { name: "Mountain Climbers", sets: "3", reps: "20 each", rest: "15s", notes: "Quick feet, hips low" },
      { name: "Squat Jumps", sets: "3", reps: "12", rest: "15s", notes: "Depth before explosion" },
      { name: "Med Ball Slams", sets: "3", reps: "10", rest: "15s", notes: "Full extension, slam hard" },
      { name: "Renegade Rows", sets: "3", reps: "10 each", rest: "15s", notes: "Row in plank position" },
      { name: "Tuck Jumps", sets: "3", reps: "8", rest: "20s", notes: "Knees to chest, land soft" },
      { name: "Plank Shoulder Taps", sets: "3", reps: "20", rest: "15s", notes: "Minimize hip sway" },
    ],
    cardio: [
      { name: "Rowing Intervals", sets: "5", reps: "500m", rest: "60s", notes: "Consistent splits, strong finish" },
      { name: "Assault Bike", sets: "8", reps: "20s", rest: "40s", notes: "Arms and legs, max effort" },
      { name: "Sled Push", sets: "6", reps: "40m", rest: "60s", notes: "Drive through legs, stay low" },
      { name: "Farmer's Walk", sets: "4", reps: "60m", rest: "45s", notes: "Heavy weight, tall posture" },
      { name: "Jump Rope Double-Unders", sets: "5", reps: "30", rest: "30s", notes: "Wrist flicks, stay tight" },
      { name: "Stair Sprints", sets: "8", reps: "30s", rest: "45s", notes: "Quick feet, pump arms" },
    ],
    warmup: [
      { name: "Jump Rope", sets: "1", reps: "3 min", rest: "0s", notes: "Light and easy, get moving" },
      { name: "High Knees", sets: "2", reps: "30s", rest: "0s", notes: "Quick feet, drive knees" },
      { name: "Butt Kicks", sets: "2", reps: "30s", rest: "0s", notes: "Heels to glutes" },
      { name: "Inchworms", sets: "2", reps: "6", rest: "0s", notes: "Walk out to plank, walk back" },
      { name: "Lateral Shuffles", sets: "2", reps: "20m each", rest: "0s", notes: "Stay low, quick feet" },
      { name: "A-Skips", sets: "2", reps: "20m", rest: "0s", notes: "Drive knee, dorsiflex ankle" },
    ],
  },
};

// Workout split configurations
const SPLIT_CONFIGS = {
  fullbody: {
    3: ["Full Body A", "Full Body B", "Full Body C"],
    4: ["Full Body A", "Full Body B", "Full Body C", "Full Body D"],
  },
  upperlower: {
    4: ["Upper Body A", "Lower Body A", "Upper Body B", "Lower Body B"],
    5: ["Upper Body A", "Lower Body A", "Upper Body B", "Lower Body B", "Full Body"],
    6: ["Upper Body A", "Lower Body A", "Upper Body B", "Lower Body B", "Upper Body C", "Lower Body C"],
  },
  ppl: {
    3: ["Push", "Pull", "Legs"],
    5: ["Push", "Pull", "Legs", "Upper Body", "Lower Body"],
    6: ["Push A", "Pull A", "Legs A", "Push B", "Pull B", "Legs B"],
  },
  bodypart: {
    5: ["Chest & Triceps", "Back & Biceps", "Legs", "Shoulders & Arms", "Full Body"],
    6: ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core & Cardio"],
  },
};

// Week progression modifiers
const WEEK_PROGRESSIONS = [
  { title: "Foundation Phase", focusDescription: "Build movement patterns and establish baseline", setsModifier: 0, repsModifier: 0 },
  { title: "Building Phase", focusDescription: "Increase volume and work capacity", setsModifier: 1, repsModifier: 0 },
  { title: "Progression Phase", focusDescription: "Push intensity and challenge limits", setsModifier: 1, repsModifier: 2 },
  { title: "Peak Phase", focusDescription: "Test strength and consolidate gains", setsModifier: 0, repsModifier: -2 },
];

// Template-specific configurations
interface TemplateConfig {
  split: "fullbody" | "upperlower" | "ppl" | "bodypart" | "conditioning";
  workoutTypes: string[][];
}

function getTemplateConfig(templateName: string, daysPerWeek: number, categoryName: string): TemplateConfig {
  const name = templateName.toLowerCase();
  
  // Conditioning category
  if (categoryName === "Athletic Conditioning") {
    if (name.includes("hiit") || name.includes("metabolic")) {
      return { split: "conditioning", workoutTypes: Array(daysPerWeek).fill(["hiit", "circuits"]) };
    }
    if (name.includes("cardio") || name.includes("endurance")) {
      return { split: "conditioning", workoutTypes: Array(daysPerWeek).fill(["cardio", "circuits"]) };
    }
    return { split: "conditioning", workoutTypes: Array(daysPerWeek).fill(["hiit", "circuits", "cardio"]) };
  }
  
  // Full body variations
  if (name.includes("full body") || name.includes("total body") || daysPerWeek <= 3) {
    const workoutTypes = [];
    for (let i = 0; i < daysPerWeek; i++) {
      workoutTypes.push(["push", "pull", "legs", "core"]);
    }
    return { split: "fullbody", workoutTypes };
  }
  
  // Push/Pull/Legs
  if (name.includes("ppl") || name.includes("push pull") || (daysPerWeek === 6 && !name.includes("upper"))) {
    const types = ["push", "pull", "legs"];
    const workoutTypes = [];
    for (let i = 0; i < daysPerWeek; i++) {
      workoutTypes.push([types[i % 3], "core"]);
    }
    return { split: "ppl", workoutTypes };
  }
  
  // Upper/Lower
  if (name.includes("upper") || name.includes("lower") || daysPerWeek === 4) {
    const workoutTypes = [];
    for (let i = 0; i < daysPerWeek; i++) {
      if (i % 2 === 0) {
        workoutTypes.push(["push", "pull"]);
      } else {
        workoutTypes.push(["legs", "core"]);
      }
    }
    return { split: "upperlower", workoutTypes };
  }
  
  // Body part split (advanced)
  if (categoryName === "Advanced Performance" && daysPerWeek >= 5) {
    const bodyParts = [["push"], ["pull"], ["legs"], ["push", "pull"], ["legs", "core"]];
    return { split: "bodypart", workoutTypes: bodyParts.slice(0, daysPerWeek) };
  }
  
  // Default to upper/lower
  const workoutTypes = [];
  for (let i = 0; i < daysPerWeek; i++) {
    if (i % 2 === 0) {
      workoutTypes.push(["push", "pull"]);
    } else {
      workoutTypes.push(["legs", "core"]);
    }
  }
  return { split: "upperlower", workoutTypes };
}

function getDifficultyPool(difficulty: string): keyof typeof EXERCISE_POOLS {
  switch (difficulty?.toLowerCase()) {
    case "beginner": return "beginner";
    case "intermediate": return "intermediate";
    case "advanced": return "advanced";
    default: return "beginner";
  }
}

function generateExercisesForWorkout(
  pool: typeof EXERCISE_POOLS[keyof typeof EXERCISE_POOLS],
  muscleGroups: string[],
  weekNum: number,
  workoutIndex: number
): Array<{
  section_type: string;
  exercise_name: string;
  sets: string;
  reps_or_time: string;
  rest: string;
  notes: string;
  display_order: number;
}> {
  const exercises: Array<{
    section_type: string;
    exercise_name: string;
    sets: string;
    reps_or_time: string;
    rest: string;
    notes: string;
    display_order: number;
  }> = [];
  let order = 0;
  
  const progression = WEEK_PROGRESSIONS[weekNum - 1];
  
  // Add warmup exercises (2)
  const warmups = pool.warmup || EXERCISE_POOLS.beginner.warmup;
  const warmupStart = (workoutIndex * 2) % warmups.length;
  for (let i = 0; i < 2; i++) {
    const exercise = warmups[(warmupStart + i) % warmups.length];
    exercises.push({
      section_type: "warmup",
      exercise_name: exercise.name,
      sets: exercise.sets,
      reps_or_time: exercise.reps,
      rest: exercise.rest,
      notes: exercise.notes,
      display_order: order++,
    });
  }
  
  // Add main exercises (4-5 based on muscle groups)
  for (const group of muscleGroups) {
    const groupPool = (pool as Record<string, typeof warmups>)[group];
    if (!groupPool) continue;
    
    // Pick 1-2 exercises from this group
    const numExercises = muscleGroups.length <= 2 ? 2 : 1;
    const startIdx = (workoutIndex + weekNum) % groupPool.length;
    
    for (let i = 0; i < numExercises && exercises.filter(e => e.section_type === "main").length < 5; i++) {
      const exercise = groupPool[(startIdx + i) % groupPool.length];
      
      // Apply progression
      let sets = parseInt(exercise.sets) + progression.setsModifier;
      let reps = exercise.reps;
      if (reps.includes("-")) {
        const [min, max] = reps.split("-").map(r => parseInt(r));
        const newMin = Math.max(4, min + progression.repsModifier);
        const newMax = Math.max(6, max + progression.repsModifier);
        reps = `${newMin}-${newMax}`;
      } else if (!reps.includes("s") && !reps.includes("each") && !reps.includes("m")) {
        const num = parseInt(reps);
        if (!isNaN(num)) {
          reps = String(Math.max(4, num + progression.repsModifier));
        }
      }
      
      exercises.push({
        section_type: "main",
        exercise_name: exercise.name,
        sets: String(sets),
        reps_or_time: reps,
        rest: exercise.rest,
        notes: exercise.notes,
        display_order: order++,
      });
    }
  }
  
  // Add finisher/core exercise (1)
  const poolWithCore = pool as Record<string, typeof warmups>;
  const corePool = poolWithCore.core || EXERCISE_POOLS.beginner.core;
  const coreExercise = corePool[(workoutIndex + weekNum) % corePool.length];
  exercises.push({
    section_type: "finisher",
    exercise_name: coreExercise.name,
    sets: coreExercise.sets,
    reps_or_time: coreExercise.reps,
    rest: coreExercise.rest,
    notes: coreExercise.notes,
    display_order: order++,
  });
  
  return exercises;
}

function getWorkoutName(split: string, daysPerWeek: number, workoutIndex: number): string {
  const config = SPLIT_CONFIGS[split as keyof typeof SPLIT_CONFIGS];
  if (config && config[daysPerWeek as keyof typeof config]) {
    const names = config[daysPerWeek as keyof typeof config] as string[];
    return names[workoutIndex % names.length];
  }
  
  // Fallback names
  const fallbacks = ["Workout A", "Workout B", "Workout C", "Workout D", "Workout E", "Workout F"];
  return fallbacks[workoutIndex % fallbacks.length];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all templates with their categories
    const { data: templates, error: templatesError } = await supabase
      .from("program_templates")
      .select(`
        *,
        category:program_template_categories(name)
      `)
      .eq("is_active", true)
      .order("display_order");

    if (templatesError) throw templatesError;

    console.log(`Found ${templates.length} templates to populate`);

    const results = {
      populated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const template of templates) {
      try {
        // Check if template already has weeks
        const { data: existingWeeks } = await supabase
          .from("program_template_weeks")
          .select("id")
          .eq("template_id", template.id)
          .limit(1);

        if (existingWeeks && existingWeeks.length > 0) {
          console.log(`Skipping ${template.name} - already populated`);
          results.skipped++;
          continue;
        }

        const categoryName = template.category?.name || "Beginner Basics";
        const daysPerWeek = template.days_per_week || 4;
        const difficulty = template.difficulty || "beginner";
        
        const templateConfig = getTemplateConfig(template.name, daysPerWeek, categoryName);
        const exercisePool = EXERCISE_POOLS[getDifficultyPool(difficulty)];
        const workoutDayIndices = getWorkoutDayIndices(daysPerWeek);

        console.log(`Populating ${template.name}: ${daysPerWeek} days/week, ${categoryName}, ${difficulty}`);

        // Create 4 weeks
        for (let weekNum = 1; weekNum <= 4; weekNum++) {
          const progression = WEEK_PROGRESSIONS[weekNum - 1];
          
          // Create week
          const { data: week, error: weekError } = await supabase
            .from("program_template_weeks")
            .insert({
              template_id: template.id,
              week_number: weekNum,
              title: `Week ${weekNum}: ${progression.title}`,
              focus_description: progression.focusDescription,
            })
            .select()
            .single();

          if (weekError) throw weekError;

          // Create 7 days
          let workoutIndex = 0;
          for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const isWorkoutDay = workoutDayIndices.includes(dayIndex);
            const dayName = DAY_ORDER[dayIndex];
            
            const workoutName = isWorkoutDay
              ? getWorkoutName(templateConfig.split, daysPerWeek, workoutIndex)
              : "Rest Day";

            const { data: day, error: dayError } = await supabase
              .from("program_template_days")
              .insert({
                week_id: week.id,
                day_of_week: dayName,
                workout_name: workoutName,
                workout_description: isWorkoutDay
                  ? `${progression.title} - ${workoutName}`
                  : "Recovery and active rest",
                is_rest_day: !isWorkoutDay,
                display_order: dayIndex,
              })
              .select()
              .single();

            if (dayError) throw dayError;

            // Add exercises for workout days
            if (isWorkoutDay && templateConfig.workoutTypes[workoutIndex]) {
              const muscleGroups = templateConfig.workoutTypes[workoutIndex];
              const exercises = generateExercisesForWorkout(
                exercisePool,
                muscleGroups,
                weekNum,
                workoutIndex
              );

              if (exercises.length > 0) {
                const { error: exercisesError } = await supabase
                  .from("program_template_exercises")
                  .insert(
                    exercises.map((ex) => ({
                      day_id: day.id,
                      ...ex,
                    }))
                  );

                if (exercisesError) throw exercisesError;
              }

              workoutIndex++;
            }
          }
        }

        results.populated++;
        console.log(`Successfully populated ${template.name}`);

      } catch (err) {
        const error = err as Error;
        console.error(`Error populating ${template.name}:`, error.message);
        results.errors.push(`${template.name}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Populated ${results.populated} templates, skipped ${results.skipped} (already populated)`,
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
