import { useState } from "react";
import { 
  Play, 
  PlayCircle, 
  Dumbbell, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle2,
  Flame,
  Zap,
  RefreshCw,
  Shield,
  Lightbulb,
  TrendingUp,
  Timer
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTTS } from "@/hooks/useTTS";
import { AudioPlayButton } from "@/components/AudioPlayButton";
import { RestTimer } from "@/components/workout/RestTimer";

interface Exercise {
  id: string;
  exercise_name: string;
  section_type: string;
  sets: string | null;
  reps_or_time: string | null;
  rest: string | null;
  notes: string | null;
  demo_url: string | null;
  scaling_options?: string | null;
  instructions?: string | null;
  form_tips?: string | null;
  muscles_targeted?: string | null;
}

interface ExerciseDetailDialogProps {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Get exercise instructions - prefer database content, fall back to hardcoded
const getExerciseInstructions = (exercise: Exercise): { 
  instructions: string[];
  formTips: string[];
  musclesWorked: string[];
  breathingCue: string;
  commonMistakes: string[];
} => {
  // Check if we have database content
  if (exercise.instructions || exercise.form_tips || exercise.muscles_targeted) {
    return {
      instructions: exercise.instructions?.split('\n').filter(Boolean) || ["Follow proper form as instructed by your coach"],
      formTips: exercise.form_tips?.split('\n').filter(Boolean) || ["Focus on controlled movement"],
      musclesWorked: exercise.muscles_targeted?.split(',').map(m => m.trim()).filter(Boolean) || ["Multiple muscle groups"],
      breathingCue: "Exhale on exertion, inhale on the return",
      commonMistakes: []
    };
  }
  
  // Fall back to hardcoded database
  return getHardcodedInstructions(exercise.exercise_name);
};

// Hardcoded instruction database for common exercises
const getHardcodedInstructions = (exerciseName: string): { 
  instructions: string[];
  formTips: string[];
  musclesWorked: string[];
  breathingCue: string;
  commonMistakes: string[];
} => {
  const exerciseLower = exerciseName.toLowerCase();
  
  // Push-up variations
  if (exerciseLower.includes("push-up") || exerciseLower.includes("pushup") || exerciseLower.includes("push up")) {
    return {
      instructions: [
        "Start in a high plank position with hands shoulder-width apart",
        "Keep your core tight and body in a straight line from head to heels",
        "Lower your chest toward the ground by bending your elbows",
        "Keep elbows at a 45-degree angle from your body",
        "Push through your palms to return to the starting position",
        "Squeeze your chest at the top of the movement"
      ],
      formTips: [
        "Don't let your hips sag or pike up",
        "Keep your head neutral, eyes looking slightly ahead",
        "Fully extend arms at the top without locking elbows"
      ],
      musclesWorked: ["Chest", "Triceps", "Shoulders", "Core"],
      breathingCue: "Inhale on the way down, exhale as you push up",
      commonMistakes: [
        "Flaring elbows too wide (causes shoulder strain)",
        "Not going low enough for full range of motion",
        "Letting hips drop or pike up breaking the plank"
      ]
    };
  }
  
  // Pull-up variations
  if (exerciseLower.includes("pull-up") || exerciseLower.includes("pullup") || exerciseLower.includes("pull up") || exerciseLower.includes("chin-up") || exerciseLower.includes("chinup")) {
    return {
      instructions: [
        "Grip the bar with hands shoulder-width apart (overhand for pull-ups, underhand for chin-ups)",
        "Hang with arms fully extended, shoulders engaged (not shrugged to ears)",
        "Pull your chest toward the bar by driving elbows down and back",
        "Lead with your chest, not your chin - imagine pulling through your elbows",
        "Pause briefly when your chin clears the bar",
        "Lower under control to full extension before the next rep"
      ],
      formTips: [
        "Engage lats before pulling by depressing shoulders",
        "Avoid swinging or kipping - strict form builds real strength",
        "Squeeze shoulder blades together at the top"
      ],
      musclesWorked: ["Lats", "Biceps", "Rear Delts", "Core", "Forearms"],
      breathingCue: "Exhale as you pull up, inhale on the way down",
      commonMistakes: [
        "Using momentum and swinging",
        "Not going to full extension at the bottom",
        "Only pulling until chin barely reaches bar"
      ]
    };
  }
  
  // Rows (inverted rows, dumbbell rows, etc.)
  if (exerciseLower.includes("row") && !exerciseLower.includes("renegade")) {
    return {
      instructions: [
        "Set up with your back flat and core braced",
        "For dumbbell rows: hinge at hips, one hand on bench for support",
        "For inverted rows: hang under a bar with body straight",
        "Pull the weight (or your body) toward your hip/ribcage",
        "Squeeze your shoulder blade back and down at the top",
        "Lower under control, feeling the stretch in your lats"
      ],
      formTips: [
        "Don't round your back - keep it flat throughout",
        "Pull to your hip, not your armpit",
        "Lead with your elbow, not your hand"
      ],
      musclesWorked: ["Lats", "Rhomboids", "Rear Delts", "Biceps", "Core"],
      breathingCue: "Exhale as you pull, inhale as you lower",
      commonMistakes: [
        "Rounding the back during the pull",
        "Using too much bicep instead of back",
        "Not getting full range of motion"
      ]
    };
  }
  
  // Dips
  if (exerciseLower.includes("dip")) {
    return {
      instructions: [
        "Grip the parallel bars or bench with arms straight",
        "Keep your chest up and shoulders down and back",
        "Lower your body by bending elbows to at least 90 degrees",
        "Lean slightly forward to target chest, stay upright for triceps",
        "Press through your palms to push back up",
        "Lock out arms at the top without hyperextending"
      ],
      formTips: [
        "Don't let shoulders roll forward at the bottom",
        "Keep core tight to prevent swinging",
        "Control the descent - don't drop"
      ],
      musclesWorked: ["Triceps", "Chest", "Shoulders", "Core"],
      breathingCue: "Inhale on the way down, exhale as you push up",
      commonMistakes: [
        "Not going deep enough (90 degrees minimum)",
        "Shoulders rolling forward at the bottom",
        "Flaring elbows too wide"
      ]
    };
  }
  
  // Deadlifts (Romanian, conventional, etc.)
  if (exerciseLower.includes("deadlift") || exerciseLower.includes("rdl")) {
    return {
      instructions: [
        "Stand with feet hip-width apart, weight in front of thighs",
        "Brace your core and pull shoulders back and down",
        "Hinge at hips, pushing them back while keeping back flat",
        "Lower the weight along your legs, feeling hamstring stretch",
        "Once you feel maximum stretch, drive hips forward to stand",
        "Squeeze glutes hard at the top - don't hyperextend back"
      ],
      formTips: [
        "Keep the weight close to your body throughout",
        "Don't round your lower back - flat back always",
        "Think 'hips back' not 'bend over'"
      ],
      musclesWorked: ["Hamstrings", "Glutes", "Lower Back", "Core", "Traps"],
      breathingCue: "Inhale at the top, hold during descent, exhale standing up",
      commonMistakes: [
        "Rounding the lower back",
        "Bending knees too much (not a squat)",
        "Looking up and hyperextending neck"
      ]
    };
  }
  
  // Bench Press / Floor Press
  if (exerciseLower.includes("bench") || exerciseLower.includes("floor press") || exerciseLower.includes("chest press")) {
    return {
      instructions: [
        "Lie on bench with feet flat on floor, slight arch in lower back",
        "Grip bar slightly wider than shoulder width",
        "Unrack and position bar directly over your chest",
        "Lower bar to mid-chest with elbows at 45-degree angle",
        "Touch chest lightly, pause briefly",
        "Press back up in a slight arc to lockout over shoulders"
      ],
      formTips: [
        "Keep shoulder blades pinched together",
        "Drive your feet into the floor for stability",
        "Don't bounce the bar off your chest"
      ],
      musclesWorked: ["Chest", "Triceps", "Front Delts"],
      breathingCue: "Inhale as you lower, exhale as you press",
      commonMistakes: [
        "Flaring elbows to 90 degrees (bad for shoulders)",
        "Bouncing bar off chest",
        "Lifting hips off the bench"
      ]
    };
  }
  
  // Shoulder Press / Overhead Press
  if (exerciseLower.includes("shoulder press") || exerciseLower.includes("overhead") || exerciseLower.includes("military press") || exerciseLower.includes("arnold")) {
    return {
      instructions: [
        "Stand or sit with core braced and back straight",
        "Hold weights at shoulder height, palms facing forward",
        "Press straight overhead until arms are fully extended",
        "Don't lean back - keep your ribcage down",
        "Lower under control back to shoulder height",
        "For Arnold press: start palms facing you, rotate as you press"
      ],
      formTips: [
        "Keep core tight to protect lower back",
        "Don't arch your back excessively",
        "Press in a slight arc, not straight up"
      ],
      musclesWorked: ["Shoulders", "Triceps", "Upper Chest", "Core"],
      breathingCue: "Exhale as you press up, inhale as you lower",
      commonMistakes: [
        "Excessive back arch (turns it into incline press)",
        "Not going to full lockout",
        "Letting ribs flare out"
      ]
    };
  }
  
  // Squat variations
  if (exerciseLower.includes("squat")) {
    return {
      instructions: [
        "Stand with feet shoulder-width apart or slightly wider",
        "Point toes slightly outward (about 15-30 degrees)",
        "Brace your core and keep chest up throughout",
        "Initiate movement by pushing hips back, then bending knees",
        "Lower until thighs are at least parallel to ground",
        "Drive through your heels to stand back up explosively"
      ],
      formTips: [
        "Keep knees tracking over your toes",
        "Maintain a neutral spine - don't round your back",
        "Weight should be in your heels, not toes"
      ],
      musclesWorked: ["Quads", "Glutes", "Hamstrings", "Core"],
      breathingCue: "Inhale on the way down, exhale as you stand",
      commonMistakes: [
        "Knees caving inward (weak glutes)",
        "Lifting heels off the ground",
        "Rounding lower back at the bottom"
      ]
    };
  }
  
  // Plank variations
  if (exerciseLower.includes("plank")) {
    return {
      instructions: [
        "Start in a forearm plank with elbows under shoulders",
        "Create a straight line from head to heels",
        "Engage your core by drawing belly button to spine",
        "Squeeze glutes to maintain hip position",
        "Keep neck neutral, eyes looking at the floor",
        "Hold the position, breathing steadily throughout"
      ],
      formTips: [
        "Don't let hips sag or pike up",
        "Spread your shoulder blades apart for stability",
        "Imagine bracing for a punch to engage core"
      ],
      musclesWorked: ["Core", "Shoulders", "Back", "Glutes"],
      breathingCue: "Breathe steadily - don't hold your breath",
      commonMistakes: [
        "Hips too high or too low",
        "Holding breath and tensing up",
        "Looking up and straining neck"
      ]
    };
  }
  
  // Burpees
  if (exerciseLower.includes("burpee")) {
    return {
      instructions: [
        "Start standing with feet shoulder-width apart",
        "Squat down and place hands on the floor",
        "Jump or step feet back into plank position",
        "Perform a push-up (optional for intensity)",
        "Jump or step feet forward to hands",
        "Explosively jump up with arms overhead"
      ],
      formTips: [
        "Land softly when jumping back to plank",
        "Maintain core tension throughout",
        "Use full hip extension on the jump"
      ],
      musclesWorked: ["Full Body", "Cardio", "Core", "Legs"],
      breathingCue: "Exhale on the jump, inhale as you land",
      commonMistakes: [
        "Rushing through with sloppy form",
        "Not fully extending on the jump",
        "Landing with locked knees"
      ]
    };
  }
  
  // Lunges
  if (exerciseLower.includes("lunge")) {
    return {
      instructions: [
        "Stand tall with feet hip-width apart",
        "Take a controlled step forward (or backward for reverse lunge)",
        "Lower your body until both knees are at 90 degrees",
        "Front knee should stay over your ankle",
        "Push through front heel to return to standing",
        "Alternate legs or complete all reps on one side"
      ],
      formTips: [
        "Keep torso upright throughout",
        "Don't let front knee cave inward",
        "Control the descent - don't slam back knee down"
      ],
      musclesWorked: ["Quads", "Glutes", "Hamstrings", "Core"],
      breathingCue: "Inhale on the way down, exhale pushing up",
      commonMistakes: [
        "Taking too short a step",
        "Front knee traveling past toes",
        "Leaning forward or losing balance"
      ]
    };
  }
  
  // Mountain Climbers
  if (exerciseLower.includes("mountain climber")) {
    return {
      instructions: [
        "Start in a high plank position",
        "Drive one knee toward your chest",
        "Quickly switch legs, extending the bent leg back",
        "Keep hips low and core engaged",
        "Move at a quick, running pace",
        "Maintain steady breathing throughout"
      ],
      formTips: [
        "Keep hips level - don't let them bounce",
        "Hands should stay directly under shoulders",
        "Focus on speed while maintaining form"
      ],
      musclesWorked: ["Core", "Shoulders", "Hip Flexors", "Cardio"],
      breathingCue: "Breathe rhythmically with each leg switch",
      commonMistakes: [
        "Hips bouncing up and down",
        "Not bringing knees far enough forward",
        "Letting core disengage"
      ]
    };
  }
  
  // Bicep Curls
  if (exerciseLower.includes("curl") && (exerciseLower.includes("bicep") || exerciseLower.includes("hammer") || exerciseLower.includes("21"))) {
    return {
      instructions: [
        "Stand with feet shoulder-width apart, weights at sides",
        "Keep elbows pinned to your sides throughout",
        "Curl weights toward shoulders by bending elbows",
        "Squeeze biceps hard at the top of the movement",
        "Lower under control - 2-3 seconds on the way down",
        "Don't swing the weights - strict form only"
      ],
      formTips: [
        "Keep upper arms completely still",
        "Don't use momentum from your hips",
        "Slow negatives build more muscle"
      ],
      musclesWorked: ["Biceps", "Forearms", "Brachialis"],
      breathingCue: "Exhale as you curl up, inhale as you lower",
      commonMistakes: [
        "Swinging the weight with hip momentum",
        "Not controlling the negative",
        "Elbows drifting forward"
      ]
    };
  }
  
  // Lateral Raises
  if (exerciseLower.includes("lateral raise") || exerciseLower.includes("side raise")) {
    return {
      instructions: [
        "Stand with weights at your sides, slight bend in elbows",
        "Lead with your elbows, not your hands",
        "Raise arms out to the sides until parallel with floor",
        "Pause briefly at the top - feel the burn",
        "Lower under control, don't just drop",
        "Keep slight forward lean to hit side delts"
      ],
      formTips: [
        "Lead with elbows, hands follow",
        "Don't go above shoulder height",
        "Keep a slight bend in elbows"
      ],
      musclesWorked: ["Side Delts", "Traps", "Forearms"],
      breathingCue: "Exhale as you raise, inhale as you lower",
      commonMistakes: [
        "Using too much weight and swinging",
        "Raising arms too high (traps take over)",
        "Letting hands go higher than elbows"
      ]
    };
  }
  
  // Thrusters
  if (exerciseLower.includes("thruster")) {
    return {
      instructions: [
        "Hold weights at shoulder height, feet shoulder-width apart",
        "Squat down until thighs are parallel or below",
        "Explode up out of the squat using leg drive",
        "Use momentum to press weights overhead in one fluid motion",
        "Lock out arms at the top, biceps by ears",
        "Lower weights back to shoulders as you descend into next squat"
      ],
      formTips: [
        "Make it one smooth movement - squat flows into press",
        "Use your legs to help drive the weight up",
        "Keep core braced throughout"
      ],
      musclesWorked: ["Quads", "Glutes", "Shoulders", "Core", "Triceps"],
      breathingCue: "Inhale at bottom, exhale as you press up",
      commonMistakes: [
        "Pausing between squat and press",
        "Not using enough leg drive",
        "Letting knees cave in on the squat"
      ]
    };
  }
  
  // Default for any exercise
  return {
    instructions: [
      "Read the coach's notes for specific instructions",
      "Focus on controlled, quality movement",
      "Maintain proper posture throughout",
      "If you feel pain (not discomfort), stop immediately",
      "Scale the exercise as needed for your level"
    ],
    formTips: [
      "Control the movement - don't rush",
      "Full range of motion over partial reps",
      "Quality over quantity every time"
    ],
    musclesWorked: ["Check notes for target muscles"],
    breathingCue: "Exhale on exertion, inhale on the return",
    commonMistakes: [
      "Rushing through reps",
      "Using momentum instead of muscle",
      "Skipping the warm-up"
    ]
  };
};

const getSectionInfo = (sectionType: string) => {
  switch (sectionType.toLowerCase()) {
    case "warmup":
      return { label: "Warm-Up", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Clock };
    case "main":
      return { label: "Main Work", color: "bg-primary/20 text-primary border-primary/30", icon: Dumbbell };
    case "finisher":
      return { label: "Finisher", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: Flame };
    case "cooldown":
      return { label: "Cool-Down", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: RefreshCw };
    default:
      return { label: sectionType, color: "bg-muted text-muted-foreground", icon: Dumbbell };
  }
};

const ExerciseDetailDialog = ({ exercise, open, onOpenChange }: ExerciseDetailDialogProps) => {
  const [activeTab, setActiveTab] = useState("howto");
  const tts = useTTS();
  
  if (!exercise) return null;
  
  const exerciseData = getExerciseInstructions(exercise);
  const sectionInfo = getSectionInfo(exercise.section_type);
  const SectionIcon = sectionInfo.icon;

  const handleListenToInstructions = () => {
    const parts = [
      `${exercise.exercise_name}.`,
      ...exerciseData.instructions,
      `Form tips: ${exerciseData.formTips.join(". ")}.`,
      `Breathing cue: ${exerciseData.breathingCue}.`,
    ];
    tts.speak(parts.join(" "));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader className="pb-4 border-b border-border">
          {/* Header with gradient */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-amber-500/20 flex items-center justify-center shrink-0">
              <Dumbbell className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge className={sectionInfo.color}>
                  <SectionIcon className="w-3 h-3 mr-1" />
                  {sectionInfo.label}
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-display">
                {exercise.exercise_name}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* Workout Parameters */}
        <div className="grid grid-cols-3 gap-3 py-4">
          {exercise.sets && (
            <div className="bg-charcoal rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Sets</p>
              <p className="text-xl font-bold text-primary">{exercise.sets}</p>
            </div>
          )}
          {exercise.reps_or_time && (
            <div className="bg-charcoal rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Reps/Time</p>
              <p className="text-xl font-bold">{exercise.reps_or_time}</p>
            </div>
          )}
          {exercise.rest && (
            <div className="bg-charcoal rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Rest</p>
              <p className="text-xl font-bold text-muted-foreground">{exercise.rest}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-charcoal p-1 rounded-lg">
            <TabsTrigger 
              value="howto" 
              className="flex items-center gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-amber-500/10 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_-3px_hsl(43_74%_49%_/_0.3)] transition-all"
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">How To</span>
            </TabsTrigger>
            <TabsTrigger 
              value="form" 
              className="flex items-center gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-amber-500/10 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_-3px_hsl(43_74%_49%_/_0.3)] transition-all"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Form</span>
            </TabsTrigger>
            <TabsTrigger 
              value="timer" 
              className="flex items-center gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-amber-500/10 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_-3px_hsl(43_74%_49%_/_0.3)] transition-all"
            >
              <Timer className="w-4 h-4" />
              <span className="hidden sm:inline">Rest</span>
            </TabsTrigger>
            <TabsTrigger 
              value="video" 
              className="flex items-center gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-amber-500/10 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_-3px_hsl(43_74%_49%_/_0.3)] transition-all"
            >
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Demo</span>
            </TabsTrigger>
          </TabsList>

          {/* How To Tab */}
          <TabsContent value="howto" className="space-y-4 mt-4">
            {/* Step by step instructions */}
            <div className="bg-charcoal rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-primary flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Step-by-Step Instructions
                </h4>
                <AudioPlayButton
                  variant="compact"
                  label="Listen"
                  isLoading={tts.isLoading}
                  isPlaying={tts.isPlaying}
                  isPaused={tts.isPaused}
                  onClick={handleListenToInstructions}
                  onStop={tts.stop}
                />
              </div>
              <div className="space-y-3">
                {exerciseData.instructions.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-muted-foreground pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Breathing cue */}
            <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Breathing</span>
              </div>
              <p className="text-sm text-muted-foreground">{exerciseData.breathingCue}</p>
            </div>

            {/* Muscles worked */}
            <div className="bg-charcoal rounded-lg p-4">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Muscles Worked
              </h4>
              <div className="flex flex-wrap gap-2">
                {exerciseData.musclesWorked.map((muscle, i) => (
                  <Badge key={i} variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Form Tips Tab */}
          <TabsContent value="form" className="space-y-4 mt-4">
            {/* Form checkpoints */}
            <div className="bg-charcoal rounded-lg p-4">
              <h4 className="font-semibold text-green-400 flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5" />
                Form Checkpoints
              </h4>
              <div className="space-y-3">
                {exerciseData.formTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-green-500/5 rounded-lg border border-green-500/10">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Common mistakes */}
            <div className="bg-charcoal rounded-lg p-4">
              <h4 className="font-semibold text-destructive flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5" />
                Common Mistakes to Avoid
              </h4>
              <div className="space-y-3">
                {exerciseData.commonMistakes.map((mistake, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/10">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{mistake}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Scaling options if available */}
            {exercise.scaling_options && (
              <div className="bg-gradient-to-r from-primary/10 to-amber-500/5 border border-primary/20 rounded-lg p-4">
                <h4 className="font-semibold text-primary flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4" />
                  Scaling Options
                </h4>
                <p className="text-sm text-muted-foreground">{exercise.scaling_options}</p>
              </div>
            )}
          </TabsContent>

          {/* Rest Timer Tab */}
          <TabsContent value="timer" className="mt-4">
            <div className="bg-charcoal rounded-lg p-6">
              <div className="text-center mb-4">
                <h4 className="font-semibold text-primary flex items-center justify-center gap-2">
                  <Timer className="w-5 h-5" />
                  Rest Timer
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Take your rest between sets. You'll hear when it's time to work.
                </p>
              </div>
              <RestTimer 
                defaultDuration={exercise.rest ? parseInt(exercise.rest) || 60 : 60}
                presets={[30, 45, 60, 90, 120]}
              />
            </div>
          </TabsContent>

          {/* Video Demo Tab */}
          <TabsContent value="video" className="space-y-4 mt-4">
            {exercise.demo_url ? (
              <div className="aspect-video rounded-lg overflow-hidden bg-charcoal">
                <video
                  src={exercise.demo_url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-lg bg-charcoal flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <PlayCircle className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Demo Video Coming Soon</p>
                  <p className="text-sm mt-1">Check the instructions tab for detailed guidance</p>
                </div>
              </div>
            )}

            {/* Coach notes */}
            {exercise.notes && (
              <div className="bg-gradient-to-r from-primary/10 to-amber-500/5 border border-primary/20 rounded-lg p-4">
                <h4 className="font-semibold text-primary flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4" />
                  Coach's Notes
                </h4>
                <p className="text-sm text-muted-foreground">{exercise.notes}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseDetailDialog;
