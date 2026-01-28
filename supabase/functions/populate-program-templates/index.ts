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
    case 7: return [0, 1, 2, 3, 4, 5, 6]; // All days
    default: return [0, 2, 4]; // Default to 3 days
  }
}

// ============================================
// FREE WORLD ELITE EXERCISE POOLS
// Premium coaching: 6 sections, progressive overload, coach cues
// ============================================

const ELITE_EXERCISE_POOLS = {
  activation: {
    upper: [
      { name: "Banded Face Pulls", sets: "3", reps: "15-20", rest: "0s", notes: "Light resistance, external rotation focus.", coachNotes: "Watch for shoulder blade retraction at the top. If they shrug, the band is too heavy.", scalingOptions: "Use a lighter band or a towel stretch if no bands available.", progressionNotes: "Add 3 reps each week or decrease rest between sets." },
      { name: "Banded Pull-Aparts", sets: "3", reps: "15-20", rest: "0s", notes: "Chest high, squeeze shoulder blades.", coachNotes: "Elbows should stay slightly bent. No arm movement, all scapular.", scalingOptions: "Perform without band using isometric holds.", progressionNotes: "Week 2: Add 5 reps. Week 3: Pause 2 sec at contraction." },
      { name: "Shoulder Circles (Weighted)", sets: "2", reps: "15 each", rest: "0s", notes: "Use light weights or water bottles.", coachNotes: "Keep circles controlled, not momentum-based. Feel the rotator cuff warming.", scalingOptions: "Perform unweighted if shoulder issues exist.", progressionNotes: "Increase weight by 1-2 lbs each week." },
      { name: "Prone Y-T-W Raises", sets: "2", reps: "10 each", rest: "0s", notes: "Face down, form letters with arms.", coachNotes: "Thumbs up on Y, palms down on T, thumbs up on W. Light weight only.", scalingOptions: "Perform standing bent over if floor isn't available.", progressionNotes: "Add 3 reps to each letter each week." },
      { name: "Scap Push-ups", sets: "2", reps: "12-15", rest: "0s", notes: "Arms locked, only shoulder blades move.", coachNotes: "Push the floor away, then let blades come together. No elbow bend.", scalingOptions: "Perform on knees if core stability is an issue.", progressionNotes: "Week 3: Add 2-sec hold at protraction." },
      { name: "Banded Internal/External Rotation", sets: "2", reps: "12 each", rest: "0s", notes: "Elbow pinned to side, rotate forearm.", coachNotes: "Keep elbow at 90 degrees. No shoulder movement, isolate the rotator cuff.", scalingOptions: "Use a towel or light weight if no band.", progressionNotes: "Add resistance or reps weekly." },
    ],
    lower: [
      { name: "Glute Bridges (Banded)", sets: "3", reps: "15-20", rest: "0s", notes: "Band above knees, drive out.", coachNotes: "Full hip extension at top, squeeze 2 seconds. No lower back arching.", scalingOptions: "Remove band if glutes aren't firing properly.", progressionNotes: "Week 2: Add pause. Week 3: Single leg variation." },
      { name: "Clamshells", sets: "2", reps: "15 each", rest: "0s", notes: "Knees bent, feet together, open like a clam.", coachNotes: "Keep hips stacked, don't roll back. Feel it in the side of the glute.", scalingOptions: "Add band when bodyweight becomes easy.", progressionNotes: "Add 5 reps each week, then add band." },
      { name: "Banded Monster Walks", sets: "2", reps: "20 steps", rest: "0s", notes: "Band above ankles, stay in quarter squat.", coachNotes: "Keep tension on the band at all times. No waddling, controlled steps.", scalingOptions: "Move band higher (above knees) if too difficult.", progressionNotes: "Increase steps by 5 each week." },
      { name: "Fire Hydrants", sets: "2", reps: "12 each", rest: "0s", notes: "On all fours, lift knee to side.", coachNotes: "Keep core tight, don't shift weight to opposite side.", scalingOptions: "Add ankle weights for progression.", progressionNotes: "Add 3 reps each week, then add band." },
      { name: "Banded Lateral Walks", sets: "2", reps: "15 each", rest: "0s", notes: "Band above knees, sidestep with control.", coachNotes: "Stay low, toes forward. Feel the burn in outer glutes.", scalingOptions: "Use lighter band or remove if form breaks.", progressionNotes: "Increase reps or add second set." },
      { name: "Quadruped Hip Circles", sets: "2", reps: "10 each", rest: "0s", notes: "On all fours, draw circles with knee.", coachNotes: "Slow and controlled. Open up the hip joint fully.", scalingOptions: "Reduce circle size if hip mobility is limited.", progressionNotes: "Increase circle size each week." },
    ],
  },
  mobility: {
    upper: [
      { name: "World's Greatest Stretch", sets: "2", reps: "5 each", rest: "0s", notes: "Lunge, rotate, reach. Full body opener.", coachNotes: "Keep back knee off ground, drive elbow to instep before rotating.", scalingOptions: "Drop back knee if balance is an issue.", progressionNotes: "Add 2 reps each week, deepen the stretch." },
      { name: "Thread the Needle", sets: "2", reps: "8 each", rest: "0s", notes: "On all fours, reach under and rotate.", coachNotes: "Follow the hand with your eyes. Feel the thoracic spine opening.", scalingOptions: "Reduce range if shoulder impingement exists.", progressionNotes: "Hold end position 3 seconds by week 3." },
      { name: "Cat-Cow Flow", sets: "2", reps: "10", rest: "0s", notes: "Arch and round the spine rhythmically.", coachNotes: "Coordinate with breath. Inhale cow, exhale cat.", scalingOptions: "Reduce range if any spinal discomfort.", progressionNotes: "Slow the tempo each week for deeper stretch." },
      { name: "Shoulder Dislocates", sets: "2", reps: "10", rest: "0s", notes: "Use band or towel, wide grip.", coachNotes: "Only go as far as comfortable. Grip should narrow as mobility improves.", scalingOptions: "Use wider grip if shoulders are tight.", progressionNotes: "Narrow grip by 2 inches each week." },
      { name: "Wall Slides", sets: "2", reps: "10", rest: "0s", notes: "Back to wall, slide arms up and down.", coachNotes: "Keep entire back flat, don't arch. Elbows and wrists touch wall.", scalingOptions: "Step away from wall if can't keep flat.", progressionNotes: "Add 1-sec pause at top each week." },
      { name: "Doorway Pec Stretch", sets: "2", reps: "30s each", rest: "0s", notes: "Arm on doorframe, lean through.", coachNotes: "Don't shrug. Keep core engaged, breathe into the stretch.", scalingOptions: "Reduce lean angle if too intense.", progressionNotes: "Increase hold time by 15 sec each week." },
    ],
    lower: [
      { name: "90/90 Hip Stretch", sets: "2", reps: "45s each", rest: "0s", notes: "Front and back leg at 90 degrees.", coachNotes: "Sit tall, don't slump. Feel it in both hips differently.", scalingOptions: "Sit on block if hips are tight.", progressionNotes: "Add 15 sec each week, add lean forward." },
      { name: "Frog Stretch", sets: "2", reps: "60s", rest: "0s", notes: "Knees wide, rock forward and back.", coachNotes: "Let gravity do the work. Don't force. Breathe deeply.", scalingOptions: "Use cushion under knees if floor is hard.", progressionNotes: "Increase time to 90 sec by week 4." },
      { name: "Pigeon Pose", sets: "2", reps: "45s each", rest: "0s", notes: "Shin across, back leg extended.", coachNotes: "Square hips to the ground. Fold forward for deeper stretch.", scalingOptions: "Use Figure-4 on back if too intense.", progressionNotes: "Add forward fold each week." },
      { name: "Kneeling Hip Flexor Stretch", sets: "2", reps: "30s each", rest: "0s", notes: "Rear knee down, squeeze glute.", coachNotes: "Don't arch back. Tuck tailbone under for deeper stretch.", scalingOptions: "Pad knee if painful.", progressionNotes: "Add overhead reach by week 3." },
      { name: "Standing Hamstring Stretch", sets: "2", reps: "30s each", rest: "0s", notes: "Heel on surface, hinge forward.", coachNotes: "Keep back flat, hinge from hips not waist.", scalingOptions: "Use lower surface if flexibility is limited.", progressionNotes: "Lower surface height as flexibility improves." },
      { name: "Ankle Circles", sets: "2", reps: "15 each", rest: "0s", notes: "Draw large circles with foot.", coachNotes: "Use full range. Feel any restrictions and work through them.", scalingOptions: "Smaller circles if pain exists.", progressionNotes: "Increase speed and range each week." },
    ],
  },
  strength: {
    push: [
      { name: "Decline Diamond Push-ups", sets: "4", reps: "20-25", rest: "45s", notes: "Feet elevated, hands close. Ultimate tricep and upper chest builder.", coachNotes: "Keep elbows tucked at 45 degrees. Full lockout, chest to hands.", scalingOptions: "Move to flat ground if too difficult. Use knees if needed.", progressionNotes: "Week 2: +5 reps. Week 3: -10s rest. Week 4: Add pause at bottom." },
      { name: "Archer Push-ups", sets: "4", reps: "12-15 each", rest: "45s", notes: "One arm extended, other does work. Unilateral strength builder.", coachNotes: "Slide extended arm on smooth surface. Keep core tight, no hip rotation.", scalingOptions: "Use wider stance if balance is an issue.", progressionNotes: "Week 2: +3 reps. Week 3: Pause 2 sec. Week 4: Elevate feet." },
      { name: "Pike Push-ups", sets: "4", reps: "15-20", rest: "45s", notes: "Hips high, head between arms. Shoulder pressing movement.", coachNotes: "Head should touch floor between hands. Keep legs as straight as possible.", scalingOptions: "Elevate hands on surface to reduce difficulty.", progressionNotes: "Decrease rest 5 sec each week. Add deficit by week 4." },
      { name: "Explosive Clap Push-ups", sets: "4", reps: "12-15", rest: "45s", notes: "Explode up, clap, land soft. Power development.", coachNotes: "Only attempt once regular push-ups are solid. Land with soft elbows.", scalingOptions: "Do explosive push-ups without clap.", progressionNotes: "Add reps each week. Week 4: Double clap." },
      { name: "Pseudo Planche Push-ups", sets: "3", reps: "12-15", rest: "50s", notes: "Hands by hips, lean forward. Advanced pushing.", coachNotes: "The more you lean, the harder it gets. Build gradually.", scalingOptions: "Keep hands higher (by belly button) to reduce difficulty.", progressionNotes: "Lean forward 1 inch more each week." },
      { name: "Hindu Push-ups", sets: "3", reps: "15-20", rest: "45s", notes: "Dive through and arc back. Shoulders, chest, triceps.", coachNotes: "Fluid motion, don't pause in the middle. Full hip extension at end.", scalingOptions: "Slow the tempo if form breaks down.", progressionNotes: "Add 5 reps each week." },
      { name: "Wall Handstand Hold", sets: "3", reps: "30-45s", rest: "60s", notes: "Belly to wall, stack joints. Core and shoulder stability.", coachNotes: "Fingers spread, push through shoulders. Don't let back arch.", scalingOptions: "Pike hold with feet on chair if not ready for wall.", progressionNotes: "Add 15 sec each week. Week 4: Shoulder taps." },
    ],
    pull: [
      { name: "Weighted Pull-ups", sets: "5", reps: "12-15", rest: "45s", notes: "Add weight via backpack, dip belt, or hold dumbbell. Heavy pulls.", coachNotes: "Dead hang start, chin over bar finish. Control the negative.", scalingOptions: "Use band assistance if can't hit reps.", progressionNotes: "Add weight or reps each week. -5s rest week 3." },
      { name: "L-Sit Pull-ups", sets: "4", reps: "10-12", rest: "50s", notes: "Legs extended parallel to floor while pulling. Core + back.", coachNotes: "Hold the L throughout. If legs drop, the rep doesn't count.", scalingOptions: "Tuck knees instead of full L-sit.", progressionNotes: "Add 2 reps each week." },
      { name: "Typewriter Pull-ups", sets: "4", reps: "8-10 each", rest: "50s", notes: "Pull up, shift weight side to side at top.", coachNotes: "Stay at the top throughout the set. Don't drop between shifts.", scalingOptions: "Do chin-up holds with lateral leans.", progressionNotes: "Add 2 reps each side each week." },
      { name: "Commando Pull-ups", sets: "4", reps: "10-12 each", rest: "45s", notes: "Hands offset, alternate which side of bar you pass.", coachNotes: "Keep body close to bar. Alternate smoothly without pausing at bottom.", scalingOptions: "Do regular chin-ups if too difficult.", progressionNotes: "Add 2 reps each week. Week 4: Slow negatives." },
      { name: "Inverted Rows (Feet Elevated)", sets: "4", reps: "20-25", rest: "40s", notes: "Feet on bench, body horizontal. Row variation.", coachNotes: "Pull chest to bar/surface, squeeze shoulder blades. 2 sec hold at top.", scalingOptions: "Lower feet to ground to reduce difficulty.", progressionNotes: "Add 5 reps each week. Week 4: Add weight vest." },
      { name: "Towel Pull-ups", sets: "3", reps: "8-12", rest: "60s", notes: "Grip towels over bar. Forearm and grip destroyer.", coachNotes: "Grip will fail before back does. That's the point.", scalingOptions: "Use thicker towels for easier grip, thinner for harder.", progressionNotes: "Add 2 reps each week or use thinner towels." },
      { name: "Muscle-up Progressions", sets: "3", reps: "6-10", rest: "60s", notes: "Explosive pull, transition, push. The ultimate.", coachNotes: "Start with high pull-ups. Add chest-to-bar, then transition drills.", scalingOptions: "Do negative muscle-ups or jumping muscle-ups.", progressionNotes: "Work toward full muscle-ups by week 4." },
    ],
    legs: [
      { name: "Pistol Squats", sets: "4", reps: "12-15 each", rest: "50s", notes: "Full depth single leg squat. Ultimate leg strength.", coachNotes: "Arms forward for balance. Go slow on the descent, explode up.", scalingOptions: "Hold TRX or doorframe for assistance.", progressionNotes: "Add 2 reps each week. Week 4: Add weight." },
      { name: "Shrimp Squats", sets: "4", reps: "10-12 each", rest: "50s", notes: "Hold rear foot, rear knee touches ground. Advanced.", coachNotes: "Keep torso upright. Knee should touch directly behind standing foot.", scalingOptions: "Don't go all the way down initially.", progressionNotes: "Increase depth each week." },
      { name: "Bulgarian Split Squat Jumps", sets: "4", reps: "10-12 each", rest: "50s", notes: "Rear foot elevated, explode up. Plyometric single leg.", coachNotes: "Land soft, immediately explode into next rep. Control the landing.", scalingOptions: "Remove jump, just do Bulgarian split squats.", progressionNotes: "Add 2 reps each week." },
      { name: "Nordic Curl Negatives", sets: "4", reps: "6-10", rest: "60s", notes: "Knees anchored, lower body slowly. Hamstring strength.", coachNotes: "Go as slow as possible on the way down. Use hands to push back up.", scalingOptions: "Use a band around chest anchored behind you.", progressionNotes: "Slow negative by 1 sec each week." },
      { name: "Sissy Squats", sets: "4", reps: "15-20", rest: "45s", notes: "Lean back, knees travel forward. Quad isolation.", coachNotes: "Hold something for balance. Feel the stretch in the quads.", scalingOptions: "Don't lean back as far initially.", progressionNotes: "Add 3 reps each week. Increase lean." },
      { name: "Cossack Squats", sets: "3", reps: "12 each", rest: "45s", notes: "Wide stance, shift to one side. Lateral mobility and strength.", coachNotes: "Keep heel down on working leg. Straight leg toes can point up.", scalingOptions: "Hold onto something for balance.", progressionNotes: "Add depth each week." },
      { name: "Box Jump to Single Leg Land", sets: "3", reps: "8 each", rest: "45s", notes: "Jump up with two, land on one. Control and power.", coachNotes: "Step down, don't jump down. Control the single leg landing.", scalingOptions: "Land on two feet, step down on one.", progressionNotes: "Increase box height each week." },
    ],
    core: [
      { name: "Dragon Flag Negatives", sets: "4", reps: "8-10", rest: "50s", notes: "Control descent from vertical. Ultimate core strength.", coachNotes: "Keep body straight as a board. Lower as slow as possible.", scalingOptions: "Tuck knees to reduce difficulty.", progressionNotes: "Straighten legs more each week." },
      { name: "Hanging Windshield Wipers", sets: "4", reps: "8-10 each", rest: "50s", notes: "Legs to bar, rotate side to side. Oblique destroyer.", coachNotes: "Keep legs together and straight. Control, don't swing.", scalingOptions: "Bend knees to reduce difficulty.", progressionNotes: "Add 2 reps each side each week." },
      { name: "Ab Wheel Rollouts (Full)", sets: "4", reps: "12-15", rest: "45s", notes: "Full extension and return. Core strength and stability.", coachNotes: "Don't let hips sag at full extension. Brace core throughout.", scalingOptions: "Only go as far as you can control.", progressionNotes: "Increase range each week." },
      { name: "L-Sit Hold", sets: "4", reps: "30-45s", rest: "45s", notes: "Legs parallel to floor, arms locked. Core and hip flexors.", coachNotes: "Push shoulders down, lift hips up. Legs stay straight.", scalingOptions: "Tuck one or both knees.", progressionNotes: "Add 10 sec each week." },
      { name: "Hollow Body Rocks", sets: "3", reps: "30-45s", rest: "30s", notes: "Hollow position, rock back and forth. Core endurance.", coachNotes: "Lower back must stay pressed to floor. Stop if it arches.", scalingOptions: "Keep knees bent and arms at sides.", progressionNotes: "Straighten arms overhead by week 4." },
      { name: "Pallof Press Holds", sets: "3", reps: "30s each", rest: "30s", notes: "Band at chest, press out, hold. Anti-rotation.", coachNotes: "Stand tall, don't let band rotate your torso.", scalingOptions: "Step closer to anchor point for less resistance.", progressionNotes: "Add 10 sec each week." },
    ],
  },
  accessory: {
    push: [
      { name: "Tricep Dips (Rings/Parallel Bars)", sets: "4", reps: "15-20", rest: "40s", notes: "Full depth, lockout at top. Tricep builder.", coachNotes: "Slight forward lean for chest, upright for triceps.", scalingOptions: "Use bench dips if bars unavailable.", progressionNotes: "Add 3 reps each week. Week 4: Add weight." },
      { name: "Close-Grip Push-ups (Tempo 3-1-3-0)", sets: "3", reps: "12-15", rest: "40s", notes: "3 sec down, 1 sec hold, 3 sec up. Time under tension.", coachNotes: "The tempo is the exercise. Don't rush.", scalingOptions: "Reduce tempo to 2-1-2-0 if too difficult.", progressionNotes: "Add 2 reps each week." },
      { name: "Banded Push-up (Superset)", sets: "3", reps: "15-20", rest: "0s", notes: "Band across back, anchored under hands.", coachNotes: "Band adds resistance at the top where you're strongest.", scalingOptions: "Remove band if can't hit reps.", progressionNotes: "Use thicker band each week." },
      { name: "Push-up to T-Rotation", sets: "3", reps: "10 each", rest: "40s", notes: "Push-up, rotate, arm to sky. Core and shoulders.", coachNotes: "Stack shoulders at top of rotation. Control throughout.", scalingOptions: "Stagger feet wider for balance.", progressionNotes: "Add 2 reps each side each week." },
    ],
    pull: [
      { name: "Scapular Pull-ups", sets: "3", reps: "15-20", rest: "40s", notes: "Dead hang, retract scapula only. Foundation movement.", coachNotes: "No elbow bend. Just shoulder blade movement.", scalingOptions: "Use band if can't control.", progressionNotes: "Add 3 reps each week." },
      { name: "Face Pulls (Band)", sets: "3", reps: "20-25", rest: "35s", notes: "High pull to face, external rotate. Rear delts.", coachNotes: "Thumbs should end up near ears at full contraction.", scalingOptions: "Use lighter band if form breaks.", progressionNotes: "Add 5 reps each week." },
      { name: "Isometric Chin-up Holds", sets: "3", reps: "30-45s", rest: "45s", notes: "Hold at top of chin-up. Static strength.", coachNotes: "Chin over bar the entire time. Squeeze.", scalingOptions: "Use band or stand on box for assistance.", progressionNotes: "Add 10 sec each week." },
      { name: "Australian Pull-ups (Underhand)", sets: "3", reps: "20-25", rest: "35s", notes: "Inverted row with palms up. Bicep emphasis.", coachNotes: "Pull to lower chest, squeeze biceps at top.", scalingOptions: "Elevate feet for more challenge.", progressionNotes: "Add 3 reps each week." },
    ],
    legs: [
      { name: "Single Leg Glute Bridges", sets: "3", reps: "15-20 each", rest: "35s", notes: "One leg extended, drive through grounded heel.", coachNotes: "Don't let hips rotate. Squeeze glute at top 2 seconds.", scalingOptions: "Keep non-working foot on ground.", progressionNotes: "Add 3 reps each week. Add weight week 4." },
      { name: "Wall Sit Hold", sets: "3", reps: "60-90s", rest: "45s", notes: "Back flat, thighs parallel. Quad endurance.", coachNotes: "Don't push on thighs with hands. That's cheating.", scalingOptions: "Slightly higher angle if too difficult.", progressionNotes: "Add 15 sec each week." },
      { name: "Calf Raises (Single Leg)", sets: "3", reps: "20-25 each", rest: "30s", notes: "Full stretch at bottom, full contraction at top.", coachNotes: "Pause 1 sec at both ends of range.", scalingOptions: "Use both legs if needed.", progressionNotes: "Add 3 reps each week." },
      { name: "Reverse Lunges (Tempo)", sets: "3", reps: "12 each", rest: "40s", notes: "3 seconds down, 1 second up. Control.", coachNotes: "Keep torso upright. Don't let front knee cave.", scalingOptions: "Hold onto something for balance.", progressionNotes: "Add 2 reps each week." },
    ],
    core: [
      { name: "Dead Bug", sets: "3", reps: "15 each", rest: "30s", notes: "Lower opposite arm and leg. Core stability.", coachNotes: "Lower back must stay pressed to floor throughout.", scalingOptions: "Keep knees bent if too difficult.", progressionNotes: "Add 2 reps each side each week." },
      { name: "Bird Dog", sets: "3", reps: "12 each", rest: "30s", notes: "Opposite arm and leg extend. Balance and core.", coachNotes: "Don't rotate hips. Imagine balancing glass of water on back.", scalingOptions: "Just lift arm OR leg, not both.", progressionNotes: "Add 2-sec hold at extension week 3." },
      { name: "Side Plank (Top Leg Lifted)", sets: "3", reps: "30-45s each", rest: "30s", notes: "Stacked, top leg raised. Oblique challenge.", coachNotes: "Keep body in straight line. Don't let hips drop.", scalingOptions: "Keep both feet on ground.", progressionNotes: "Add 10 sec each week." },
      { name: "Plank Shoulder Taps", sets: "3", reps: "20 each", rest: "30s", notes: "Plank position, tap opposite shoulder.", coachNotes: "Minimize hip rotation. Anti-rotation exercise.", scalingOptions: "Wider foot stance for more stability.", progressionNotes: "Add 3 taps each side each week." },
    ],
  },
  conditioning: {
    hiit: [
      { name: "Burpee Complex", sets: "5", reps: "10 + 10 squat jumps", rest: "30s", notes: "Burpee with push-up, immediately into squat jumps.", coachNotes: "No rest between burpees and jumps. That's the point.", scalingOptions: "Remove push-up from burpee if needed.", progressionNotes: "Add 2 reps each set each week. -5s rest week 3." },
      { name: "EMOM: Push-Pull-Squat", sets: "5", reps: "10 min total", rest: "remaining time", notes: "Every minute: 5 push-ups, 5 rows, 5 squats. Rest remainder.", coachNotes: "The goal is to finish faster each week, giving more rest.", scalingOptions: "Reduce reps to 3 each if too difficult.", progressionNotes: "Add 1 rep to each exercise each week." },
      { name: "Tabata Mountain Climbers", sets: "8", reps: "20s work/10s rest", rest: "10s", notes: "Maximum effort for 20 seconds. Total 4 minutes.", coachNotes: "Count your reps. Beat that number next set.", scalingOptions: "Do step-in mountain climbers for less impact.", progressionNotes: "Increase speed/reps each week." },
      { name: "40/20 Interval: Squat Jumps", sets: "6", reps: "40s work/20s rest", rest: "20s", notes: "Maximum squat jumps in 40 seconds, 20 seconds rest.", coachNotes: "Depth matters. Full squat each rep.", scalingOptions: "Do bodyweight squats without jump.", progressionNotes: "Add 2 sets each week." },
      { name: "Plyometric Circuit", sets: "4", reps: "5 exercises", rest: "45s", notes: "Box jumps, broad jumps, lateral hops, tuck jumps, split jumps.", coachNotes: "8-10 reps each exercise, no rest between. Quality over quantity.", scalingOptions: "Step up instead of jump if needed.", progressionNotes: "Add 1 round each week." },
    ],
    circuits: [
      { name: "Prison Cell Complex V2", sets: "5", reps: "AMRAP 3 min", rest: "60s", notes: "15 push-ups, 20 squats, 10 burpees. As many rounds as possible.", coachNotes: "Track your rounds. Beat it next time.", scalingOptions: "Reduce reps: 10 push-ups, 15 squats, 5 burpees.", progressionNotes: "Add 1 round minimum each week." },
      { name: "The Yard Sprint V2", sets: "4", reps: "4 min AMRAP", rest: "90s", notes: "10 burpees, 20 squats, 30 mountain climbers, 10 jump lunges.", coachNotes: "Pace yourself round 1. Go all out final round.", scalingOptions: "Cut reps in half if needed.", progressionNotes: "Increase AMRAP time by 30 sec each week." },
      { name: "Iron Will V2", sets: "4", reps: "5 rounds", rest: "60s", notes: "Max pull-ups, 15 dips, 25 squats, 10 burpees.", coachNotes: "Pull-ups to failure. Everything else is mandatory.", scalingOptions: "Use band for pull-ups and dips.", progressionNotes: "Reduce rest by 10 sec each week." },
      { name: "Death Row V2", sets: "3", reps: "Until failure", rest: "90s", notes: "Push-ups, squats, lunges, mountain climbers. Each to failure before next.", coachNotes: "Record your reps. Next time, beat every number.", scalingOptions: "Cap at 50 reps each to prevent overtraining.", progressionNotes: "No progression needed - beat previous score." },
      { name: "Solitary Confinement V2", sets: "3", reps: "6 min AMRAP", rest: "120s", notes: "25 push-ups, 25 squats, 25 lunges (total), 25 mountain climbers (each).", coachNotes: "This is supposed to be hard. Embrace the suffering.", scalingOptions: "15 reps each exercise.", progressionNotes: "Add 1 minute to AMRAP each week." },
    ],
  },
  recovery: {
    stretching: [
      { name: "Deep Squat Hold", sets: "2", reps: "60-90s", rest: "0s", notes: "Sit in deep squat, heels down.", coachNotes: "Use arms to push knees out. Breathe deeply and relax into it.", scalingOptions: "Hold onto something for balance.", progressionNotes: "Increase time by 30 sec each week." },
      { name: "Couch Stretch", sets: "2", reps: "60s each", rest: "0s", notes: "Rear knee in corner, front foot forward. Hip flexor stretch.", coachNotes: "Squeeze glute of rear leg. Keep torso upright.", scalingOptions: "Use half kneeling position away from wall.", progressionNotes: "Add 15 sec each week." },
      { name: "Child's Pose with Reach", sets: "2", reps: "60s", rest: "0s", notes: "Arms extended, sink hips to heels.", coachNotes: "Walk hands to each side for lat stretch variation.", scalingOptions: "Place pillow between hips and heels.", progressionNotes: "Add side reaches each week." },
      { name: "Lying Spinal Twist", sets: "2", reps: "45s each", rest: "0s", notes: "Shoulders down, knees to side.", coachNotes: "Let gravity do the work. Breathe into the twist.", scalingOptions: "Use pillow under knees.", progressionNotes: "Increase time by 15 sec each week." },
      { name: "Forward Fold", sets: "2", reps: "60s", rest: "0s", notes: "Let head and arms hang heavy.", coachNotes: "Bend knees slightly if needed. Relax completely.", scalingOptions: "Rest hands on shins or block.", progressionNotes: "Work toward straight legs." },
      { name: "Supine Figure-4 Stretch", sets: "2", reps: "45s each", rest: "0s", notes: "Ankle on opposite knee, pull thigh.", coachNotes: "Keep head down, relax shoulders.", scalingOptions: "Keep bottom foot on ground.", progressionNotes: "Pull thigh closer each week." },
    ],
    breathing: [
      { name: "Box Breathing", sets: "3", reps: "4 cycles", rest: "0s", notes: "4 sec inhale, 4 sec hold, 4 sec exhale, 4 sec hold.", coachNotes: "Focus on the count. Let thoughts pass without engaging.", scalingOptions: "Use 3-sec intervals if 4 is too long.", progressionNotes: "Increase to 5-sec intervals by week 4." },
      { name: "Diaphragmatic Breathing", sets: "2", reps: "10 breaths", rest: "0s", notes: "Hand on belly, breathe into it.", coachNotes: "Chest should not rise. Only the belly.", scalingOptions: "Lie down if sitting is distracting.", progressionNotes: "Add 2 breaths each week." },
      { name: "4-7-8 Relaxation Breath", sets: "3", reps: "4 cycles", rest: "0s", notes: "Inhale 4, hold 7, exhale 8.", coachNotes: "Exhale through mouth with whoosh sound.", scalingOptions: "Reduce ratio proportionally if too long.", progressionNotes: "Increase cycles each week." },
    ],
  },
};

