import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

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
    { name: "Jumping Jacks", sets: "2", reps: warmupReps, rest: "0", notes: "Get the blood flowing", muscles_targeted: "Full body, cardiovascular system", form_tips: "Land softly, keep arms fully extended overhead each rep", scaling_options: "Easier: step-out jacks. Harder: star jumps" },
    { name: "Arm Circles", sets: "2", reps: "20 each direction", rest: "0", notes: "Loosen up shoulders", muscles_targeted: "Shoulders, rotator cuff, upper back", form_tips: "Start small, gradually increase circle size. Keep core engaged", scaling_options: "Easier: smaller circles. Harder: hold light weights" },
    { name: "Bodyweight Squats", sets: "2", reps: "20", rest: "0", notes: "Warm up the legs", muscles_targeted: "Quads, glutes, hamstrings", form_tips: "Keep chest up, knees tracking over toes, full depth", scaling_options: "Easier: half squats or chair squats. Harder: pause at bottom" },
    { name: "Push-up to Downward Dog", sets: "2", reps: "15", rest: "30 sec", notes: "Full body activation", muscles_targeted: "Chest, shoulders, hamstrings, calves", form_tips: "Press hips high in downward dog, heels toward floor", scaling_options: "Easier: from knees. Harder: add a push-up hold at bottom" },
  ];

  // Universal cooldown
  const cooldown = [
    { name: "Standing Quad Stretch", sets: "1", reps: "45 sec each", rest: "0", notes: "Hold steady", muscles_targeted: "Quads, hip flexors", form_tips: "Keep knees together, pull heel to glute gently", scaling_options: "Easier: hold wall for balance. Harder: add a forward lean" },
    { name: "Shoulder Stretch", sets: "1", reps: "45 sec each", rest: "0", notes: "Arm across body", muscles_targeted: "Rear deltoids, upper back", form_tips: "Pull arm across chest at shoulder height, don't shrug", scaling_options: "Easier: gentle pressure. Harder: doorway stretch" },
    { name: "Hip Flexor Stretch", sets: "1", reps: "45 sec each", rest: "0", notes: "Deep lunge stretch", muscles_targeted: "Hip flexors, psoas, quads", form_tips: "Keep back straight, squeeze glute of trailing leg", scaling_options: "Easier: shorter stance. Harder: raise arm overhead on same side" },
    { name: "Deep Breathing", sets: "1", reps: "15 breaths", rest: "0", notes: "Calm the nervous system", muscles_targeted: "Diaphragm, intercostals", form_tips: "Inhale 4 seconds through nose, exhale 6 seconds through mouth", scaling_options: "Easier: seated position. Harder: add box breathing (4-4-4-4)" },
  ];

  let main: any[] = [];
  let finisher: any[] = [];

  // Fat Loss exercises - HIGH VOLUME
  if (trackType === "fat_loss") {
    if (dayType.includes("push") || dayType.includes("inferno")) {
      main = [
        { name: "Burpees", sets, reps, rest, notes: "Explosive! Full extension at top - no shortcuts", muscles_targeted: "Full body, cardiovascular system", form_tips: "Full extension at top, chest to floor on push-up, explosive jump", scaling_options: "Easier: step-back burpees. Harder: burpee box jumps" },
        { name: "Push-ups", sets, reps, rest, notes: "Chest to floor, full lockout - every rep", muscles_targeted: "Chest, triceps, anterior deltoids", form_tips: "Keep core tight, elbows at 45 degrees, full range of motion", scaling_options: "Easier: knee push-ups or incline. Harder: decline or weighted" },
        { name: "Mountain Climbers", sets, reps: "45 sec", rest: "20 sec", notes: "Sprint pace, drive those knees hard", muscles_targeted: "Core, hip flexors, shoulders, cardiovascular system", form_tips: "Keep hips level with shoulders, drive knees toward chest rapidly", scaling_options: "Easier: slow tempo step-ins. Harder: cross-body mountain climbers" },
        { name: "Diamond Push-ups", sets, reps, rest, notes: "Hands together, elbows tight to body", muscles_targeted: "Triceps, inner chest, anterior deltoids", form_tips: "Form a diamond with thumbs and index fingers, keep elbows close to ribs", scaling_options: "Easier: from knees. Harder: elevate feet on bench" },
        { name: "Plank Shoulder Taps", sets, reps: "30 total", rest, notes: "Keep hips rock solid", muscles_targeted: "Core, shoulders, obliques", form_tips: "Widen feet for stability, tap opposite shoulder without rotating hips", scaling_options: "Easier: from knees. Harder: add a push-up between taps" },
        { name: "Pike Push-ups", sets, reps, rest, notes: "Shoulders on fire - embrace it", muscles_targeted: "Anterior deltoids, triceps, upper chest", form_tips: "Hips high in inverted V, lower head between hands, press back up", scaling_options: "Easier: reduce range of motion. Harder: elevate feet for handstand push-up progression" },
        { name: "Explosive Push-ups", sets: String(baseSets - 1), reps: "12-15", rest, notes: "Push hard enough to leave the ground", muscles_targeted: "Chest, triceps, fast-twitch muscle fibers", form_tips: "Lower controlled, explode up so hands leave the ground, land soft", scaling_options: "Easier: explosive from knees. Harder: clap push-ups" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "100 Burpee Challenge", sets: "1", reps: "For time - no excuses", rest: "0", notes: "Break as needed, just FINISH. This is where champions are made.", muscles_targeted: "Full body, cardiovascular system", form_tips: "Maintain form even when fatigued - chest to floor, full jump at top", scaling_options: "Easier: step-back burpees, aim for 50. Harder: add a tuck jump at top" }]
        : finisherIntensity === "high"
        ? [{ name: "Burpee Ladder", sets: "1", reps: "10-1 countdown", rest: "0", notes: "Start with 10, then 9, 8... no rest between!", muscles_targeted: "Full body, cardiovascular system", form_tips: "Keep form tight on each rep, full extension at top", scaling_options: "Easier: 5-1 ladder with step-backs. Harder: 15-1 ladder" }]
        : [{ name: "Push-up Burnout", sets: "3", reps: "To failure", rest: "30 sec", notes: "Go until you physically cannot", muscles_targeted: "Chest, triceps, anterior deltoids", form_tips: "Maintain full range of motion until form breaks, then stop", scaling_options: "Easier: from knees to failure. Harder: deficit push-ups to failure" }];
    } else if (dayType.includes("pull") || dayType.includes("shred")) {
      main = [
        { name: "Inverted Rows", sets, reps, rest, notes: "Pull your chest to the bar, squeeze hard", muscles_targeted: "Upper back, lats, rear deltoids, biceps", form_tips: "Keep body straight like a plank, pull chest to bar and squeeze shoulder blades", scaling_options: "Easier: bend knees, walk feet closer. Harder: elevate feet" },
        { name: "Superman Holds", sets, reps: "45 sec", rest, notes: "Squeeze glutes and back - feel it burn", muscles_targeted: "Erector spinae, glutes, rear deltoids", form_tips: "Lift arms and legs simultaneously, hold at top with constant tension", scaling_options: "Easier: alternate arms and legs. Harder: add small pulses at top" },
        { name: "Towel Rows", sets, reps, rest, notes: "Wrap towel around pole, pull like your life depends on it", muscles_targeted: "Lats, biceps, forearms, grip strength", form_tips: "Lean back with straight body, pull chest toward anchor point", scaling_options: "Easier: stand more upright. Harder: lean further back or single-arm" },
        { name: "Reverse Snow Angels", sets, reps: "20", rest, notes: "Face down, arms sweep wide - back activation", muscles_targeted: "Rear deltoids, rhomboids, lower traps", form_tips: "Lie face down, sweep arms from hips to overhead keeping them off the floor", scaling_options: "Easier: smaller range of motion. Harder: hold light weights" },
        { name: "High Knees", sets, reps: "45 sec", rest: "15 sec", notes: "Sprint in place - maximum intensity!", muscles_targeted: "Hip flexors, quads, cardiovascular system", form_tips: "Drive knees above hip height, pump arms, stay on balls of feet", scaling_options: "Easier: marching in place. Harder: add resistance band around feet" },
        { name: "Plank Rows", sets, reps: "15 each side", rest, notes: "Row in plank position - core stays locked", muscles_targeted: "Lats, core, obliques, biceps", form_tips: "Widen feet for stability, row elbow past torso, minimize hip rotation", scaling_options: "Easier: from knees. Harder: add a push-up between rows" },
        { name: "Bicep Curl Hold", sets, reps: "30 sec hold at 90 degrees", rest, notes: "The burn is the growth", muscles_targeted: "Biceps, forearms, brachialis", form_tips: "Hold arms at 90 degrees with palms up, keep elbows pinned to sides", scaling_options: "Easier: lighter weight or shorter hold. Harder: heavier weight or slow pulse" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "Row + Burpee Complex", sets: "5", reps: "10 rows + 10 burpees", rest: "30 sec", notes: "No breaks between exercises", muscles_targeted: "Full body, lats, cardiovascular system", form_tips: "Maintain row form even when fatigued, full burpee extension", scaling_options: "Easier: 3 rounds of 8+8. Harder: 5 rounds of 12+12" }]
        : [{ name: "Row Hold + High Knees", sets: "4", reps: "25 sec hold + 25 knees", rest: "30 sec", notes: "Superset - no break between", muscles_targeted: "Back, biceps, hip flexors, cardiovascular system", form_tips: "Hold row at top position, transition immediately to high knees", scaling_options: "Easier: 15 sec hold + 15 knees. Harder: 35 sec hold + 35 knees" }];
    } else if (dayType.includes("leg") || dayType.includes("annihilation")) {
      main = [
        { name: "Jump Squats", sets, reps, rest, notes: "Explode up like a rocket, soft landing", muscles_targeted: "Quads, glutes, calves, cardiovascular system", form_tips: "Sit back into squat, explode upward, land softly with bent knees", scaling_options: "Easier: regular bodyweight squats. Harder: tuck jump squats" },
        { name: "Reverse Lunges", sets, reps: "15 each leg", rest, notes: "Step back, knee kisses floor", muscles_targeted: "Quads, glutes, hamstrings", form_tips: "Step back far enough for 90-degree angles at both knees, keep torso upright", scaling_options: "Easier: hold wall for balance. Harder: add jump switch between legs" },
        { name: "Prisoner Squats", sets, reps, rest, notes: "Hands behind head, chest up, deep squat", muscles_targeted: "Quads, glutes, core, upper back", form_tips: "Hands interlocked behind head, elbows wide, chest proud, squat below parallel", scaling_options: "Easier: regular bodyweight squats. Harder: add a 3-second pause at bottom" },
        { name: "Glute Bridges", sets, reps, rest, notes: "Squeeze glutes so hard they cramp", muscles_targeted: "Glutes, hamstrings, lower back", form_tips: "Drive through heels, squeeze glutes at top for 2 seconds, control the descent", scaling_options: "Easier: shorter range of motion. Harder: single-leg glute bridges" },
        { name: "Calf Raises", sets, reps: "30", rest: "20 sec", notes: "Full range of motion, pause at top", muscles_targeted: "Gastrocnemius, soleus", form_tips: "Rise to full tiptoe, pause 1 second at top, lower slowly past flat", scaling_options: "Easier: bilateral flat ground. Harder: single-leg on a step edge" },
        { name: "Wall Sit", sets, reps: "60 sec", rest, notes: "Thighs parallel - your legs will shake", muscles_targeted: "Quads, glutes, core", form_tips: "Back flat on wall, thighs parallel to floor, knees at 90 degrees", scaling_options: "Easier: higher position or shorter hold. Harder: hold a weight on your lap" },
        { name: "Lateral Lunges", sets, reps: "12 each side", rest, notes: "Push hips back, feel the stretch", muscles_targeted: "Adductors, glutes, quads", form_tips: "Step wide to the side, push hips back, keep trailing leg straight", scaling_options: "Easier: smaller step. Harder: add a pulse at the bottom" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "200 Air Squat Challenge", sets: "1", reps: "For time", rest: "0", notes: "Break if needed, but FINISH. Mental warfare.", muscles_targeted: "Quads, glutes, hamstrings, cardiovascular endurance", form_tips: "Maintain depth and form throughout - no half reps count", scaling_options: "Easier: 100 air squats. Harder: 200 jump squats" }]
        : [{ name: "Squat Jump Tabata", sets: "8", reps: "20 sec on, 10 sec off", rest: "0", notes: "4 minutes of pure pain = pure results", muscles_targeted: "Quads, glutes, calves, cardiovascular system", form_tips: "Max reps in 20 seconds, full depth squat, full jump extension", scaling_options: "Easier: regular squat tabata. Harder: tuck jump tabata" }];
    } else if (dayType.includes("upper") || dayType.includes("war")) {
      main = [
        { name: "Push-up to Renegade Row", sets, reps: "12", rest, notes: "Push-up, row left, row right = 1 rep", muscles_targeted: "Chest, lats, core, biceps, triceps", form_tips: "Do a full push-up, then row each arm without rotating hips", scaling_options: "Easier: skip push-up, rows only. Harder: add heavier dumbbells" },
        { name: "Pike Push-ups", sets, reps, rest, notes: "Hips high, head toward floor - shoulders burning", muscles_targeted: "Anterior deltoids, triceps, upper chest", form_tips: "Hips high in inverted V, lower head between hands, press back up", scaling_options: "Easier: reduce range of motion. Harder: elevate feet on bench" },
        { name: "Dips (chair or bench)", sets, reps, rest, notes: "90 degree elbow bend minimum", muscles_targeted: "Triceps, chest, anterior deltoids", form_tips: "Lower until elbows hit 90 degrees, press to full lockout, keep shoulders down", scaling_options: "Easier: bend knees, feet closer. Harder: extend legs straight or elevate feet" },
        { name: "Plank Up-Downs", sets, reps: "12 each arm", rest, notes: "Forearm to hand, core stays tight", muscles_targeted: "Core, triceps, shoulders, chest", form_tips: "Alternate leading arm each rep, minimize hip sway", scaling_options: "Easier: from knees. Harder: add a push-up at the top" },
        { name: "Shadow Boxing", sets, reps: "90 sec", rest: "30 sec", notes: "Throw REAL punches, move your feet", muscles_targeted: "Shoulders, core, cardiovascular system", form_tips: "Rotate hips with each punch, keep hands up, stay light on feet", scaling_options: "Easier: slower tempo, fewer combinations. Harder: hold light weights or add sprawls" },
        { name: "Diamond Push-ups", sets, reps, rest, notes: "Tricep destruction", muscles_targeted: "Triceps, inner chest, anterior deltoids", form_tips: "Form a diamond with thumbs and index fingers, keep elbows close to ribs", scaling_options: "Easier: from knees. Harder: elevate feet on bench" },
        { name: "Shoulder Tap Plank", sets, reps: "40 total", rest, notes: "Hips don't move, core braced", muscles_targeted: "Core, shoulders, obliques", form_tips: "Widen feet for stability, tap opposite shoulder without rotating hips", scaling_options: "Easier: from knees or wider stance. Harder: narrow feet or add a push-up" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "Push-up Death Ladder", sets: "1", reps: "1-10-1 pyramid", rest: "0", notes: "1 push-up, 2, 3...10...9, 8...1. No rest.", muscles_targeted: "Chest, triceps, shoulders, core", form_tips: "Maintain strict form throughout - full chest to floor, full lockout", scaling_options: "Easier: 1-5-1 pyramid from knees. Harder: 1-15-1 pyramid" }]
        : [{ name: "Push-up EMOM", sets: "10", reps: "10 push-ups per minute", rest: "remaining", notes: "10 minutes, start of every minute", muscles_targeted: "Chest, triceps, shoulders, core", form_tips: "Complete 10 quality push-ups, rest remaining time in the minute", scaling_options: "Easier: 5 push-ups per minute. Harder: 15 push-ups per minute" }];
    } else if (dayType.includes("conditioning") || dayType.includes("hell")) {
      main = [
        { name: "Burpees", sets, reps: "15", rest: "30 sec", notes: "Full extension, full push-up, no cheating", muscles_targeted: "Full body, cardiovascular system", form_tips: "Full extension at top, chest to floor on push-up, explosive jump", scaling_options: "Easier: step-back burpees. Harder: burpee box jumps" },
        { name: "Mountain Climbers", sets, reps: "60 sec", rest: "20 sec", notes: "Sprint pace or go home", muscles_targeted: "Core, hip flexors, shoulders, cardiovascular system", form_tips: "Keep hips level with shoulders, drive knees toward chest rapidly", scaling_options: "Easier: slow tempo step-ins. Harder: cross-body mountain climbers" },
        { name: "Jump Squats", sets, reps, rest: "30 sec", notes: "Max height every rep", muscles_targeted: "Quads, glutes, calves, cardiovascular system", form_tips: "Sit back into squat, explode upward, land softly with bent knees", scaling_options: "Easier: regular bodyweight squats. Harder: tuck jump squats" },
        { name: "High Knees", sets, reps: "60 sec", rest: "20 sec", notes: "Drive those knees to your chest", muscles_targeted: "Hip flexors, quads, cardiovascular system", form_tips: "Drive knees above hip height, pump arms, stay on balls of feet", scaling_options: "Easier: marching in place. Harder: add resistance band around feet" },
        { name: "Plank Jacks", sets, reps: "30", rest, notes: "Core stays locked, legs move fast", muscles_targeted: "Core, shoulders, inner and outer thighs", form_tips: "Jump feet wide and back in while maintaining straight plank position", scaling_options: "Easier: step feet out one at a time. Harder: add a push-up between jacks" },
        { name: "Tuck Jumps", sets, reps: "15", rest, notes: "Knees to chest every jump", muscles_targeted: "Quads, glutes, calves, core", form_tips: "Drive knees to chest at peak of jump, land softly on balls of feet", scaling_options: "Easier: jump squats without tuck. Harder: consecutive with no pause" },
        { name: "Box Jumps or Step-ups", sets, reps: "20", rest, notes: "Use stairs if no box - explosive", muscles_targeted: "Quads, glutes, calves, hip flexors", form_tips: "Swing arms for momentum, land softly with both feet on box, stand tall", scaling_options: "Easier: step-ups on lower surface. Harder: higher box or single-leg" },
      ];
      finisher = [{ name: "Tabata Hell", sets: "8", reps: "20 sec burpees, 10 sec rest", rest: "0", notes: "4 minutes that will define you", muscles_targeted: "Full body, cardiovascular system", form_tips: "Max effort for 20 seconds, full burpee form, recover in 10 seconds", scaling_options: "Easier: step-back burpees or squat thrusts. Harder: burpee tuck jumps" }];
    } else { // full body / destruction
      main = [
        { name: "Burpee Box Jump", sets, reps: "12", rest, notes: "Burpee into jump onto step/box", muscles_targeted: "Full body, quads, glutes, cardiovascular system", form_tips: "Complete full burpee, then immediately jump onto box with both feet", scaling_options: "Easier: burpee + step-up. Harder: higher box or add a tuck jump" },
        { name: "Walkout Push-ups", sets, reps: "12", rest, notes: "Walk hands out, push-up, walk back", muscles_targeted: "Chest, shoulders, core, hamstrings", form_tips: "Hinge at hips, walk hands to plank, do push-up, walk hands back to stand", scaling_options: "Easier: skip the push-up. Harder: add 2 push-ups per walkout" },
        { name: "Squat Thrusters", sets, reps, rest, notes: "Squat, explode up with arms overhead", muscles_targeted: "Quads, glutes, shoulders, cardiovascular system", form_tips: "Full depth squat, drive through heels, press arms overhead in one fluid motion", scaling_options: "Easier: squat to calf raise. Harder: add dumbbells" },
        { name: "Plank Jacks", sets, reps: "25", rest, notes: "Jumping jacks in plank position", muscles_targeted: "Core, shoulders, inner and outer thighs", form_tips: "Jump feet wide and back in while maintaining straight plank position", scaling_options: "Easier: step feet out one at a time. Harder: add a push-up between jacks" },
        { name: "Broad Jumps", sets, reps: "12", rest, notes: "Maximum distance each jump", muscles_targeted: "Quads, glutes, hamstrings, calves", form_tips: "Swing arms back then forward, explode off both feet, land softly", scaling_options: "Easier: shorter distance jumps. Harder: add a burpee between jumps" },
        { name: "V-Ups", sets, reps: "20", rest, notes: "Touch toes at top, control the negative", muscles_targeted: "Upper and lower abs, hip flexors", form_tips: "Simultaneously lift legs and torso, touch toes at top, lower with control", scaling_options: "Easier: tuck crunches. Harder: weighted V-ups" },
        { name: "Bear Crawls", sets, reps: "40 yards", rest, notes: "Forward and backward", muscles_targeted: "Shoulders, core, quads, hip flexors", form_tips: "Keep knees 1 inch off ground, opposite hand and foot move together", scaling_options: "Easier: shorter distance. Harder: add lateral bear crawl or band resistance" },
        { name: "Burpee Pull-ups", sets: String(baseSets - 1), reps: "10", rest, notes: "Burpee into pull-up if available", muscles_targeted: "Full body, lats, biceps, cardiovascular system", form_tips: "Complete full burpee under bar, jump into pull-up, control the descent", scaling_options: "Easier: burpee + jumping pull-up. Harder: burpee + muscle-up" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "The Chipper", sets: "1", reps: "100 squats, 80 lunges, 60 push-ups, 40 burpees, 20 pull-ups", rest: "0", notes: "For time. Welcome to the yard.", muscles_targeted: "Full body, cardiovascular endurance", form_tips: "Pace yourself early, maintain form throughout, break into manageable sets", scaling_options: "Easier: halve all reps. Harder: add a 400m run between movements" }]
        : [{ name: "Death by Burpees", sets: "1", reps: "EMOM - add 1 each minute", rest: "0", notes: "Minute 1 = 1 burpee, minute 2 = 2... until failure", muscles_targeted: "Full body, cardiovascular system", form_tips: "Full burpee each rep, pace early minutes, fight through later rounds", scaling_options: "Easier: death by squats. Harder: death by burpee box jumps" }];
    }
  }
  // Muscle Building exercises - HIGH VOLUME
  else if (trackType === "muscle") {
    if (dayType.includes("chest") || dayType.includes("push")) {
      main = [
        { name: "Wide Push-ups", sets, reps, rest, notes: "Hands wider than shoulders, squeeze chest hard", muscles_targeted: "Outer chest, anterior deltoids, triceps", form_tips: "Hands 1.5x shoulder width, lower chest to floor, squeeze pecs at top", scaling_options: "Easier: from knees. Harder: add a pause at the bottom" },
        { name: "Close-Grip Push-ups", sets, reps, rest, notes: "Hands under chest, tricep focus", muscles_targeted: "Triceps, inner chest, anterior deltoids", form_tips: "Hands directly under chest, elbows tight to body, full lockout", scaling_options: "Easier: from knees. Harder: elevate feet" },
        { name: "Decline Push-ups", sets, reps, rest, notes: "Feet elevated, more chest activation", muscles_targeted: "Upper chest, anterior deltoids, triceps", form_tips: "Feet on bench or step, maintain straight body line, lower chest to floor", scaling_options: "Easier: lower elevation. Harder: higher elevation or add weight vest" },
        { name: "Dumbbell Floor Press", sets, reps, rest, notes: "Control the weight, squeeze at top", muscles_targeted: "Chest, triceps, anterior deltoids", form_tips: "Lie on floor, press dumbbells up, squeeze chest at top, lower until triceps touch floor", scaling_options: "Easier: lighter weight. Harder: single-arm floor press" },
        { name: "Pike Push-ups", sets, reps, rest, notes: "Shoulder builder - feel the burn", muscles_targeted: "Anterior deltoids, triceps, upper chest", form_tips: "Hips high in inverted V, lower head between hands, press back up", scaling_options: "Easier: reduce range of motion. Harder: elevate feet for handstand push-up progression" },
        { name: "Tricep Dips", sets, reps, rest, notes: "Deep stretch, full lockout", muscles_targeted: "Triceps, chest, anterior deltoids", form_tips: "Lower until elbows hit 90 degrees, press to full lockout, keep shoulders down", scaling_options: "Easier: bend knees, feet closer. Harder: extend legs straight or elevate feet" },
        { name: "Archer Push-ups", sets: String(baseSets - 1), reps: "10 each side", rest, notes: "One arm does the work", muscles_targeted: "Chest, triceps, core, shoulder stabilizers", form_tips: "Extend one arm to the side, lower body toward working arm, press back up", scaling_options: "Easier: partial range of motion. Harder: one-arm push-up negatives" },
        { name: "Push-up Hold", sets: "3", reps: "30 sec at bottom position", rest, notes: "Time under tension", muscles_targeted: "Chest, triceps, anterior deltoids, core", form_tips: "Lower to 1 inch off the floor and hold, keep entire body tight", scaling_options: "Easier: hold from knees or shorter time. Harder: 45+ second hold" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "200 Push-up Challenge", sets: "1", reps: "For time", rest: "0", notes: "Any variation, just finish. Chest will be destroyed.", muscles_targeted: "Chest, triceps, shoulders, core", form_tips: "Switch between variations as needed, maintain full range of motion", scaling_options: "Easier: 100 push-ups. Harder: strict form only, no knee push-ups allowed" }]
        : [{ name: "Push-up Drop Set", sets: "1", reps: "Wide to close to knees - failure each", rest: "0", notes: "No rest - go to failure on each variation", muscles_targeted: "Chest, triceps, anterior deltoids", form_tips: "Go to true failure on wide, immediately switch to close, then knees", scaling_options: "Easier: stop at 2 variations. Harder: add decline before wide" }];
    } else if (dayType.includes("back") || dayType.includes("pull") || dayType.includes("yard")) {
      main = [
        { name: "Pull-ups or Inverted Rows", sets, reps, rest, notes: "Full stretch, squeeze lats at top", muscles_targeted: "Lats, biceps, rear deltoids, rhomboids", form_tips: "Full dead hang at bottom, pull until chin clears bar, squeeze lats", scaling_options: "Easier: inverted rows or band-assisted pull-ups. Harder: weighted pull-ups" },
        { name: "Dumbbell Rows", sets, reps: "15 each", rest, notes: "Pull to hip, squeeze lats hard", muscles_targeted: "Lats, rhomboids, biceps, rear deltoids", form_tips: "Hinge at hips, pull dumbbell to hip, squeeze shoulder blade at top", scaling_options: "Easier: lighter weight. Harder: pause 2 seconds at top" },
        { name: "Face Pulls (band or towel)", sets, reps, rest, notes: "Pull to face, external rotation", muscles_targeted: "Rear deltoids, rhomboids, rotator cuff", form_tips: "Pull band to face level, externally rotate hands at end, squeeze shoulder blades", scaling_options: "Easier: lighter band. Harder: heavier band with slow eccentric" },
        { name: "Superman Pulses", sets, reps: "25", rest, notes: "Small pulses, constant tension", muscles_targeted: "Erector spinae, glutes, rear deltoids", form_tips: "Hold arms and legs off floor, perform small up-and-down pulses", scaling_options: "Easier: arms only or legs only. Harder: hold a light weight" },
        { name: "Bicep Curls", sets, reps, rest, notes: "Slow negative, squeeze at top", muscles_targeted: "Biceps, brachialis, forearms", form_tips: "Keep elbows pinned to sides, curl up with control, 3-second negative", scaling_options: "Easier: lighter weight. Harder: add a 2-second squeeze at top" },
        { name: "Hammer Curls", sets, reps, rest, notes: "Neutral grip, brachialis focus", muscles_targeted: "Brachialis, brachioradialis, biceps", form_tips: "Palms face each other, curl without rotating wrists, slow negative", scaling_options: "Easier: lighter weight or alternating arms. Harder: cross-body hammer curls" },
        { name: "Reverse Grip Rows", sets, reps: "12", rest, notes: "Underhand grip, bicep emphasis", muscles_targeted: "Lower lats, biceps, rhomboids", form_tips: "Underhand grip shoulder width, pull to lower chest, squeeze at top", scaling_options: "Easier: lighter weight. Harder: pause at top for 2 seconds" },
        { name: "Isometric Row Hold", sets: "3", reps: "30 sec at top", rest, notes: "Hold the squeeze", muscles_targeted: "Lats, rhomboids, biceps, rear deltoids", form_tips: "Pull to top of row position and hold with shoulder blades squeezed", scaling_options: "Easier: shorter hold time. Harder: heavier weight or 45+ second hold" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "Pull-up Ladder", sets: "1", reps: "1-10-1 pyramid", rest: "0", notes: "1, 2, 3...10...9, 8...1. No rest between.", muscles_targeted: "Lats, biceps, forearms, grip strength", form_tips: "Full dead hang each rep, chin over bar, no kipping", scaling_options: "Easier: 1-5-1 with inverted rows. Harder: 1-12-1 or weighted" }]
        : [{ name: "21s Curl Finisher", sets: "3", reps: "7+7+7", rest: "45 sec", notes: "7 bottom half, 7 top half, 7 full", muscles_targeted: "Biceps, brachialis, forearms", form_tips: "7 reps from bottom to 90 degrees, 7 from 90 to top, 7 full range", scaling_options: "Easier: lighter weight. Harder: heavier weight or add a 4th set" }];
    } else if (dayType.includes("leg") || dayType.includes("prison")) {
      main = [
        { name: "Goblet Squats", sets, reps, rest, notes: "Hold weight at chest, deep squat", muscles_targeted: "Quads, glutes, core, upper back", form_tips: "Hold weight at chest, elbows inside knees at bottom, drive through heels", scaling_options: "Easier: bodyweight squats. Harder: heavier weight or add a pause at bottom" },
        { name: "Bulgarian Split Squats", sets, reps: "12 each", rest, notes: "Rear foot elevated, control descent", muscles_targeted: "Quads, glutes, hip flexors, balance", form_tips: "Rear foot on bench, lower until front thigh is parallel, keep torso upright", scaling_options: "Easier: regular split squats on floor. Harder: add dumbbells or deficit" },
        { name: "Romanian Deadlifts", sets, reps, rest, notes: "Hinge at hips, feel hamstrings stretch deep", muscles_targeted: "Hamstrings, glutes, erector spinae", form_tips: "Soft knee bend, hinge at hips, push hips back, feel deep hamstring stretch", scaling_options: "Easier: lighter weight or bodyweight good mornings. Harder: single-leg RDL" },
        { name: "Walking Lunges", sets, reps: "15 each", rest, notes: "Big steps, knee kisses floor", muscles_targeted: "Quads, glutes, hamstrings, balance", form_tips: "Long stride, back knee lightly touches floor, push through front heel", scaling_options: "Easier: stationary lunges. Harder: add dumbbells or overhead lunges" },
        { name: "Calf Raises", sets, reps: "30", rest: "30 sec", notes: "Pause at top, full stretch at bottom", muscles_targeted: "Gastrocnemius, soleus", form_tips: "Rise to full tiptoe, pause 1 second at top, lower slowly past flat", scaling_options: "Easier: bilateral flat ground. Harder: single-leg on a step edge" },
        { name: "Glute Bridges", sets, reps, rest, notes: "Pause and squeeze 3 sec at top", muscles_targeted: "Glutes, hamstrings, lower back", form_tips: "Drive through heels, squeeze glutes at top for 3 seconds, control descent", scaling_options: "Easier: shorter hold. Harder: single-leg glute bridges" },
        { name: "Single Leg RDL", sets, reps: "10 each", rest, notes: "Balance and hamstring stretch", muscles_targeted: "Hamstrings, glutes, balance, core", form_tips: "Hinge at hips on one leg, reach toward floor, keep back flat", scaling_options: "Easier: hold wall for balance. Harder: add dumbbell in opposite hand" },
        { name: "Squat Hold", sets: "3", reps: "45 sec at parallel", rest, notes: "Thighs burning = growth", muscles_targeted: "Quads, glutes, core, mental toughness", form_tips: "Thighs parallel to floor, back straight, weight in heels", scaling_options: "Easier: higher position or shorter hold. Harder: hold dumbbells or single-leg" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "300 Rep Leg Destroyer", sets: "1", reps: "100 squats, 100 lunges, 100 calf raises", rest: "0", notes: "For time. You will walk funny tomorrow.", muscles_targeted: "Quads, glutes, hamstrings, calves", form_tips: "Maintain full range of motion, break into manageable sets", scaling_options: "Easier: 50-50-50. Harder: add jump squats and jump lunges" }]
        : [{ name: "Wall Sit Challenge", sets: "4", reps: "60 sec hold", rest: "30 sec", notes: "Thighs parallel, back flat on wall", muscles_targeted: "Quads, glutes, core", form_tips: "Back flat on wall, thighs parallel to floor, knees at 90 degrees", scaling_options: "Easier: higher angle or shorter holds. Harder: hold a weight on your lap" }];
    } else if (dayType.includes("shoulder") || dayType.includes("arm") || dayType.includes("iron")) {
      main = [
        { name: "Pike Push-ups", sets, reps, rest, notes: "Feet elevated for more challenge", muscles_targeted: "Anterior deltoids, triceps, upper chest", form_tips: "Hips high, elevate feet on bench for added difficulty, head between hands", scaling_options: "Easier: pike on floor. Harder: deficit pike push-ups or wall handstand push-ups" },
        { name: "Lateral Raises", sets, reps, rest, notes: "Control the weight, slight bend in elbow", muscles_targeted: "Lateral deltoids, upper traps", form_tips: "Slight elbow bend, raise to shoulder height, control the descent", scaling_options: "Easier: lighter weight. Harder: pause at top for 2 seconds" },
        { name: "Front Raises", sets, reps, rest, notes: "Alternate arms, core tight", muscles_targeted: "Anterior deltoids, upper chest", form_tips: "Raise to eye level with straight arms, alternate sides, no swinging", scaling_options: "Easier: lighter weight. Harder: both arms simultaneously" },
        { name: "Arnold Press", sets, reps, rest, notes: "Rotate from curl to press", muscles_targeted: "All three deltoid heads, triceps", form_tips: "Start palms facing you, rotate outward as you press up, reverse on way down", scaling_options: "Easier: lighter weight or seated. Harder: standing with heavier weight" },
        { name: "Skull Crushers", sets, reps, rest, notes: "Keep elbows fixed, extend fully", muscles_targeted: "Triceps (all three heads)", form_tips: "Keep elbows pointing up, lower weight toward forehead, extend fully", scaling_options: "Easier: lighter weight. Harder: close-grip floor press superset" },
        { name: "Diamond Push-ups", sets, reps, rest, notes: "Tricep finisher", muscles_targeted: "Triceps, inner chest, anterior deltoids", form_tips: "Form diamond with thumbs and index fingers, elbows close to ribs", scaling_options: "Easier: from knees. Harder: elevate feet on bench" },
        { name: "Rear Delt Flyes", sets, reps, rest, notes: "Bent over, squeeze shoulder blades", muscles_targeted: "Rear deltoids, rhomboids, middle traps", form_tips: "Hinge at hips, arms slightly bent, squeeze shoulder blades at top", scaling_options: "Easier: lighter weight. Harder: add a 2-second hold at contraction" },
        { name: "Tricep Dip Hold", sets: "3", reps: "30 sec at bottom", rest, notes: "Deep stretch, feel it", muscles_targeted: "Triceps, chest, anterior deltoids", form_tips: "Lower to deepest comfortable position and hold, keep shoulders down", scaling_options: "Easier: higher position or shorter hold. Harder: legs straight, 45+ seconds" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "Shoulder Annihilator", sets: "1", reps: "50 pike push-ups + 50 lateral raises", rest: "0", notes: "For time. Shoulders will be on fire.", muscles_targeted: "All three deltoid heads, triceps", form_tips: "Break into sets as needed, maintain form even when exhausted", scaling_options: "Easier: 25+25. Harder: 50 pike push-ups + 50 lateral + 50 front raises" }]
        : [{ name: "Shoulder Burnout", sets: "1", reps: "15 each direction lateral raise", rest: "0", notes: "Front, side, rear - no rest", muscles_targeted: "Anterior, lateral, and rear deltoids", form_tips: "15 front raises, 15 lateral raises, 15 rear flyes - no dropping weight", scaling_options: "Easier: 10 each direction. Harder: 20 each direction" }];
    } else if (dayType.includes("power") || dayType.includes("compound")) {
      main = [
        { name: "Dumbbell Thrusters", sets, reps: "12", rest: "60 sec", notes: "Squat to press - one fluid motion", muscles_targeted: "Quads, glutes, shoulders, triceps, core", form_tips: "Deep squat with dumbbells at shoulders, drive up and press overhead in one motion", scaling_options: "Easier: lighter weight or squat and press separately. Harder: heavier dumbbells" },
        { name: "Renegade Rows", sets, reps: "10 each", rest, notes: "Push-up position, row each side", muscles_targeted: "Lats, core, biceps, chest, anti-rotation", form_tips: "Wide feet for stability, row one dumbbell while bracing core, minimize hip rotation", scaling_options: "Easier: row from knees. Harder: add a push-up between rows" },
        { name: "Devil Press", sets, reps: "10", rest: "60 sec", notes: "Burpee with dumbbell snatch", muscles_targeted: "Full body, shoulders, hips, cardiovascular system", form_tips: "Burpee with hands on dumbbells, swing dumbbells overhead in one motion", scaling_options: "Easier: lighter weight or burpee + separate press. Harder: heavier dumbbells" },
        { name: "Goblet Squats", sets, reps, rest, notes: "Heavy and controlled", muscles_targeted: "Quads, glutes, core, upper back", form_tips: "Hold weight at chest, elbows inside knees at bottom, drive through heels", scaling_options: "Easier: bodyweight squats. Harder: heavier weight or add a pause at bottom" },
        { name: "Floor Press", sets, reps, rest, notes: "Pause at bottom, explode up", muscles_targeted: "Chest, triceps, anterior deltoids", form_tips: "Lie on floor, lower until triceps touch floor, pause, then press explosively", scaling_options: "Easier: lighter weight. Harder: single-arm floor press" },
        { name: "Man Makers", sets: String(baseSets - 1), reps: "8", rest: "60 sec", notes: "Row, push-up, squat, press = 1 rep", muscles_targeted: "Full body - every major muscle group", form_tips: "Plank row each side, push-up, jump feet to hands, clean and press = 1 rep", scaling_options: "Easier: lighter weight, skip push-up. Harder: heavier weight or add a burpee" },
        { name: "Dumbbell Cleans", sets, reps: "12", rest, notes: "Explosive hip drive", muscles_targeted: "Hamstrings, glutes, traps, forearms", form_tips: "Hinge at hips, explosively extend hips to drive weight to shoulders", scaling_options: "Easier: lighter weight. Harder: single-arm cleans or clean and press" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "Complex of Death", sets: "5", reps: "5 cleans, 5 presses, 5 squats, 5 rows", rest: "60 sec", notes: "Don't put the weights down", muscles_targeted: "Full body - every major muscle group", form_tips: "Flow between movements without dropping dumbbells, maintain form throughout", scaling_options: "Easier: 3 rounds of 3 each. Harder: 7 rounds of 7 each" }]
        : [{ name: "Farmer Carry", sets: "4", reps: "60 yard walk", rest: "45 sec", notes: "Heavy as possible, grip tight", muscles_targeted: "Forearms, traps, core, total body stability", form_tips: "Shoulders back and down, tight core, walk tall with heavy weights", scaling_options: "Easier: lighter weight or shorter distance. Harder: heavier weight or single-arm carry" }];
    } else { // pump session / hypertrophy
      main = [
        { name: "Push-up Variations", sets, reps: "12 each type", rest, notes: "Wide, regular, diamond, pike", muscles_targeted: "Chest, triceps, shoulders - varied emphasis", form_tips: "12 reps of each variation back to back, maintain strict form on all", scaling_options: "Easier: from knees. Harder: add decline and archer variations" },
        { name: "Curl 21s", sets, reps: "21 total", rest, notes: "7 bottom, 7 top, 7 full", muscles_targeted: "Biceps, brachialis, forearms", form_tips: "7 reps from bottom to 90 degrees, 7 from 90 to top, 7 full range", scaling_options: "Easier: lighter weight. Harder: heavier weight or add a 4th set" },
        { name: "Tricep Extensions", sets, reps: "20", rest, notes: "Squeeze at full extension", muscles_targeted: "Triceps (long head emphasis)", form_tips: "Keep elbows close to head, extend fully, squeeze triceps at top", scaling_options: "Easier: lighter weight. Harder: slow 3-second negatives" },
        { name: "Lateral Raise Drop Set", sets, reps: "12+12+12", rest, notes: "Drop weight twice, no rest", muscles_targeted: "Lateral deltoids, upper traps", form_tips: "Start heavy for 12, drop weight 20% for 12 more, drop again for final 12", scaling_options: "Easier: 2 drops instead of 3. Harder: start with 15 reps each drop" },
        { name: "Plank Hold", sets, reps: "60 sec", rest, notes: "Tight core, don't sag", muscles_targeted: "Core, shoulders, glutes", form_tips: "Forearms on floor, body straight from head to heels, squeeze glutes and abs", scaling_options: "Easier: from knees or shorter time. Harder: weighted or 90+ seconds" },
        { name: "Bicep Curl Hold", sets: "3", reps: "30 sec at 90 degrees", rest, notes: "The burn is the growth", muscles_targeted: "Biceps, forearms, brachialis", form_tips: "Hold arms at 90 degrees with palms up, keep elbows pinned to sides", scaling_options: "Easier: lighter weight or shorter hold. Harder: heavier weight or slow pulse" },
        { name: "Tricep Dips", sets, reps, rest, notes: "Full depth, full lockout", muscles_targeted: "Triceps, chest, anterior deltoids", form_tips: "Lower until elbows hit 90 degrees, press to full lockout, keep shoulders down", scaling_options: "Easier: bend knees, feet closer. Harder: extend legs straight or elevate feet" },
        { name: "Face Pulls", sets, reps, rest, notes: "External rotation at top", muscles_targeted: "Rear deltoids, rhomboids, rotator cuff", form_tips: "Pull band to face level, externally rotate hands at end, squeeze shoulder blades", scaling_options: "Easier: lighter band. Harder: heavier band with slow eccentric" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "The Pump Destroyer", sets: "1", reps: "100 push-ups, 100 curls, 100 dips", rest: "0", notes: "For time. This is where champions are forged.", muscles_targeted: "Chest, biceps, triceps, shoulders", form_tips: "Break into sets as needed, maintain form - quality over speed", scaling_options: "Easier: 50 of each. Harder: add 100 lateral raises" }]
        : [{ name: "100 Push-up Challenge", sets: "1", reps: "For time", rest: "0", notes: "Any variation, just finish", muscles_targeted: "Chest, triceps, shoulders, core", form_tips: "Mix variations as needed, full range of motion on every rep", scaling_options: "Easier: 50 push-ups. Harder: strict form only, no knee push-ups" }];
    }
  }
  // Recomposition exercises - HIGH VOLUME
  else {
    if (dayType.includes("push")) {
      main = [
        { name: "Push-ups", sets, reps: "15", rest: "45 sec", notes: "Controlled tempo, feel every rep", muscles_targeted: "Chest, triceps, anterior deltoids", form_tips: "Keep core tight, elbows at 45 degrees, full range of motion", scaling_options: "Easier: knee push-ups or incline. Harder: decline or weighted" },
        { name: "Dumbbell Floor Press", sets, reps, rest, notes: "Heavy, pause at bottom", muscles_targeted: "Chest, triceps, anterior deltoids", form_tips: "Lie on floor, press dumbbells up, pause when triceps touch floor", scaling_options: "Easier: lighter weight. Harder: single-arm floor press" },
        { name: "Pike Push-ups", sets, reps, rest, notes: "Shoulder focus, deep stretch", muscles_targeted: "Anterior deltoids, triceps, upper chest", form_tips: "Hips high in inverted V, lower head between hands, press back up", scaling_options: "Easier: reduce range of motion. Harder: elevate feet for more difficulty" },
        { name: "Burpees", sets, reps: "12", rest, notes: "Explosive power meets endurance", muscles_targeted: "Full body, cardiovascular system", form_tips: "Full extension at top, chest to floor on push-up, explosive jump", scaling_options: "Easier: step-back burpees. Harder: burpee box jumps" },
        { name: "Dips", sets, reps, rest, notes: "Full depth, no shortcuts", muscles_targeted: "Triceps, chest, anterior deltoids", form_tips: "Lower until elbows hit 90 degrees, press to full lockout, keep shoulders down", scaling_options: "Easier: bend knees, feet closer. Harder: extend legs straight or elevate feet" },
        { name: "Diamond Push-ups", sets, reps, rest, notes: "Tricep destruction", muscles_targeted: "Triceps, inner chest, anterior deltoids", form_tips: "Form a diamond with thumbs and index fingers, keep elbows close to ribs", scaling_options: "Easier: from knees. Harder: elevate feet on bench" },
        { name: "Explosive Push-ups", sets: String(baseSets - 1), reps: "10", rest, notes: "Leave the ground", muscles_targeted: "Chest, triceps, fast-twitch muscle fibers", form_tips: "Lower controlled, explode up so hands leave the ground, land soft", scaling_options: "Easier: explosive from knees. Harder: clap push-ups" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "Push-up + Burpee Complex", sets: "5", reps: "20 push-ups + 10 burpees", rest: "45 sec", notes: "No rest between exercises", muscles_targeted: "Chest, triceps, shoulders, full body", form_tips: "Complete all push-ups then immediately into burpees, rest between rounds", scaling_options: "Easier: 10 push-ups + 5 burpees. Harder: 25 push-ups + 15 burpees" }]
        : [{ name: "Push-up AMRAP", sets: "3", reps: "60 sec max reps", rest: "60 sec", notes: "Go until failure, count your reps", muscles_targeted: "Chest, triceps, shoulders, core", form_tips: "Max quality reps in 60 seconds, full range of motion counts only", scaling_options: "Easier: from knees. Harder: deficit push-ups or weighted" }];
    } else if (dayType.includes("conditioning") || dayType.includes("cardio") || dayType.includes("warfare")) {
      main = [
        { name: "Burpees", sets, reps: "15", rest: "30 sec", notes: "Full extension every rep - no cheating", muscles_targeted: "Full body, cardiovascular system", form_tips: "Full extension at top, chest to floor on push-up, explosive jump", scaling_options: "Easier: step-back burpees. Harder: burpee box jumps" },
        { name: "Mountain Climbers", sets, reps: "60 sec", rest: "20 sec", notes: "Sprint pace, not jog pace", muscles_targeted: "Core, hip flexors, shoulders, cardiovascular system", form_tips: "Keep hips level with shoulders, drive knees toward chest rapidly", scaling_options: "Easier: slow tempo step-ins. Harder: cross-body mountain climbers" },
        { name: "Jump Squats", sets, reps: "18", rest: "30 sec", notes: "Explode up, soft landing", muscles_targeted: "Quads, glutes, calves, cardiovascular system", form_tips: "Sit back into squat, explode upward, land softly with bent knees", scaling_options: "Easier: regular bodyweight squats. Harder: tuck jump squats" },
        { name: "High Knees", sets, reps: "60 sec", rest: "20 sec", notes: "Drive those knees to your chest", muscles_targeted: "Hip flexors, quads, cardiovascular system", form_tips: "Drive knees above hip height, pump arms, stay on balls of feet", scaling_options: "Easier: marching in place. Harder: add resistance band around feet" },
        { name: "Plank Jacks", sets, reps: "30", rest: "30 sec", notes: "Core stays locked", muscles_targeted: "Core, shoulders, inner and outer thighs", form_tips: "Jump feet wide and back in while maintaining straight plank position", scaling_options: "Easier: step feet out one at a time. Harder: add a push-up between jacks" },
        { name: "Box Jumps or Step-ups", sets, reps: "20", rest, notes: "Use stairs if no box - be explosive", muscles_targeted: "Quads, glutes, calves, hip flexors", form_tips: "Swing arms for momentum, land softly with both feet on box, stand tall", scaling_options: "Easier: step-ups on lower surface. Harder: higher box or single-leg" },
        { name: "Bear Crawls", sets, reps: "40 yards", rest, notes: "Forward and backward", muscles_targeted: "Shoulders, core, quads, hip flexors", form_tips: "Keep knees 1 inch off ground, opposite hand and foot move together", scaling_options: "Easier: shorter distance. Harder: add lateral bear crawl or band resistance" },
        { name: "Tuck Jumps", sets, reps: "15", rest, notes: "Knees to chest every jump", muscles_targeted: "Quads, glutes, calves, core", form_tips: "Drive knees to chest at peak of jump, land softly on balls of feet", scaling_options: "Easier: jump squats without tuck. Harder: consecutive with no pause" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "The Destroyer", sets: "1", reps: "50 burpees for time", rest: "0", notes: "Break if needed. Just finish. This is war.", muscles_targeted: "Full body, cardiovascular endurance", form_tips: "Full burpee form every rep, break into sets of 10 if needed", scaling_options: "Easier: 25 burpees. Harder: 75 burpees or burpee box jumps" }]
        : [{ name: "Tabata Burpees", sets: "8", reps: "20 sec on, 10 off", rest: "0", notes: "4 minutes of pure conditioning", muscles_targeted: "Full body, cardiovascular system", form_tips: "Max effort for 20 seconds, full burpee form, recover in 10 seconds", scaling_options: "Easier: step-back burpees. Harder: burpee tuck jumps" }];
    } else if (dayType.includes("pull")) {
      main = [
        { name: "Pull-ups or Inverted Rows", sets, reps, rest, notes: "Full range, squeeze at top", muscles_targeted: "Lats, biceps, rear deltoids, rhomboids", form_tips: "Full dead hang at bottom, pull until chin clears bar, squeeze lats", scaling_options: "Easier: inverted rows or band-assisted pull-ups. Harder: weighted pull-ups" },
        { name: "Dumbbell Rows", sets, reps: "12 each", rest, notes: "Heavy, squeeze lats", muscles_targeted: "Lats, rhomboids, biceps, rear deltoids", form_tips: "Hinge at hips, pull dumbbell to hip, squeeze shoulder blade at top", scaling_options: "Easier: lighter weight. Harder: pause 2 seconds at top" },
        { name: "Superman Holds", sets, reps: "45 sec", rest, notes: "Constant tension, feel the back", muscles_targeted: "Erector spinae, glutes, rear deltoids", form_tips: "Lift arms and legs simultaneously, hold at top with constant tension", scaling_options: "Easier: alternate arms and legs. Harder: add small pulses at top" },
        { name: "Explosive Rows", sets, reps: "10", rest, notes: "Fast pull, slow lower", muscles_targeted: "Lats, rhomboids, biceps, rear deltoids", form_tips: "Pull explosively to hip, lower with a 3-second negative", scaling_options: "Easier: lighter weight. Harder: heavier weight with same tempo" },
        { name: "Bicep Curls", sets, reps, rest, notes: "Strict form, slow negatives", muscles_targeted: "Biceps, brachialis, forearms", form_tips: "Keep elbows pinned to sides, curl up with control, 3-second negative", scaling_options: "Easier: lighter weight. Harder: add a 2-second squeeze at top" },
        { name: "Reverse Grip Rows", sets, reps: "12", rest, notes: "Underhand grip, bicep emphasis", muscles_targeted: "Lower lats, biceps, rhomboids", form_tips: "Underhand grip shoulder width, pull to lower chest, squeeze at top", scaling_options: "Easier: lighter weight. Harder: pause at top for 2 seconds" },
        { name: "Face Pulls", sets, reps, rest, notes: "External rotation at top", muscles_targeted: "Rear deltoids, rhomboids, rotator cuff", form_tips: "Pull band to face level, externally rotate hands at end, squeeze shoulder blades", scaling_options: "Easier: lighter band. Harder: heavier band with slow eccentric" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "Row + Jump Complex", sets: "5", reps: "15 rows + 15 jumps", rest: "45 sec", notes: "No rest between exercises", muscles_targeted: "Lats, biceps, quads, glutes, cardiovascular system", form_tips: "Complete all rows then immediately into jump squats, rest between rounds", scaling_options: "Easier: 3 rounds of 10+10. Harder: 6 rounds of 15+15" }]
        : [{ name: "Row + Jump Complex", sets: "4", reps: "12 rows + 12 jumps", rest: "45 sec", notes: "Strength meets power", muscles_targeted: "Lats, biceps, quads, glutes, cardiovascular system", form_tips: "Complete all rows then immediately into jump squats, rest between rounds", scaling_options: "Easier: 3 rounds of 8+8. Harder: 5 rounds of 15+15" }];
    } else if (dayType.includes("hiit") || dayType.includes("circuit") || dayType.includes("destruction")) {
      main = [
        { name: "Devil Press", sets, reps: "10", rest, notes: "Burpee + dumbbell snatch - brutal", muscles_targeted: "Full body, shoulders, hips, cardiovascular system", form_tips: "Burpee with hands on dumbbells, swing dumbbells overhead in one motion", scaling_options: "Easier: lighter weight or burpee + separate press. Harder: heavier dumbbells" },
        { name: "Thrusters", sets, reps: "12", rest, notes: "Squat to press, one motion", muscles_targeted: "Quads, glutes, shoulders, triceps, core", form_tips: "Deep squat with weight at shoulders, drive up and press overhead in one fluid motion", scaling_options: "Easier: lighter weight or squat and press separately. Harder: heavier dumbbells" },
        { name: "Renegade Rows", sets, reps: "10 each", rest, notes: "Plank row, core locked", muscles_targeted: "Lats, core, biceps, chest, anti-rotation", form_tips: "Wide feet for stability, row one dumbbell while bracing core, minimize hip rotation", scaling_options: "Easier: row from knees. Harder: add a push-up between rows" },
        { name: "Jump Lunges", sets, reps: "12 each", rest, notes: "Explosive switch", muscles_targeted: "Quads, glutes, hamstrings, calves, cardiovascular system", form_tips: "Explode up from lunge, switch legs in the air, land softly", scaling_options: "Easier: alternating reverse lunges. Harder: hold dumbbells" },
        { name: "Plank Up-Downs", sets, reps: "12 each arm", rest, notes: "Stay tight", muscles_targeted: "Core, triceps, shoulders, chest", form_tips: "Alternate leading arm each rep, minimize hip sway", scaling_options: "Easier: from knees. Harder: add a push-up at the top" },
        { name: "Mountain Climbers", sets, reps: "45 sec", rest: "20 sec", notes: "Sprint pace", muscles_targeted: "Core, hip flexors, shoulders, cardiovascular system", form_tips: "Keep hips level with shoulders, drive knees toward chest rapidly", scaling_options: "Easier: slow tempo step-ins. Harder: cross-body mountain climbers" },
        { name: "Burpee Pull-ups", sets: String(baseSets - 1), reps: "8", rest, notes: "Burpee into pull-up", muscles_targeted: "Full body, lats, biceps, cardiovascular system", form_tips: "Complete full burpee under bar, jump into pull-up, control the descent", scaling_options: "Easier: burpee + jumping pull-up. Harder: burpee + muscle-up" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "The Crucible", sets: "1", reps: "21-15-9 of burpees, thrusters, pull-ups", rest: "0", notes: "For time. You will earn this.", muscles_targeted: "Full body, cardiovascular endurance", form_tips: "21 of each, then 15 of each, then 9 of each - move with purpose", scaling_options: "Easier: 15-12-9 reps. Harder: 21-15-9 with heavier weight" }]
        : [{ name: "EMOM Burpees", sets: "10", reps: "6 burpees per minute", rest: "remaining time", notes: "10 minute challenge", muscles_targeted: "Full body, cardiovascular system", form_tips: "Complete 6 quality burpees, rest the remaining time in the minute", scaling_options: "Easier: 4 burpees per minute. Harder: 8 burpees per minute" }];
    } else if (dayType.includes("leg")) {
      main = [
        { name: "Goblet Squats", sets, reps, rest, notes: "Deep, controlled, feel every rep", muscles_targeted: "Quads, glutes, core, upper back", form_tips: "Hold weight at chest, elbows inside knees at bottom, drive through heels", scaling_options: "Easier: bodyweight squats. Harder: heavier weight or add a pause at bottom" },
        { name: "Romanian Deadlifts", sets, reps: "12", rest, notes: "Feel the hamstring stretch", muscles_targeted: "Hamstrings, glutes, erector spinae", form_tips: "Soft knee bend, hinge at hips, push hips back, feel deep hamstring stretch", scaling_options: "Easier: lighter weight or bodyweight good mornings. Harder: single-leg RDL" },
        { name: "Jump Squats", sets, reps: "15", rest, notes: "Explosive power", muscles_targeted: "Quads, glutes, calves, cardiovascular system", form_tips: "Sit back into squat, explode upward, land softly with bent knees", scaling_options: "Easier: regular bodyweight squats. Harder: tuck jump squats" },
        { name: "Bulgarian Split Squats", sets, reps: "12 each", rest, notes: "Balance and strength", muscles_targeted: "Quads, glutes, hip flexors, balance", form_tips: "Rear foot on bench, lower until front thigh is parallel, keep torso upright", scaling_options: "Easier: regular split squats on floor. Harder: add dumbbells or deficit" },
        { name: "Calf Raises", sets, reps: "25", rest: "20 sec", notes: "Full ROM, pause at top", muscles_targeted: "Gastrocnemius, soleus", form_tips: "Rise to full tiptoe, pause 1 second at top, lower slowly past flat", scaling_options: "Easier: bilateral flat ground. Harder: single-leg on a step edge" },
        { name: "Walking Lunges", sets, reps: "15 each", rest, notes: "Big steps", muscles_targeted: "Quads, glutes, hamstrings, balance", form_tips: "Long stride, back knee lightly touches floor, push through front heel", scaling_options: "Easier: stationary lunges. Harder: add dumbbells or overhead lunges" },
        { name: "Wall Sit", sets, reps: "60 sec", rest, notes: "Thighs parallel, embrace the burn", muscles_targeted: "Quads, glutes, core", form_tips: "Back flat on wall, thighs parallel to floor, knees at 90 degrees", scaling_options: "Easier: higher position or shorter hold. Harder: hold a weight on your lap" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "Leg Destruction", sets: "1", reps: "50 squats, 50 lunges, 50 jump squats", rest: "0", notes: "For time. Legs will be jelly.", muscles_targeted: "Quads, glutes, hamstrings, calves, cardiovascular endurance", form_tips: "Full range of motion on every rep, break into sets as needed", scaling_options: "Easier: 25 of each. Harder: 75 of each" }]
        : [{ name: "Squat Hold + Jumps", sets: "4", reps: "40 sec hold + 15 jumps", rest: "45 sec", notes: "Burn then explode", muscles_targeted: "Quads, glutes, calves", form_tips: "Hold squat at parallel for 40 seconds, then immediately 15 jump squats", scaling_options: "Easier: 20 sec hold + 10 jumps. Harder: 60 sec hold + 20 jumps" }];
    } else { // hybrid / destroyer
      main = [
        { name: "Thrusters", sets, reps: "12", rest, notes: "Full body power", muscles_targeted: "Quads, glutes, shoulders, triceps, core", form_tips: "Deep squat with weight at shoulders, drive up and press overhead in one fluid motion", scaling_options: "Easier: lighter weight or squat and press separately. Harder: heavier dumbbells" },
        { name: "Burpee Pull-ups", sets, reps: "10", rest: "60 sec", notes: "Burpee into pull-up if possible", muscles_targeted: "Full body, lats, biceps, cardiovascular system", form_tips: "Complete full burpee under bar, jump into pull-up, control the descent", scaling_options: "Easier: burpee + jumping pull-up. Harder: burpee + muscle-up" },
        { name: "Dumbbell Complex", sets, reps: "6 each movement", rest: "60 sec", notes: "Row, clean, press, squat - no drop", muscles_targeted: "Full body - every major muscle group", form_tips: "Flow between movements without dropping dumbbells, maintain form throughout", scaling_options: "Easier: lighter weight or fewer movements. Harder: heavier weight or add reps" },
        { name: "Mountain Climbers", sets, reps: "45 sec", rest: "30 sec", notes: "Sprint pace", muscles_targeted: "Core, hip flexors, shoulders, cardiovascular system", form_tips: "Keep hips level with shoulders, drive knees toward chest rapidly", scaling_options: "Easier: slow tempo step-ins. Harder: cross-body mountain climbers" },
        { name: "Plank Hold", sets, reps: "60 sec", rest: "30 sec", notes: "Core control", muscles_targeted: "Core, shoulders, glutes", form_tips: "Forearms on floor, body straight from head to heels, squeeze glutes and abs", scaling_options: "Easier: from knees or shorter time. Harder: weighted or 90+ seconds" },
        { name: "Devil Press", sets, reps: "10", rest, notes: "The ultimate hybrid exercise", muscles_targeted: "Full body, shoulders, hips, cardiovascular system", form_tips: "Burpee with hands on dumbbells, swing dumbbells overhead in one motion", scaling_options: "Easier: lighter weight or burpee + separate press. Harder: heavier dumbbells" },
        { name: "Jump Lunges", sets, reps: "12 each", rest, notes: "Explosive power", muscles_targeted: "Quads, glutes, hamstrings, calves, cardiovascular system", form_tips: "Explode up from lunge, switch legs in the air, land softly", scaling_options: "Easier: alternating reverse lunges. Harder: hold dumbbells" },
      ];
      finisher = finisherIntensity === "extreme"
        ? [{ name: "The Chipper", sets: "1", reps: "75 squats, 50 push-ups, 40 lunges, 30 burpees, 20 pull-ups", rest: "0", notes: "For time - no stopping. This is your test.", muscles_targeted: "Full body, cardiovascular endurance", form_tips: "Pace yourself early, maintain form throughout, break into manageable sets", scaling_options: "Easier: halve all reps. Harder: add a 400m run between movements" }]
        : [{ name: "Mini Chipper", sets: "1", reps: "50 squats, 40 push-ups, 30 lunges, 20 burpees, 10 pull-ups", rest: "0", notes: "For time - no stopping", muscles_targeted: "Full body, cardiovascular endurance", form_tips: "Pace yourself, maintain form, break into sets as needed", scaling_options: "Easier: halve all reps. Harder: use the full Chipper rep scheme" }];
    }
  }

  return { warmup, main, finisher, cooldown };
};

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
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
            muscles_targeted: ex.muscles_targeted,
            form_tips: ex.form_tips,
            scaling_options: ex.scaling_options,
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
            muscles_targeted: ex.muscles_targeted,
            form_tips: ex.form_tips,
            scaling_options: ex.scaling_options,
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
            muscles_targeted: ex.muscles_targeted,
            form_tips: ex.form_tips,
            scaling_options: ex.scaling_options,
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
            muscles_targeted: ex.muscles_targeted,
            form_tips: ex.form_tips,
            scaling_options: ex.scaling_options,
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
