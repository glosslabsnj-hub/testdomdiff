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

// ============================================
// DOM'S HIGH-INTENSITY EXERCISE POOLS
// 20-30+ reps, 3-5 sets, 45-60s rest, AMRAP finishers
// ============================================

const EXERCISE_POOLS = {
  beginner: {
    push: [
      { name: "Push-ups", sets: "4", reps: "20-25", rest: "60s", notes: "Chest to deck, full lockout. No resting at the top." },
      { name: "Incline Push-ups", sets: "4", reps: "25-30", rest: "60s", notes: "Hands elevated, full range. Build the foundation." },
      { name: "Diamond Push-ups", sets: "3", reps: "15-20", rest: "60s", notes: "Hands close, elbows in. Feel the tricep burn." },
      { name: "Pike Push-ups", sets: "3", reps: "15-20", rest: "60s", notes: "Hips high, head down. Shoulder burner." },
      { name: "Wide Push-ups", sets: "4", reps: "20-25", rest: "60s", notes: "Hands wide, chest focus. Control the descent." },
      { name: "Wall Push-ups", sets: "3", reps: "25-30", rest: "45s", notes: "Perfect for pre-exhaust. Don't underestimate these." },
    ],
    pull: [
      { name: "Inverted Rows", sets: "4", reps: "20-25", rest: "60s", notes: "Pull chest to bar, squeeze shoulder blades. Control every rep." },
      { name: "Australian Pull-ups", sets: "4", reps: "20-25", rest: "60s", notes: "Bodyweight rows, feet elevated for challenge. No swinging." },
      { name: "Doorframe Rows", sets: "3", reps: "20-25", rest: "60s", notes: "Use what you got. Squeeze at the top." },
      { name: "Resistance Band Rows", sets: "4", reps: "25-30", rest: "45s", notes: "High reps, constant tension. Build that back." },
      { name: "Negative Pull-ups", sets: "3", reps: "8-10", rest: "60s", notes: "Jump up, lower slow as possible. Build strength to earn full reps." },
      { name: "Towel Rows", sets: "4", reps: "20-25", rest: "60s", notes: "Grip the towel, pull hard. Prison ingenuity." },
    ],
    legs: [
      { name: "Prisoner Squats", sets: "4", reps: "25-30", rest: "60s", notes: "Hands behind head, ass to grass. No shortcuts." },
      { name: "Walking Lunges", sets: "4", reps: "20 each", rest: "60s", notes: "Stride long, knee low. The burn is where growth happens." },
      { name: "Step-ups", sets: "4", reps: "20 each", rest: "60s", notes: "Drive through the heel, full extension. Alternate legs." },
      { name: "Squat Jumps", sets: "3", reps: "15-20", rest: "60s", notes: "Explode up, land soft. Repeat until failure." },
      { name: "Reverse Lunges", sets: "4", reps: "20 each", rest: "60s", notes: "Step back, drive forward. Control the motion." },
      { name: "Wall Sits", sets: "3", reps: "45-60s", rest: "45s", notes: "Back flat, thighs parallel. Embrace the shake." },
    ],
    core: [
      { name: "Plank", sets: "3", reps: "45-60s", rest: "30s", notes: "Straight line head to heels. No sagging, no quitting." },
      { name: "Mountain Climbers", sets: "4", reps: "30 each", rest: "30s", notes: "Quick feet, hips low. Cardio and core combined." },
      { name: "Dead Bug", sets: "3", reps: "20 each", rest: "30s", notes: "Lower back pressed to floor. Control is key." },
      { name: "Flutter Kicks", sets: "3", reps: "30 each", rest: "30s", notes: "Legs straight, lower back down. Burn through it." },
      { name: "Bicycle Crunches", sets: "3", reps: "25 each", rest: "30s", notes: "Elbow to opposite knee, full rotation." },
      { name: "Leg Raises", sets: "3", reps: "20", rest: "30s", notes: "Slow on the way down. Core stays tight." },
    ],
    warmup: [
      { name: "Jumping Jacks", sets: "2", reps: "30", rest: "0s", notes: "Get the blood pumping, wake up the body." },
      { name: "Prisoner Squats", sets: "2", reps: "20", rest: "0s", notes: "Hands behind head, warm up those legs." },
      { name: "Arm Circles", sets: "2", reps: "20 each", rest: "0s", notes: "Small to big, forward then backward." },
      { name: "High Knees", sets: "2", reps: "30 each", rest: "0s", notes: "Drive those knees, pump the arms." },
      { name: "Butt Kicks", sets: "2", reps: "30 each", rest: "0s", notes: "Heels to glutes, quick feet." },
      { name: "Hip Circles", sets: "2", reps: "15 each", rest: "0s", notes: "Open up those hips, get mobile." },
    ],
  },
  intermediate: {
    push: [
      { name: "Push-ups", sets: "4", reps: "25-30", rest: "50s", notes: "Chest to deck, no resting at top. Constant tension." },
      { name: "Diamond Push-ups", sets: "4", reps: "20-25", rest: "50s", notes: "Hands together, tricep destroyer. Grind it out." },
      { name: "Decline Push-ups", sets: "4", reps: "20-25", rest: "50s", notes: "Feet elevated, upper chest focus. No breaks." },
      { name: "Archer Push-ups", sets: "3", reps: "15 each", rest: "50s", notes: "One arm extended, other does the work. Build to one-arm." },
      { name: "Pike Push-ups", sets: "4", reps: "20-25", rest: "50s", notes: "Hips high, shoulders burning. Embrace it." },
      { name: "Explosive Push-ups", sets: "3", reps: "15-20", rest: "50s", notes: "Push hard, hands leave ground. Power building." },
    ],
    pull: [
      { name: "Pull-ups", sets: "4", reps: "Max reps", rest: "60s", notes: "Dead hang to chin over bar. Whatever you've got, give it." },
      { name: "Chin-ups", sets: "4", reps: "Max reps", rest: "60s", notes: "Underhand grip, bicep emphasis. Pull until failure." },
      { name: "Inverted Rows", sets: "4", reps: "25-30", rest: "50s", notes: "Feet elevated for challenge. Squeeze at the top." },
      { name: "Wide-Grip Pull-ups", sets: "3", reps: "Max reps", rest: "60s", notes: "Hands wide, lat focus. Every rep counts." },
      { name: "Commando Pull-ups", sets: "3", reps: "10 each", rest: "50s", notes: "Alternate sides at the top. Core stays tight." },
      { name: "Towel Pull-ups", sets: "3", reps: "Max reps", rest: "60s", notes: "Grip the towel, build forearm strength. Prison style." },
    ],
    legs: [
      { name: "Prisoner Squats", sets: "4", reps: "30-35", rest: "50s", notes: "Ass to grass, hands behind head. No shortcuts, full depth." },
      { name: "Jump Squats", sets: "4", reps: "20-25", rest: "50s", notes: "Explode up, land soft, repeat. Power and endurance." },
      { name: "Bulgarian Split Squats", sets: "4", reps: "20 each", rest: "50s", notes: "Rear foot elevated. Single leg strength builder." },
      { name: "Pistol Squat Progressions", sets: "3", reps: "10-15 each", rest: "60s", notes: "Work toward the full pistol. Use assist if needed." },
      { name: "Walking Lunges", sets: "4", reps: "25 each", rest: "50s", notes: "Stride long, knee low. The legs should be screaming." },
      { name: "Box Jumps", sets: "4", reps: "15-20", rest: "50s", notes: "Step down, explode up. Build explosive power." },
    ],
    core: [
      { name: "Hanging Leg Raises", sets: "4", reps: "15-20", rest: "45s", notes: "From dead hang, legs to bar. Control the swing." },
      { name: "Plank", sets: "3", reps: "60-90s", rest: "30s", notes: "Straight line, no sagging. Mental and physical challenge." },
      { name: "V-Ups", sets: "4", reps: "20-25", rest: "30s", notes: "Hands to toes, body forms a V. Full extension." },
      { name: "Russian Twists", sets: "4", reps: "30 each", rest: "30s", notes: "Feet off ground, rotate from core. Oblique burner." },
      { name: "Hollow Body Hold", sets: "3", reps: "45-60s", rest: "30s", notes: "Lower back pressed down, arms overhead. Don't break." },
      { name: "Windshield Wipers (Floor)", sets: "3", reps: "15 each", rest: "45s", notes: "Legs together, rotate side to side. Core control." },
    ],
    warmup: [
      { name: "Burpees", sets: "2", reps: "10", rest: "0s", notes: "Chest to floor, explosive jump. Wake up the system." },
      { name: "Prisoner Squats", sets: "2", reps: "20", rest: "0s", notes: "Full depth, hands behind head. Get those legs ready." },
      { name: "Jumping Jacks", sets: "2", reps: "40", rest: "0s", notes: "Arms overhead, feet wide. Keep moving." },
      { name: "Hip Circles", sets: "2", reps: "15 each", rest: "0s", notes: "Open up the hips, prepare for battle." },
      { name: "Arm Swings", sets: "2", reps: "20", rest: "0s", notes: "Dynamic, increasing range. Loosen up." },
      { name: "High Knees", sets: "2", reps: "40 each", rest: "0s", notes: "Drive knees high, pump arms. Heart rate up." },
    ],
  },
  advanced: {
    push: [
      { name: "Push-ups", sets: "5", reps: "30-35", rest: "45s", notes: "Chest to deck, full lockout. No mercy on yourself." },
      { name: "Archer Push-ups", sets: "4", reps: "20 each", rest: "45s", notes: "One arm working, one extended. Build to one-arm." },
      { name: "One-Arm Push-up Progressions", sets: "4", reps: "10-15 each", rest: "45s", notes: "Wide stance, work toward full one-arm. Iron sharpens iron." },
      { name: "Explosive Clap Push-ups", sets: "4", reps: "15-20", rest: "45s", notes: "Explode, clap, land soft. Power building." },
      { name: "Decline Diamond Push-ups", sets: "4", reps: "25-30", rest: "45s", notes: "Feet elevated, hands close. Tricep destroyer." },
      { name: "Pseudo Planche Push-ups", sets: "4", reps: "15-20", rest: "45s", notes: "Hands by hips, lean forward. Advanced movement." },
    ],
    pull: [
      { name: "Weighted Pull-ups", sets: "5", reps: "15-20", rest: "45s", notes: "Add weight, still hit reps. No excuses." },
      { name: "Muscle-up Progressions", sets: "4", reps: "8-12", rest: "60s", notes: "Explosive pull, push over. Build to the full movement." },
      { name: "Commando Pull-ups", sets: "4", reps: "15 each", rest: "45s", notes: "Alternate sides at top. Core stays locked." },
      { name: "L-Sit Pull-ups", sets: "4", reps: "12-15", rest: "45s", notes: "Legs extended, pull to chest. Core and back." },
      { name: "Wide Pull-ups", sets: "4", reps: "20-25", rest: "45s", notes: "Hands wide, lat focus. Every rep full range." },
      { name: "Typewriter Pull-ups", sets: "3", reps: "10 each", rest: "45s", notes: "Pull up, move side to side. Control is everything." },
    ],
    legs: [
      { name: "Pistol Squats", sets: "4", reps: "15-20 each", rest: "45s", notes: "Full depth, one leg. True leg strength." },
      { name: "Jump Squats", sets: "5", reps: "25-30", rest: "45s", notes: "Explode every rep, land soft. Power endurance." },
      { name: "Shrimp Squats", sets: "4", reps: "12-15 each", rest: "45s", notes: "Hold rear foot, drop knee to ground. Advanced movement." },
      { name: "Plyometric Lunges", sets: "4", reps: "20 each", rest: "45s", notes: "Switch in the air, land soft. Explosive legs." },
      { name: "Deck Squats", sets: "4", reps: "15-20", rest: "45s", notes: "Roll back, explode forward to standing. Mobility and power." },
      { name: "Single-Leg Box Jumps", sets: "4", reps: "12 each", rest: "45s", notes: "One leg, explosive power. Step down safe." },
    ],
    core: [
      { name: "Dragon Flags", sets: "4", reps: "10-15", rest: "45s", notes: "Control both phases, full tension. No cheating." },
      { name: "Hanging Windshield Wipers", sets: "4", reps: "12 each", rest: "45s", notes: "Legs straight, rotate fully. Core control." },
      { name: "L-Sit Hold", sets: "4", reps: "30-45s", rest: "30s", notes: "Legs parallel to ground, arms locked. Don't drop." },
      { name: "Ab Wheel Rollouts", sets: "4", reps: "15-20", rest: "45s", notes: "Full extension, maintain plank. Slow and controlled." },
      { name: "Human Flag Progressions", sets: "3", reps: "10-15s each", rest: "60s", notes: "Work toward the full flag. Advanced core and obliques." },
      { name: "Planche Lean Hold", sets: "3", reps: "30-45s", rest: "45s", notes: "Lean forward, shoulders over hands. Build to full planche." },
    ],
    warmup: [
      { name: "Burpee Complex", sets: "2", reps: "15", rest: "0s", notes: "Burpee with push-up, squat jump at top. Full body activation." },
      { name: "Prisoner Squats", sets: "2", reps: "25", rest: "0s", notes: "Hands behind head, full depth. Wake up those legs." },
      { name: "Dynamic Hip Openers", sets: "2", reps: "15 each", rest: "0s", notes: "90/90 transitions, flow through positions." },
      { name: "Arm Circles to Shoulder Dislocates", sets: "2", reps: "15", rest: "0s", notes: "Band or towel, overhead mobility." },
      { name: "Spiderman Lunges", sets: "2", reps: "10 each", rest: "0s", notes: "Deep lunge, elbow to floor. Hip opener." },
      { name: "Jumping Jacks to Tuck Jumps", sets: "2", reps: "20 + 10", rest: "0s", notes: "Get the blood pumping, explosive finish." },
    ],
  },
  conditioning: {
    hiit: [
      { name: "Burpees", sets: "5", reps: "30+", rest: "30s", notes: "Chest to floor, explosive jump. Maximum effort every rep." },
      { name: "Squat Jumps", sets: "5", reps: "30+", rest: "30s", notes: "Ass to grass, explode up. Don't slow down." },
      { name: "Mountain Climbers", sets: "5", reps: "40+ each", rest: "30s", notes: "Quick feet, hips low. Sprint it out." },
      { name: "Tuck Jumps", sets: "5", reps: "25+", rest: "30s", notes: "Knees to chest, land soft. Repeat to failure." },
      { name: "Sprint in Place", sets: "5", reps: "45s", rest: "30s", notes: "Maximum speed, pump those arms. Leave nothing." },
      { name: "Jumping Lunges", sets: "5", reps: "30+ each", rest: "30s", notes: "Switch in air, land soft. Leg burner." },
    ],
    circuits: [
      { name: "Prison Cell Complex", sets: "4", reps: "5 rounds", rest: "30s", notes: "10 push-ups, 20 squats, 10 lunges each. No rest between exercises." },
      { name: "The Yard Sprint", sets: "4", reps: "3 min AMRAP", rest: "60s", notes: "10 burpees, 20 squats, 30 mountain climbers. Repeat." },
      { name: "Iron Will Circuit", sets: "4", reps: "4 rounds", rest: "30s", notes: "Max pull-ups, 20 dips, 30 squats. Push through." },
      { name: "Lockdown Ladder", sets: "3", reps: "1-10 ladder", rest: "30s", notes: "1 burpee, 1 squat, up to 10 each. Then back down." },
      { name: "Death Row", sets: "4", reps: "To failure", rest: "45s", notes: "Push-ups to failure, squats to failure, lunges to failure." },
      { name: "Solitary Confinement", sets: "3", reps: "5 min AMRAP", rest: "60s", notes: "20 each: push-ups, squats, lunges, mountain climbers." },
    ],
    cardio: [
      { name: "High Knees", sets: "5", reps: "60s", rest: "20s", notes: "Drive knees high, maximum speed. Empty the tank." },
      { name: "Jumping Jacks", sets: "5", reps: "100", rest: "20s", notes: "Arms overhead, feet wide. Keep the pace." },
      { name: "Burpee Broad Jumps", sets: "5", reps: "15-20", rest: "30s", notes: "Burpee, jump forward. Cover ground." },
      { name: "Shadow Boxing", sets: "5", reps: "60s", rest: "20s", notes: "Combinations, stay light on feet. Fight the air." },
      { name: "Stair Runs", sets: "5", reps: "10 rounds", rest: "30s", notes: "Sprint up, walk down. Repeat until done." },
      { name: "Jump Rope (Invisible)", sets: "5", reps: "100", rest: "20s", notes: "Quick feet, wrist flicks. No rope needed." },
    ],
    warmup: [
      { name: "Burpees", sets: "2", reps: "15", rest: "0s", notes: "Full body wake-up call. Chest to floor." },
      { name: "High Knees", sets: "2", reps: "40 each", rest: "0s", notes: "Quick feet, drive knees. Get the heart pumping." },
      { name: "Butt Kicks", sets: "2", reps: "40 each", rest: "0s", notes: "Heels to glutes, quick tempo." },
      { name: "Jumping Jacks", sets: "2", reps: "50", rest: "0s", notes: "Arms overhead, feet wide. Keep moving." },
      { name: "Squat to Stretch", sets: "2", reps: "15", rest: "0s", notes: "Deep squat, arms overhead. Open up." },
      { name: "Lateral Shuffles", sets: "2", reps: "20 each", rest: "0s", notes: "Stay low, quick feet. Warm up lateral movement." },
    ],
  },
};