// AMRAP Finisher pools
const ELITE_AMRAP_FINISHERS = [
  { name: "AMRAP: The Yard Sprint", duration: "4 min", notes: "10 burpees, 20 squats, 30 mountain climbers. Maximum rounds.", coachNotes: "Track rounds and partial reps. Beat it next time." },
  { name: "AMRAP: Iron Will", duration: "4 min", notes: "5 pull-ups, 10 dips, 15 squats. Leave nothing.", coachNotes: "Modify pull-ups and dips as needed, but don't skip them." },
  { name: "AMRAP: Prison Break", duration: "3 min", notes: "15 burpees, 15 squat jumps, 15 tuck jumps.", coachNotes: "This is 3 minutes of maximum effort. Don't pace yourself." },
  { name: "AMRAP: The Executioner", duration: "5 min", notes: "10 burpees, 10 push-ups, 10 squats, 10 lunges. Repeat.", coachNotes: "Steady pace first 2 rounds, then push." },
  { name: "AMRAP: Solitary", duration: "4 min", notes: "20 push-ups, 20 squats, 20 mountain climbers. Until time.", coachNotes: "The walls are closing in. Keep moving." },
  { name: "AMRAP: Death Row", duration: "3 min", notes: "Push-ups to failure, then squats to failure, then burpees to failure.", coachNotes: "Real failure. Not 'I'm tired' failure." },
];

