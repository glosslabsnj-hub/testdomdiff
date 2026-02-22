import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://domdifferent.com",
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

// Prison-style workout templates by track type - ADVANCED WORKOUTS
const FAT_LOSS_WORKOUTS: WorkoutTemplates = {
  monday: { name: "Metabolic Inferno", desc: "High-volume push circuits with cardio destruction" },
  tuesday: { name: "Shred Pull", desc: "Back and biceps with metabolic conditioning" },
  wednesday: { name: "Leg Annihilation", desc: "Lower body assault for maximum calorie burn" },
  thursday: { name: "Upper Body War", desc: "Chest, shoulders, triceps with HIIT intervals" },
  friday: { name: "Conditioning Hell", desc: "Full body metabolic overload" },
  saturday: { name: "Total Destruction", desc: "No mercy circuit - everything burns" },
  sunday: { name: "Active Recovery", desc: "Light movement and stretching", isRest: true },
};

const MUSCLE_WORKOUTS: WorkoutTemplates = {
  monday: { name: "Cell Block Chest", desc: "Heavy push day - chest, shoulders, triceps" },
  tuesday: { name: "Yard Back Attack", desc: "Pull day - back and biceps volume" },
  wednesday: { name: "Prison Leg Day", desc: "Leg day - quads, hams, glutes destruction" },
  thursday: { name: "Iron Shoulders", desc: "Boulder shoulders and arm pump" },
  friday: { name: "Power Compound Day", desc: "Heavy compound movements for strength" },
  saturday: { name: "Hypertrophy Pump", desc: "High-volume accessory work" },
  sunday: { name: "Rest & Recover", desc: "Complete rest - let the muscle grow", isRest: true },
};

const RECOMP_WORKOUTS: WorkoutTemplates = {
  monday: { name: "Strength Push", desc: "Heavy push with metabolic finisher" },
  tuesday: { name: "Cardio Warfare", desc: "Pure conditioning and core assault" },
  wednesday: { name: "Strength Pull", desc: "Heavy pull with explosive work" },
  thursday: { name: "HIIT Destruction", desc: "Full body interval annihilation" },
  friday: { name: "Strength Legs", desc: "Lower body strength with conditioning" },
  saturday: { name: "Hybrid Destroyer", desc: "Strength and cardio complex" },
  sunday: { name: "Active Recovery", desc: "Mobility and light movement", isRest: true },
};

// Progressive sets/reps based on week number - Dom's high-volume style
const getProgressiveVolume = (weekNumber: number, phase: string) => {
  // Week 1-4 (Foundation): Start moderate, build base
  // Week 5-8 (Build): Increase volume significantly  
  // Week 9-12 (Peak): Maximum intensity
  
  let baseSets: number;
  let baseReps: string;
  let finisherIntensity: string;
  let restTime: string;
  
  if (phase === "foundation") {
    // Foundation phase: Build the base (weeks 1-4)
    baseSets = 4 + Math.floor((weekNumber - 1) / 2); // 4-5 sets
    baseReps = weekNumber <= 2 ? "15-20" : "18-25";
    finisherIntensity = "moderate";
    restTime = "45-60 sec";
  } else if (phase === "build") {
    // Build phase: Increase volume (weeks 5-8)
    baseSets = 5 + Math.floor((weekNumber - 5) / 2); // 5-6 sets
    baseReps = weekNumber <= 6 ? "20-25" : "25-30";
    finisherIntensity = "high";
    restTime = "30-45 sec";
  } else {
    // Peak phase: Maximum intensity (weeks 9-12)
    baseSets = 6 + Math.floor((weekNumber - 9) / 2); // 6-7 sets
    baseReps = weekNumber <= 10 ? "25-30" : "30-40";
    finisherIntensity = "extreme";
    restTime = "20-30 sec";
  }
  
  return { baseSets, baseReps, finisherIntensity, restTime };
};