// AMRAP Finisher pools by difficulty
const AMRAP_FINISHERS = {
  beginner: [
    { name: "AMRAP: Burpees", duration: "60 sec", notes: "As many as possible in 60 seconds. Chest to floor, explosive jump." },
    { name: "AMRAP: Push-up + Squat Combo", duration: "60 sec", notes: "Alternate 5 push-ups, 5 squats. Repeat until time." },
    { name: "AMRAP: Mountain Climbers", duration: "60 sec", notes: "Quick feet, hands planted. Go until you can't." },
    { name: "AMRAP: Jumping Jacks", duration: "60 sec", notes: "Arms overhead, feet wide. Keep pace consistent." },
    { name: "AMRAP: High Knees", duration: "60 sec", notes: "Drive knees to chest, pump arms. Don't slow down." },
    { name: "AMRAP: Bodyweight Squats", duration: "60 sec", notes: "Ass to grass, explode up. Count your reps." },
  ],
  intermediate: [
    { name: "AMRAP: Burpees + Tuck Jumps", duration: "90 sec", notes: "10 burpees, 10 tuck jumps. Repeat until time. No quitting." },
    { name: "AMRAP: Prison Cell Complex", duration: "2 min", notes: "5 push-ups, 10 squats, 5 lunges each leg. No rest between rounds." },
    { name: "AMRAP: Devil's Burpees", duration: "90 sec", notes: "Burpee with push-up at bottom, jump at top. Maximum effort." },
    { name: "AMRAP: Plank to Push-up Ladder", duration: "90 sec", notes: "1 push-up, hold plank 5 sec. 2 push-ups, hold 5 sec. Keep climbing." },
    { name: "AMRAP: Squat Jump + Lunge Combo", duration: "90 sec", notes: "5 squat jumps, 10 alternating lunges. Repeat until failure." },
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

// Workout split configurations
const SPLIT_CONFIGS = {
  fullbody: {
    3: ["Full Body Assault A", "Full Body Assault B", "Full Body Assault C"],
    4: ["Full Body Assault A", "Full Body Assault B", "Full Body Assault C", "Full Body Assault D"],
  },
  upperlower: {
    4: ["Upper Body Blitz A", "Lower Body Grind A", "Upper Body Blitz B", "Lower Body Grind B"],
    5: ["Upper Body Blitz A", "Lower Body Grind A", "Upper Body Blitz B", "Lower Body Grind B", "Full Body Assault"],
    6: ["Upper Body Blitz A", "Lower Body Grind A", "Upper Body Blitz B", "Lower Body Grind B", "Upper Body Blitz C", "Lower Body Grind C"],
  },
  ppl: {
    3: ["Push Day", "Pull Day", "Leg Day"],
    5: ["Push Day", "Pull Day", "Leg Day", "Upper Body Blitz", "Lower Body Grind"],
    6: ["Push A", "Pull A", "Legs A", "Push B", "Pull B", "Legs B"],
  },
  bodypart: {
    5: ["Chest & Triceps", "Back & Biceps", "Leg Destruction", "Shoulders & Arms", "Full Body Assault"],
    6: ["Chest Blitz", "Back Attack", "Leg Destruction", "Shoulders", "Arms Assault", "Core & Cardio"],
  },
  conditioning: {
    3: ["HIIT Assault", "Circuit Grind", "Cardio Carnage"],
    4: ["HIIT Assault A", "Circuit Grind", "Cardio Carnage", "HIIT Assault B"],
    5: ["HIIT Assault A", "Circuit Grind A", "Cardio Carnage", "HIIT Assault B", "Circuit Grind B"],
    6: ["HIIT Assault A", "Circuit Grind A", "Cardio Carnage A", "HIIT Assault B", "Circuit Grind B", "Cardio Carnage B"],
  },
};

// Week progression modifiers for Dom's style
const WEEK_PROGRESSIONS = [
  { title: "Foundation Phase", focusDescription: "Build movement patterns, establish the grind. Focus on form, push the reps.", setsModifier: 0, repsModifier: 0 },
  { title: "Building Phase", focusDescription: "Increase volume, push your limits. More sets, less rest, more burn.", setsModifier: 1, repsModifier: 5 },
  { title: "Progression Phase", focusDescription: "Maximum intensity, test your will. Push through the pain barrier.", setsModifier: 1, repsModifier: 5 },
  { title: "Peak Phase", focusDescription: "Consolidate gains, prove your strength. Leave nothing on the table.", setsModifier: 0, repsModifier: 0 },
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

function getDifficultyPool(difficulty: string, categoryName: string): keyof typeof EXERCISE_POOLS {
  // Category overrides
  if (categoryName?.includes("Athletic") || categoryName?.includes("Conditioning")) {
    return "conditioning";
  }
  if (categoryName?.includes("Advanced") || categoryName?.includes("Performance")) {
    return "advanced";
  }
  if (categoryName?.includes("Intermediate") || categoryName?.includes("Growth") || categoryName?.includes("Foundation")) {
    return "intermediate";
  }
  
  // Fallback to difficulty
  switch (difficulty?.toLowerCase()) {
    case "beginner": return "beginner";
    case "intermediate": return "intermediate";
    case "advanced": return "advanced";
    default: return "beginner";
  }
}

function getFinisherPool(difficulty: string, categoryName: string): keyof typeof AMRAP_FINISHERS {
  if (categoryName?.includes("Athletic") || categoryName?.includes("Conditioning")) {
    return "conditioning";
  }
  if (categoryName?.includes("Advanced") || categoryName?.includes("Performance")) {
    return "advanced";
  }
  if (categoryName?.includes("Intermediate") || categoryName?.includes("Growth") || categoryName?.includes("Foundation")) {
    return "intermediate";
  }
  
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
  workoutIndex: number,
  finisherPoolKey: keyof typeof AMRAP_FINISHERS
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
      
      // Apply progression - Dom's style: add reps as weeks progress
      let sets = parseInt(exercise.sets) + progression.setsModifier;
      let reps = exercise.reps;
      if (reps.includes("-")) {
        const [min, max] = reps.split("-").map(r => parseInt(r));
        const newMin = min + progression.repsModifier;
        const newMax = max + progression.repsModifier;
        reps = `${newMin}-${newMax}`;
      } else if (!reps.includes("s") && !reps.includes("each") && !reps.includes("m") && !reps.includes("+") && !reps.includes("Max")) {
        const num = parseInt(reps);
        if (!isNaN(num)) {
          reps = String(num + progression.repsModifier);
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
  
  // Add AMRAP finisher (Dom's signature style)
  const finisherPool = AMRAP_FINISHERS[finisherPoolKey];
  const finisher = finisherPool[(workoutIndex + weekNum) % finisherPool.length];
  exercises.push({
    section_type: "finisher",
    exercise_name: finisher.name,
    sets: "1",
    reps_or_time: finisher.duration,
    rest: "0s",
    notes: finisher.notes,
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
  
  // Fallback names (Dom's style)
  const fallbacks = ["Assault A", "Grind B", "Blitz C", "Destruction D", "Mayhem E", "Carnage F"];
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
        const exercisePool = EXERCISE_POOLS[getDifficultyPool(difficulty, categoryName)];
        const finisherPoolKey = getFinisherPool(difficulty, categoryName);
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
              : "Rest & Recovery";

            const { data: day, error: dayError } = await supabase
              .from("program_template_days")
              .insert({
                week_id: week.id,
                day_of_week: dayName,
                workout_name: workoutName,
                workout_description: isWorkoutDay
                  ? `${progression.title} - ${workoutName}. Leave nothing in the tank.`
                  : "Active recovery. Stretch, hydrate, prepare for battle.",
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
                workoutIndex,
                finisherPoolKey
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
        message: `Populated ${results.populated} templates with Dom's high-intensity style, skipped ${results.skipped} (already populated)`,
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