// Week progression for premium coaching
const ELITE_WEEK_PROGRESSIONS = [
  { 
    title: "Foundation Phase", 
    focusDescription: "Establish movement patterns. Focus on form and control. Build the neural pathways for strength.",
    restModifier: 0,
    repsModifier: 0,
    intensityNote: "RPE 7/10 - Challenging but sustainable"
  },
  { 
    title: "Building Phase", 
    focusDescription: "Increase volume and reduce rest. Push your limits while maintaining form.",
    restModifier: -5,
    repsModifier: 3,
    intensityNote: "RPE 8/10 - Working hard, 2 reps in reserve"
  },
  { 
    title: "Progression Phase", 
    focusDescription: "Maximum intensity. Test your will. This is where transformation happens.",
    restModifier: -10,
    repsModifier: 5,
    intensityNote: "RPE 9/10 - Near failure, 1 rep in reserve"
  },
  { 
    title: "Peak Phase", 
    focusDescription: "Consolidate gains. Maximum effort. Leave absolutely nothing on the table.",
    restModifier: -15,
    repsModifier: 0,
    intensityNote: "RPE 10/10 - All out effort to failure"
  },
];

// Split configurations
const ELITE_SPLIT_CONFIGS = {
  fullbody: {
    3: [
      { name: "Full Body Assault A", muscles: ["push", "pull", "legs", "core"] },
      { name: "Full Body Assault B", muscles: ["push", "pull", "legs", "core"] },
      { name: "Full Body Assault C", muscles: ["push", "pull", "legs", "core"] },
    ],
    4: [
      { name: "Full Body Assault A", muscles: ["push", "pull", "legs", "core"] },
      { name: "Full Body Assault B", muscles: ["push", "pull", "legs", "core"] },
      { name: "Full Body Assault C", muscles: ["push", "pull", "legs", "core"] },
      { name: "Full Body Assault D", muscles: ["push", "pull", "legs", "core"] },
    ],
  },
  upperlower: {
    4: [
      { name: "Upper Body Blitz A", muscles: ["push", "pull"] },
      { name: "Lower Body Grind A", muscles: ["legs", "core"] },
      { name: "Upper Body Blitz B", muscles: ["push", "pull"] },
      { name: "Lower Body Grind B", muscles: ["legs", "core"] },
    ],
    5: [
      { name: "Upper Body Blitz A", muscles: ["push", "pull"] },
      { name: "Lower Body Grind A", muscles: ["legs", "core"] },
      { name: "Upper Body Blitz B", muscles: ["push", "pull"] },
      { name: "Lower Body Grind B", muscles: ["legs", "core"] },
      { name: "Full Body Finisher", muscles: ["push", "pull", "legs", "core"] },
    ],
    6: [
      { name: "Upper Body Blitz A", muscles: ["push", "pull"] },
      { name: "Lower Body Grind A", muscles: ["legs", "core"] },
      { name: "Upper Body Blitz B", muscles: ["push", "pull"] },
      { name: "Lower Body Grind B", muscles: ["legs", "core"] },
      { name: "Upper Body Blitz C", muscles: ["push", "pull"] },
      { name: "Lower Body Grind C", muscles: ["legs", "core"] },
    ],
  },
  ppl: {
    3: [
      { name: "Push Day", muscles: ["push"] },
      { name: "Pull Day", muscles: ["pull"] },
      { name: "Leg Day", muscles: ["legs", "core"] },
    ],
    5: [
      { name: "Push Day A", muscles: ["push"] },
      { name: "Pull Day A", muscles: ["pull"] },
      { name: "Leg Day A", muscles: ["legs", "core"] },
      { name: "Push Day B", muscles: ["push"] },
      { name: "Pull Day B", muscles: ["pull"] },
    ],
    6: [
      { name: "Push A", muscles: ["push"] },
      { name: "Pull A", muscles: ["pull"] },
      { name: "Legs A", muscles: ["legs", "core"] },
      { name: "Push B", muscles: ["push"] },
      { name: "Pull B", muscles: ["pull"] },
      { name: "Legs B", muscles: ["legs", "core"] },
    ],
  },
  conditioning: {
    3: [
      { name: "HIIT Assault", muscles: ["push", "legs"] },
      { name: "Circuit Grind", muscles: ["pull", "core"] },
      { name: "Cardio Carnage", muscles: ["push", "legs"] },
    ],
    4: [
      { name: "HIIT Assault A", muscles: ["push", "legs"] },
      { name: "Circuit Grind", muscles: ["pull", "core"] },
      { name: "Cardio Carnage", muscles: ["push", "legs"] },
      { name: "HIIT Assault B", muscles: ["pull", "core"] },
    ],
    5: [
      { name: "HIIT Assault A", muscles: ["push", "legs"] },
      { name: "Circuit Grind A", muscles: ["pull", "core"] },
      { name: "Cardio Carnage", muscles: ["push", "pull"] },
      { name: "HIIT Assault B", muscles: ["legs", "core"] },
      { name: "Circuit Grind B", muscles: ["push", "core"] },
    ],
    6: [
      { name: "HIIT Assault A", muscles: ["push", "legs"] },
      { name: "Circuit Grind A", muscles: ["pull", "core"] },
      { name: "Cardio Carnage A", muscles: ["push", "pull"] },
      { name: "HIIT Assault B", muscles: ["legs", "core"] },
      { name: "Circuit Grind B", muscles: ["push", "core"] },
      { name: "Cardio Carnage B", muscles: ["pull", "legs"] },
    ],
  },
};