// Exercise templates by section type, phase, and week
const getExercises = (trackType: string, dayType: string, phase: string, weekNumber: number = 1) => {
  const { baseSets, baseReps, finisherIntensity, restTime } = getProgressiveVolume(weekNumber, phase);
  const sets = baseSets.toString();
  const reps = baseReps;
  const rest = restTime;

  // Universal warmup - increases with phase
  const warmupReps = phase === "foundation" ? "30 sec" : phase === "build" ? "45 sec" : "60 sec";
  const warmup = [
    { name: "Jumping Jacks", sets: "2", reps: warmupReps, rest: "0", notes: "Get the blood flowing" },
    { name: "Arm Circles", sets: "2", reps: "20 each direction", rest: "0", notes: "Loosen up shoulders" },
    { name: "Bodyweight Squats", sets: "2", reps: "20", rest: "0", notes: "Warm up the legs" },
    { name: "Push-up to Downward Dog", sets: "2", reps: "15", rest: "30 sec", notes: "Full body activation" },
  ];

  // Universal cooldown
  const cooldown = [
    { name: "Standing Quad Stretch", sets: "1", reps: "45 sec each", rest: "0", notes: "Hold steady" },
    { name: "Shoulder Stretch", sets: "1", reps: "45 sec each", rest: "0", notes: "Arm across body" },
    { name: "Hip Flexor Stretch", sets: "1", reps: "45 sec each", rest: "0", notes: "Deep lunge stretch" },
    { name: "Deep Breathing", sets: "1", reps: "15 breaths", rest: "0", notes: "Calm the nervous system" },
  ];

  let main: any[] = [];
  let finisher: any[] = [];

  // Fat Loss exercises - HIGH VOLUME
  if (trackType === "fat_loss") {
    if (dayType.includes("push") || dayType.includes("inferno")) {
      main = [
        { name: "Burpees", sets, reps, rest, notes: "Explosive! Full extension at top - no shortcuts" },
        { name: "Push-ups", sets, reps, rest, notes: "Chest to floor, full lockout - every rep" },
        { name: "Mountain Climbers", sets, reps: "45 sec", rest: "20 sec", notes: "Sprint pace, drive those knees hard" },
        { name: "Diamond Push-ups", sets, reps, rest, notes: "Hands together, elbows tight to body" },
        { name: "Plank Shoulder Taps", sets, reps: "30 total", rest, notes: "Keep hips rock solid" },
        { name: "Pike Push-ups", sets, reps, rest, notes: "Shoulders on fire - embrace it" },
        { name: "Explosive Push-ups", sets: String(baseSets - 1), reps: "12-15", rest, notes: "Push hard enough to leave the ground" },
      ];
      finisher = finisherIntensity === "extreme" 
        ? [{ name: "100 Burpee Challenge", sets: "1", reps: "For time - no excuses", rest: "0", notes: "Break as needed, just FINISH. This is where champions are made." }]
        : finisherIntensity === "high"
        ? [{ name: "Burpee Ladder", sets: "1", reps: "10-1 countdown", rest: "0", notes: "Start with 10, then 9, 8... no rest between!" }]
        : [{ name: "Push-up Burnout", sets: "3", reps: "To failure", rest: "30 sec", notes: "Go until you physically cannot" }];
    } else if (dayType.includes("pull") || dayType.includes("shred")) {
      main = [
        { name: "Inverted Rows", sets, reps, rest, notes: "Pull your chest to the bar, squeeze hard" },
        { name: "Superman Holds", sets, reps: "45 sec", rest, notes: "Squeeze glutes and back - feel it burn" },
        { name: "Towel Rows", sets, reps, rest, notes: "Wrap towel around pole, pull like your life depends on it" },
        { name: "Reverse Snow Angels", sets, reps: "20", rest, notes: "Face down, arms sweep wide - back activation" },
        { name: "High Knees", sets, reps: "45 sec", rest: "15 sec", notes: "Sprint in place - maximum intensity!" },
        { name: "Plank Rows", sets, reps: "15 each side", rest, notes: "Row in plank position - core stays locked" },
        { name: "Bicep Curl Hold", sets, reps: "30 sec hold at 90 degrees", rest, notes: "The burn is the growth" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "Row + Burpee Complex", sets: "5", reps: "10 rows + 10 burpees", rest: "30 sec", notes: "No breaks between exercises" }]
        : [{ name: "Row Hold + High Knees", sets: "4", reps: "25 sec hold + 25 knees", rest: "30 sec", notes: "Superset - no break between" }];
    } else if (dayType.includes("leg") || dayType.includes("annihilation")) {
      main = [
        { name: "Jump Squats", sets, reps, rest, notes: "Explode up like a rocket, soft landing" },
        { name: "Reverse Lunges", sets, reps: "15 each leg", rest, notes: "Step back, knee kisses floor" },
        { name: "Prisoner Squats", sets, reps, rest, notes: "Hands behind head, chest up, deep squat" },
        { name: "Glute Bridges", sets, reps, rest, notes: "Squeeze glutes so hard they cramp" },
        { name: "Calf Raises", sets, reps: "30", rest: "20 sec", notes: "Full range of motion, pause at top" },
        { name: "Wall Sit", sets, reps: "60 sec", rest, notes: "Thighs parallel - your legs will shake" },
        { name: "Lateral Lunges", sets, reps: "12 each side", rest, notes: "Push hips back, feel the stretch" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "200 Air Squat Challenge", sets: "1", reps: "For time", rest: "0", notes: "Break if needed, but FINISH. Mental warfare." }]
        : [{ name: "Squat Jump Tabata", sets: "8", reps: "20 sec on, 10 sec off", rest: "0", notes: "4 minutes of pure pain = pure results" }];
    } else if (dayType.includes("upper") || dayType.includes("war")) {
      main = [
        { name: "Push-up to Renegade Row", sets, reps: "12", rest, notes: "Push-up, row left, row right = 1 rep" },
        { name: "Pike Push-ups", sets, reps, rest, notes: "Hips high, head toward floor - shoulders burning" },
        { name: "Dips (chair or bench)", sets, reps, rest, notes: "90 degree elbow bend minimum" },
        { name: "Plank Up-Downs", sets, reps: "12 each arm", rest, notes: "Forearm to hand, core stays tight" },
        { name: "Shadow Boxing", sets, reps: "90 sec", rest: "30 sec", notes: "Throw REAL punches, move your feet" },
        { name: "Diamond Push-ups", sets, reps, rest, notes: "Tricep destruction" },
        { name: "Shoulder Tap Plank", sets, reps: "40 total", rest, notes: "Hips don't move, core braced" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "Push-up Death Ladder", sets: "1", reps: "1-10-1 pyramid", rest: "0", notes: "1 push-up, 2, 3...10...9, 8...1. No rest." }]
        : [{ name: "Push-up EMOM", sets: "10", reps: "10 push-ups per minute", rest: "remaining", notes: "10 minutes, start of every minute" }];
    } else if (dayType.includes("conditioning") || dayType.includes("hell")) {
      main = [
        { name: "Burpees", sets, reps: "15", rest: "30 sec", notes: "Full extension, full push-up, no cheating" },
        { name: "Mountain Climbers", sets, reps: "60 sec", rest: "20 sec", notes: "Sprint pace or go home" },
        { name: "Jump Squats", sets, reps, rest: "30 sec", notes: "Max height every rep" },
        { name: "High Knees", sets, reps: "60 sec", rest: "20 sec", notes: "Drive those knees to your chest" },
        { name: "Plank Jacks", sets, reps: "30", rest, notes: "Core stays locked, legs move fast" },
        { name: "Tuck Jumps", sets, reps: "15", rest, notes: "Knees to chest every jump" },
        { name: "Box Jumps or Step-ups", sets, reps: "20", rest, notes: "Use stairs if no box - explosive" },
      ];
      finisher = [{ name: "Tabata Hell", sets: "8", reps: "20 sec burpees, 10 sec rest", rest: "0", notes: "4 minutes that will define you" }];
    } else { // full body / destruction
      main = [
        { name: "Burpee Box Jump", sets, reps: "12", rest, notes: "Burpee into jump onto step/box" },
        { name: "Walkout Push-ups", sets, reps: "12", rest, notes: "Walk hands out, push-up, walk back" },
        { name: "Squat Thrusters", sets, reps, rest, notes: "Squat, explode up with arms overhead" },
        { name: "Plank Jacks", sets, reps: "25", rest, notes: "Jumping jacks in plank position" },
        { name: "Broad Jumps", sets, reps: "12", rest, notes: "Maximum distance each jump" },
        { name: "V-Ups", sets, reps: "20", rest, notes: "Touch toes at top, control the negative" },
        { name: "Bear Crawls", sets, reps: "40 yards", rest, notes: "Forward and backward" },
        { name: "Burpee Pull-ups", sets: String(baseSets - 1), reps: "10", rest, notes: "Burpee into pull-up if available" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "The Chipper", sets: "1", reps: "100 squats, 80 lunges, 60 push-ups, 40 burpees, 20 pull-ups", rest: "0", notes: "For time. Welcome to the yard." }]
        : [{ name: "Death by Burpees", sets: "1", reps: "EMOM - add 1 each minute", rest: "0", notes: "Minute 1 = 1 burpee, minute 2 = 2... until failure" }];
    }
  }
  // Muscle Building exercises - HIGH VOLUME
  else if (trackType === "muscle") {
    if (dayType.includes("chest") || dayType.includes("push")) {
      main = [
        { name: "Wide Push-ups", sets, reps, rest, notes: "Hands wider than shoulders, squeeze chest hard" },
        { name: "Close-Grip Push-ups", sets, reps, rest, notes: "Hands under chest, tricep focus" },
        { name: "Decline Push-ups", sets, reps, rest, notes: "Feet elevated, more chest activation" },
        { name: "Dumbbell Floor Press", sets, reps, rest, notes: "Control the weight, squeeze at top" },
        { name: "Pike Push-ups", sets, reps, rest, notes: "Shoulder builder - feel the burn" },
        { name: "Tricep Dips", sets, reps, rest, notes: "Deep stretch, full lockout" },
        { name: "Archer Push-ups", sets: String(baseSets - 1), reps: "10 each side", rest, notes: "One arm does the work" },
        { name: "Push-up Hold", sets: "3", reps: "30 sec at bottom position", rest, notes: "Time under tension" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "200 Push-up Challenge", sets: "1", reps: "For time", rest: "0", notes: "Any variation, just finish. Chest will be destroyed." }]
        : [{ name: "Push-up Drop Set", sets: "1", reps: "Wide to close to knees - failure each", rest: "0", notes: "No rest - go to failure on each variation" }];
    } else if (dayType.includes("back") || dayType.includes("pull") || dayType.includes("yard")) {
      main = [
        { name: "Pull-ups or Inverted Rows", sets, reps, rest, notes: "Full stretch, squeeze lats at top" },
        { name: "Dumbbell Rows", sets, reps: "15 each", rest, notes: "Pull to hip, squeeze lats hard" },
        { name: "Face Pulls (band or towel)", sets, reps, rest, notes: "Pull to face, external rotation" },
        { name: "Superman Pulses", sets, reps: "25", rest, notes: "Small pulses, constant tension" },
        { name: "Bicep Curls", sets, reps, rest, notes: "Slow negative, squeeze at top" },
        { name: "Hammer Curls", sets, reps, rest, notes: "Neutral grip, brachialis focus" },
        { name: "Reverse Grip Rows", sets, reps: "12", rest, notes: "Underhand grip, bicep emphasis" },
        { name: "Isometric Row Hold", sets: "3", reps: "30 sec at top", rest, notes: "Hold the squeeze" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "Pull-up Ladder", sets: "1", reps: "1-10-1 pyramid", rest: "0", notes: "1, 2, 3...10...9, 8...1. No rest between." }]
        : [{ name: "21s Curl Finisher", sets: "3", reps: "7+7+7", rest: "45 sec", notes: "7 bottom half, 7 top half, 7 full" }];
    } else if (dayType.includes("leg") || dayType.includes("prison")) {
      main = [
        { name: "Goblet Squats", sets, reps, rest, notes: "Hold weight at chest, deep squat" },
        { name: "Bulgarian Split Squats", sets, reps: "12 each", rest, notes: "Rear foot elevated, control descent" },
        { name: "Romanian Deadlifts", sets, reps, rest, notes: "Hinge at hips, feel hamstrings stretch deep" },
        { name: "Walking Lunges", sets, reps: "15 each", rest, notes: "Big steps, knee kisses floor" },
        { name: "Calf Raises", sets, reps: "30", rest: "30 sec", notes: "Pause at top, full stretch at bottom" },
        { name: "Glute Bridges", sets, reps, rest, notes: "Pause and squeeze 3 sec at top" },
        { name: "Single Leg RDL", sets, reps: "10 each", rest, notes: "Balance and hamstring stretch" },
        { name: "Squat Hold", sets: "3", reps: "45 sec at parallel", rest, notes: "Thighs burning = growth" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "300 Rep Leg Destroyer", sets: "1", reps: "100 squats, 100 lunges, 100 calf raises", rest: "0", notes: "For time. You will walk funny tomorrow." }]
        : [{ name: "Wall Sit Challenge", sets: "4", reps: "60 sec hold", rest: "30 sec", notes: "Thighs parallel, back flat on wall" }];
    } else if (dayType.includes("shoulder") || dayType.includes("arm") || dayType.includes("iron")) {
      main = [
        { name: "Pike Push-ups", sets, reps, rest, notes: "Feet elevated for more challenge" },
        { name: "Lateral Raises", sets, reps, rest, notes: "Control the weight, slight bend in elbow" },
        { name: "Front Raises", sets, reps, rest, notes: "Alternate arms, core tight" },
        { name: "Arnold Press", sets, reps, rest, notes: "Rotate from curl to press" },
        { name: "Skull Crushers", sets, reps, rest, notes: "Keep elbows fixed, extend fully" },
        { name: "Diamond Push-ups", sets, reps, rest, notes: "Tricep finisher" },
        { name: "Rear Delt Flyes", sets, reps, rest, notes: "Bent over, squeeze shoulder blades" },
        { name: "Tricep Dip Hold", sets: "3", reps: "30 sec at bottom", rest, notes: "Deep stretch, feel it" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "Shoulder Annihilator", sets: "1", reps: "50 pike push-ups + 50 lateral raises", rest: "0", notes: "For time. Shoulders will be on fire." }]
        : [{ name: "Shoulder Burnout", sets: "1", reps: "15 each direction lateral raise", rest: "0", notes: "Front, side, rear - no rest" }];
    } else if (dayType.includes("power") || dayType.includes("compound")) {
      main = [
        { name: "Dumbbell Thrusters", sets, reps: "12", rest: "60 sec", notes: "Squat to press - one fluid motion" },
        { name: "Renegade Rows", sets, reps: "10 each", rest, notes: "Push-up position, row each side" },
        { name: "Devil Press", sets, reps: "10", rest: "60 sec", notes: "Burpee with dumbbell snatch" },
        { name: "Goblet Squats", sets, reps, rest, notes: "Heavy and controlled" },
        { name: "Floor Press", sets, reps, rest, notes: "Pause at bottom, explode up" },
        { name: "Man Makers", sets: String(baseSets - 1), reps: "8", rest: "60 sec", notes: "Row, push-up, squat, press = 1 rep" },
        { name: "Dumbbell Cleans", sets, reps: "12", rest, notes: "Explosive hip drive" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "Complex of Death", sets: "5", reps: "5 cleans, 5 presses, 5 squats, 5 rows", rest: "60 sec", notes: "Don't put the weights down" }]
        : [{ name: "Farmer Carry", sets: "4", reps: "60 yard walk", rest: "45 sec", notes: "Heavy as possible, grip tight" }];
    } else { // pump session / hypertrophy
      main = [
        { name: "Push-up Variations", sets, reps: "12 each type", rest, notes: "Wide, regular, diamond, pike" },
        { name: "Curl 21s", sets, reps: "21 total", rest, notes: "7 bottom, 7 top, 7 full" },
        { name: "Tricep Extensions", sets, reps: "20", rest, notes: "Squeeze at full extension" },
        { name: "Lateral Raise Drop Set", sets, reps: "12+12+12", rest, notes: "Drop weight twice, no rest" },
        { name: "Plank Hold", sets, reps: "60 sec", rest, notes: "Tight core, don't sag" },
        { name: "Bicep Curl Hold", sets: "3", reps: "30 sec at 90 degrees", rest, notes: "The burn is the growth" },
        { name: "Tricep Dips", sets, reps, rest, notes: "Full depth, full lockout" },
        { name: "Face Pulls", sets, reps, rest, notes: "External rotation at top" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "The Pump Destroyer", sets: "1", reps: "100 push-ups, 100 curls, 100 dips", rest: "0", notes: "For time. This is where champions are forged." }]
        : [{ name: "100 Push-up Challenge", sets: "1", reps: "For time", rest: "0", notes: "Any variation, just finish" }];
    }
  }
  // Recomposition exercises - HIGH VOLUME
  else {
    if (dayType.includes("push")) {
      main = [
        { name: "Push-ups", sets, reps: "15", rest: "45 sec", notes: "Controlled tempo, feel every rep" },
        { name: "Dumbbell Floor Press", sets, reps, rest, notes: "Heavy, pause at bottom" },
        { name: "Pike Push-ups", sets, reps, rest, notes: "Shoulder focus, deep stretch" },
        { name: "Burpees", sets, reps: "12", rest, notes: "Explosive power meets endurance" },
        { name: "Dips", sets, reps, rest, notes: "Full depth, no shortcuts" },
        { name: "Diamond Push-ups", sets, reps, rest, notes: "Tricep destruction" },
        { name: "Explosive Push-ups", sets: String(baseSets - 1), reps: "10", rest, notes: "Leave the ground" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "Push-up + Burpee Complex", sets: "5", reps: "20 push-ups + 10 burpees", rest: "45 sec", notes: "No rest between exercises" }]
        : [{ name: "Push-up AMRAP", sets: "3", reps: "60 sec max reps", rest: "60 sec", notes: "Go until failure, count your reps" }];
    } else if (dayType.includes("conditioning") || dayType.includes("cardio") || dayType.includes("warfare")) {
      main = [
        { name: "Burpees", sets, reps: "15", rest: "30 sec", notes: "Full extension every rep - no cheating" },
        { name: "Mountain Climbers", sets, reps: "60 sec", rest: "20 sec", notes: "Sprint pace, not jog pace" },
        { name: "Jump Squats", sets, reps: "18", rest: "30 sec", notes: "Explode up, soft landing" },
        { name: "High Knees", sets, reps: "60 sec", rest: "20 sec", notes: "Drive those knees to your chest" },
        { name: "Plank Jacks", sets, reps: "30", rest: "30 sec", notes: "Core stays locked" },
        { name: "Box Jumps or Step-ups", sets, reps: "20", rest, notes: "Use stairs if no box - be explosive" },
        { name: "Bear Crawls", sets, reps: "40 yards", rest, notes: "Forward and backward" },
        { name: "Tuck Jumps", sets, reps: "15", rest, notes: "Knees to chest every jump" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "The Destroyer", sets: "1", reps: "50 burpees for time", rest: "0", notes: "Break if needed. Just finish. This is war." }]
        : [{ name: "Tabata Burpees", sets: "8", reps: "20 sec on, 10 off", rest: "0", notes: "4 minutes of pure conditioning" }];
    } else if (dayType.includes("pull")) {
      main = [
        { name: "Pull-ups or Inverted Rows", sets, reps, rest, notes: "Full range, squeeze at top" },
        { name: "Dumbbell Rows", sets, reps: "12 each", rest, notes: "Heavy, squeeze lats" },
        { name: "Superman Holds", sets, reps: "45 sec", rest, notes: "Constant tension, feel the back" },
        { name: "Explosive Rows", sets, reps: "10", rest, notes: "Fast pull, slow lower" },
        { name: "Bicep Curls", sets, reps, rest, notes: "Strict form, slow negatives" },
        { name: "Reverse Grip Rows", sets, reps: "12", rest, notes: "Underhand grip, bicep emphasis" },
        { name: "Face Pulls", sets, reps, rest, notes: "External rotation at top" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "Row + Jump Complex", sets: "5", reps: "15 rows + 15 jumps", rest: "45 sec", notes: "No rest between exercises" }]
        : [{ name: "Row + Jump Complex", sets: "4", reps: "12 rows + 12 jumps", rest: "45 sec", notes: "Strength meets power" }];
    } else if (dayType.includes("hiit") || dayType.includes("circuit") || dayType.includes("destruction")) {
      main = [
        { name: "Devil Press", sets, reps: "10", rest, notes: "Burpee + dumbbell snatch - brutal" },
        { name: "Thrusters", sets, reps: "12", rest, notes: "Squat to press, one motion" },
        { name: "Renegade Rows", sets, reps: "10 each", rest, notes: "Plank row, core locked" },
        { name: "Jump Lunges", sets, reps: "12 each", rest, notes: "Explosive switch" },
        { name: "Plank Up-Downs", sets, reps: "12 each arm", rest, notes: "Stay tight" },
        { name: "Mountain Climbers", sets, reps: "45 sec", rest: "20 sec", notes: "Sprint pace" },
        { name: "Burpee Pull-ups", sets: String(baseSets - 1), reps: "8", rest, notes: "Burpee into pull-up" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "The Crucible", sets: "1", reps: "21-15-9 of burpees, thrusters, pull-ups", rest: "0", notes: "For time. You will earn this." }]
        : [{ name: "EMOM Burpees", sets: "10", reps: "6 burpees per minute", rest: "remaining time", notes: "10 minute challenge" }];
    } else if (dayType.includes("leg")) {
      main = [
        { name: "Goblet Squats", sets, reps, rest, notes: "Deep, controlled, feel every rep" },
        { name: "Romanian Deadlifts", sets, reps: "12", rest, notes: "Feel the hamstring stretch" },
        { name: "Jump Squats", sets, reps: "15", rest, notes: "Explosive power" },
        { name: "Bulgarian Split Squats", sets, reps: "12 each", rest, notes: "Balance and strength" },
        { name: "Calf Raises", sets, reps: "25", rest: "20 sec", notes: "Full ROM, pause at top" },
        { name: "Walking Lunges", sets, reps: "15 each", rest, notes: "Big steps" },
        { name: "Wall Sit", sets, reps: "60 sec", rest, notes: "Thighs parallel, embrace the burn" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "Leg Destruction", sets: "1", reps: "50 squats, 50 lunges, 50 jump squats", rest: "0", notes: "For time. Legs will be jelly." }]
        : [{ name: "Squat Hold + Jumps", sets: "4", reps: "40 sec hold + 15 jumps", rest: "45 sec", notes: "Burn then explode" }];
    } else { // hybrid / destroyer
      main = [
        { name: "Thrusters", sets, reps: "12", rest, notes: "Full body power" },
        { name: "Burpee Pull-ups", sets, reps: "10", rest: "60 sec", notes: "Burpee into pull-up if possible" },
        { name: "Dumbbell Complex", sets, reps: "6 each movement", rest: "60 sec", notes: "Row, clean, press, squat - no drop" },
        { name: "Mountain Climbers", sets, reps: "45 sec", rest: "30 sec", notes: "Sprint pace" },
        { name: "Plank Hold", sets, reps: "60 sec", rest: "30 sec", notes: "Core control" },
        { name: "Devil Press", sets, reps: "10", rest, notes: "The ultimate hybrid exercise" },
        { name: "Jump Lunges", sets, reps: "12 each", rest, notes: "Explosive power" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "The Chipper", sets: "1", reps: "75 squats, 50 push-ups, 40 lunges, 30 burpees, 20 pull-ups", rest: "0", notes: "For time - no stopping. This is your test." }]
        : [{ name: "Mini Chipper", sets: "1", reps: "50 squats, 40 push-ups, 30 lunges, 20 burpees, 10 pull-ups", rest: "0", notes: "For time - no stopping" }];
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

    // Parse request body for options
    const { forceRefresh = false } = await req.json().catch(() => ({}));

    // If forceRefresh, clear all existing exercises and day workouts
    if (forceRefresh) {
      console.log("Force refresh: Clearing existing exercises and day workouts...");
      
      // Delete all exercises first (due to foreign key)
      const { error: delExError } = await supabase
        .from("program_day_exercises")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all
      
      if (delExError) {
        console.error("Error deleting exercises:", delExError);
      }
      
      // Delete all day workouts
      const { error: delDayError } = await supabase
        .from("program_day_workouts")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all
      
      if (delDayError) {
        console.error("Error deleting day workouts:", delDayError);
      }
      
      console.log("Cleared existing data, regenerating with progressive volume...");
    }

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

        // Get exercises for this day - pass week number for progressive volume
        const exercises = getExercises(trackType, template.name.toLowerCase(), week.phase, week.week_number);
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
        message: `Created ${totalDayWorkouts} day workouts and ${totalExercises} exercises with progressive volume`,
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