type WorkoutConfig = { name: string; muscles: string[] };

function getSplitConfig(templateName: string, daysPerWeek: number, categoryName: string): { split: string; workouts: WorkoutConfig[] } {
  const name = templateName.toLowerCase();
  
  let splitType: keyof typeof ELITE_SPLIT_CONFIGS = "fullbody";
  
  // Conditioning category
  if (categoryName.includes("Conditioning") || categoryName.includes("Athletic")) {
    splitType = "conditioning";
  }
  // PPL
  else if (name.includes("ppl") || name.includes("push pull") || (daysPerWeek === 6 && !name.includes("upper"))) {
    splitType = "ppl";
  }
  // Upper/Lower
  else if (name.includes("upper") || name.includes("lower") || daysPerWeek === 4 || daysPerWeek === 5) {
    splitType = "upperlower";
  }
  
  const config = ELITE_SPLIT_CONFIGS[splitType];
  const availableKeys = Object.keys(config).map(k => parseInt(k)).sort((a, b) => b - a);
  const matchingKey = availableKeys.find(k => k <= daysPerWeek) || availableKeys[availableKeys.length - 1];
  const workouts = config[matchingKey as keyof typeof config] as WorkoutConfig[];
  
  return { split: splitType, workouts };
}

function pickRandomExercises<T>(pool: T[], count: number, offset: number = 0): T[] {
  const result: T[] = [];
  const usedIndices = new Set<number>();
  
  for (let i = 0; i < count && i < pool.length; i++) {
    let idx = (offset + i) % pool.length;
    let attempts = 0;
    while (usedIndices.has(idx) && attempts < pool.length) {
      idx = (idx + 1) % pool.length;
      attempts++;
    }
    usedIndices.add(idx);
    result.push(pool[idx]);
  }
  
  return result;
}

function modifyReps(reps: string, modifier: number): string {
  if (reps.includes("-")) {
    const [min, max] = reps.split("-").map(r => parseInt(r.replace(/\D/g, '')));
    const suffix = reps.match(/\D+$/)?.[0] || '';
    return `${min + modifier}-${max + modifier}${suffix}`;
  }
  
  const num = parseInt(reps.replace(/\D/g, ''));
  if (!isNaN(num)) {
    const suffix = reps.match(/\D+$/)?.[0] || '';
    return `${num + modifier}${suffix}`;
  }
  
  return reps;
}

function modifyRest(rest: string, modifier: number): string {
  const seconds = parseInt(rest.replace(/\D/g, ''));
  if (!isNaN(seconds)) {
    return `${Math.max(15, seconds + modifier)}s`;
  }
  return rest;
}

interface GeneratedExercise {
  section_type: string;
  exercise_name: string;
  sets: string;
  reps_or_time: string;
  rest: string;
  notes: string;
  coach_notes: string;
  scaling_options: string;
  progression_notes: string;
  display_order: number;
}

function generateEliteWorkout(
  muscleGroups: string[],
  weekNum: number,
  workoutIndex: number,
  isConditioningDay: boolean
): GeneratedExercise[] {
  const exercises: GeneratedExercise[] = [];
  let order = 0;
  
  const progression = ELITE_WEEK_PROGRESSIONS[weekNum - 1];
  
  // SECTION 1: ACTIVATION (2-3 exercises)
  const activationPool = muscleGroups.includes("legs") || muscleGroups.includes("core")
    ? ELITE_EXERCISE_POOLS.activation.lower
    : ELITE_EXERCISE_POOLS.activation.upper;
  
  const activationExercises = pickRandomExercises(activationPool, 2, workoutIndex + weekNum);
  for (const ex of activationExercises) {
    exercises.push({
      section_type: "activation",
      exercise_name: ex.name,
      sets: ex.sets,
      reps_or_time: ex.reps,
      rest: ex.rest,
      notes: ex.notes,
      coach_notes: ex.coachNotes,
      scaling_options: ex.scalingOptions,
      progression_notes: ex.progressionNotes,
      display_order: order++,
    });
  }
  
  // SECTION 2: MOBILITY (2-3 exercises)
  const mobilityPool = muscleGroups.includes("legs") || muscleGroups.includes("core")
    ? ELITE_EXERCISE_POOLS.mobility.lower
    : ELITE_EXERCISE_POOLS.mobility.upper;
  
  const mobilityExercises = pickRandomExercises(mobilityPool, 2, workoutIndex + weekNum + 1);
  for (const ex of mobilityExercises) {
    exercises.push({
      section_type: "mobility",
      exercise_name: ex.name,
      sets: ex.sets,
      reps_or_time: ex.reps,
      rest: ex.rest,
      notes: ex.notes,
      coach_notes: ex.coachNotes,
      scaling_options: ex.scalingOptions,
      progression_notes: ex.progressionNotes,
      display_order: order++,
    });
  }
  
  // SECTION 3: STRENGTH BLOCK (4-5 exercises)
  const strengthExercises: GeneratedExercise[] = [];
  for (const group of muscleGroups) {
    const pool = ELITE_EXERCISE_POOLS.strength[group as keyof typeof ELITE_EXERCISE_POOLS.strength];
    if (pool) {
      const count = muscleGroups.length === 1 ? 4 : (muscleGroups.length === 2 ? 2 : 1);
      const selected = pickRandomExercises(pool, count, workoutIndex * 2 + weekNum);
      
      for (const ex of selected) {
        const modifiedReps = modifyReps(ex.reps, progression.repsModifier);
        const modifiedRest = modifyRest(ex.rest, progression.restModifier);
        
        strengthExercises.push({
          section_type: "strength",
          exercise_name: ex.name,
          sets: ex.sets,
          reps_or_time: modifiedReps,
          rest: modifiedRest,
          notes: `${ex.notes} [${progression.intensityNote}]`,
          coach_notes: ex.coachNotes,
          scaling_options: ex.scalingOptions,
          progression_notes: ex.progressionNotes,
          display_order: order++,
        });
      }
    }
  }
  exercises.push(...strengthExercises);
  
  // SECTION 4: ACCESSORY BLOCK (3-4 exercises)
  const accessoryExercises: GeneratedExercise[] = [];
  for (const group of muscleGroups) {
    const pool = ELITE_EXERCISE_POOLS.accessory[group as keyof typeof ELITE_EXERCISE_POOLS.accessory];
    if (pool) {
      const count = muscleGroups.length <= 2 ? 2 : 1;
      const selected = pickRandomExercises(pool, count, workoutIndex * 3 + weekNum);
      
      for (const ex of selected) {
        const modifiedReps = modifyReps(ex.reps, Math.floor(progression.repsModifier / 2));
        const modifiedRest = modifyRest(ex.rest, progression.restModifier);
        
        accessoryExercises.push({
          section_type: "accessory",
          exercise_name: ex.name,
          sets: ex.sets,
          reps_or_time: modifiedReps,
          rest: modifiedRest,
          notes: ex.notes,
          coach_notes: ex.coachNotes,
          scaling_options: ex.scalingOptions,
          progression_notes: ex.progressionNotes,
          display_order: order++,
        });
      }
    }
  }
  exercises.push(...accessoryExercises);
  
  // SECTION 5: CONDITIONING (2-3 exercises or 1 circuit)
  if (isConditioningDay) {
    const circuits = ELITE_EXERCISE_POOLS.conditioning.circuits;
    const selected = pickRandomExercises(circuits, 2, workoutIndex + weekNum);
    for (const ex of selected) {
      exercises.push({
        section_type: "conditioning",
        exercise_name: ex.name,
        sets: ex.sets,
        reps_or_time: ex.reps,
        rest: modifyRest(ex.rest, progression.restModifier),
        notes: ex.notes,
        coach_notes: ex.coachNotes,
        scaling_options: ex.scalingOptions,
        progression_notes: ex.progressionNotes,
        display_order: order++,
      });
    }
  } else {
    const hiit = ELITE_EXERCISE_POOLS.conditioning.hiit;
    const selected = pickRandomExercises(hiit, 1, workoutIndex + weekNum * 2);
    for (const ex of selected) {
      exercises.push({
        section_type: "conditioning",
        exercise_name: ex.name,
        sets: ex.sets,
        reps_or_time: ex.reps,
        rest: modifyRest(ex.rest, progression.restModifier),
        notes: ex.notes,
        coach_notes: ex.coachNotes,
        scaling_options: ex.scalingOptions,
        progression_notes: ex.progressionNotes,
        display_order: order++,
      });
    }
  }
  
  // Add AMRAP Finisher
  const finisher = ELITE_AMRAP_FINISHERS[(workoutIndex + weekNum) % ELITE_AMRAP_FINISHERS.length];
  exercises.push({
    section_type: "conditioning",
    exercise_name: finisher.name,
    sets: "1",
    reps_or_time: finisher.duration,
    rest: "0s",
    notes: finisher.notes,
    coach_notes: finisher.coachNotes,
    scaling_options: "Reduce time by 1 minute if needed.",
    progression_notes: "Add 30 seconds to duration each week.",
    display_order: order++,
  });
  
  // SECTION 6: RECOVERY (3-4 exercises)
  const stretchingExercises = pickRandomExercises(ELITE_EXERCISE_POOLS.recovery.stretching, 3, workoutIndex + weekNum);
  for (const ex of stretchingExercises) {
    exercises.push({
      section_type: "recovery",
      exercise_name: ex.name,
      sets: ex.sets,
      reps_or_time: ex.reps,
      rest: ex.rest,
      notes: ex.notes,
      coach_notes: ex.coachNotes,
      scaling_options: ex.scalingOptions,
      progression_notes: ex.progressionNotes,
      display_order: order++,
    });
  }
  
  // Add breathing
  const breathingExercise = ELITE_EXERCISE_POOLS.recovery.breathing[workoutIndex % ELITE_EXERCISE_POOLS.recovery.breathing.length];
  exercises.push({
    section_type: "recovery",
    exercise_name: breathingExercise.name,
    sets: breathingExercise.sets,
    reps_or_time: breathingExercise.reps,
    rest: breathingExercise.rest,
    notes: breathingExercise.notes,
    coach_notes: breathingExercise.coachNotes,
    scaling_options: breathingExercise.scalingOptions,
    progression_notes: breathingExercise.progressionNotes,
    display_order: order++,
  });
  
  return exercises;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { regenerate } = await req.json().catch(() => ({ regenerate: false }));

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
      regenerated: 0,
      errors: [] as string[],
    };

    for (const template of templates) {
      try {
        // Check if template already has weeks
        const { data: existingWeeks } = await supabase
          .from("program_template_weeks")
          .select("id")
          .eq("template_id", template.id);

        if (existingWeeks && existingWeeks.length > 0) {
          if (regenerate) {
            // Delete existing content to regenerate
            console.log(`Regenerating ${template.name}...`);
            
            for (const week of existingWeeks) {
              const { data: days } = await supabase
                .from("program_template_days")
                .select("id")
                .eq("week_id", week.id);
              
              if (days) {
                for (const day of days) {
                  await supabase
                    .from("program_template_exercises")
                    .delete()
                    .eq("day_id", day.id);
                }
                await supabase
                  .from("program_template_days")
                  .delete()
                  .eq("week_id", week.id);
              }
            }
            
            await supabase
              .from("program_template_weeks")
              .delete()
              .eq("template_id", template.id);
            
            results.regenerated++;
          } else {
            console.log(`Skipping ${template.name} - already populated`);
            results.skipped++;
            continue;
          }
        }

        const categoryName = template.category?.name || "Beginner Basics";
        const daysPerWeek = template.days_per_week || 4;
        const isConditioningCategory = categoryName.includes("Conditioning") || categoryName.includes("Athletic");
        
        const { split, workouts } = getSplitConfig(template.name, daysPerWeek, categoryName);
        const workoutDayIndices = getWorkoutDayIndices(daysPerWeek);

        console.log(`Populating ${template.name}: ${daysPerWeek} days/week, ${categoryName}, ${split} split`);

        // Create 4 weeks
        for (let weekNum = 1; weekNum <= 4; weekNum++) {
          const progression = ELITE_WEEK_PROGRESSIONS[weekNum - 1];
          
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
            
            const workoutConfig = workouts[workoutIndex % workouts.length];
            const workoutName = isWorkoutDay ? workoutConfig.name : "Rest & Recovery";

            const { data: day, error: dayError } = await supabase
              .from("program_template_days")
              .insert({
                week_id: week.id,
                day_of_week: dayName,
                workout_name: workoutName,
                workout_description: isWorkoutDay
                  ? `${progression.title} - ${workoutName}. ${progression.intensityNote}. Leave nothing in the tank.`
                  : "Active recovery. Light stretching, walking, or mobility work. Stay ready for tomorrow's battle.",
                is_rest_day: !isWorkoutDay,
                display_order: dayIndex,
              })
              .select()
              .single();

            if (dayError) throw dayError;

            // Add exercises for workout days
            if (isWorkoutDay) {
              const exercises = generateEliteWorkout(
                workoutConfig.muscles,
                weekNum,
                workoutIndex,
                isConditioningCategory
              );

              if (exercises.length > 0) {
                const { error: exercisesError } = await supabase
                  .from("program_template_exercises")
                  .insert(
                    exercises.map((ex) => ({
                      day_id: day.id,
                      section_type: ex.section_type,
                      exercise_name: ex.exercise_name,
                      sets: ex.sets,
                      reps_or_time: ex.reps_or_time,
                      rest: ex.rest,
                      notes: ex.notes,
                      coach_notes: ex.coach_notes,
                      scaling_options: ex.scaling_options,
                      progression_notes: ex.progression_notes,
                      display_order: ex.display_order,
                    }))
                  );

                if (exercisesError) throw exercisesError;
                
                console.log(`  ${dayName}: ${exercises.length} exercises across 6 sections`);
              }

              workoutIndex++;
            }
          }
        }

        results.populated++;
        console.log(`Successfully populated ${template.name} with Free World Elite programming`);

      } catch (err) {
        const error = err as Error;
        console.error(`Error populating ${template.name}:`, error.message);
        results.errors.push(`${template.name}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Free World Elite Programming: Populated ${results.populated} templates (${results.regenerated} regenerated), skipped ${results.skipped}. 12-18 exercises per day across 6 sections with coach notes.`,
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
