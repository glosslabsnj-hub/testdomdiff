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
  TrendingUp
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
}

interface ExerciseDetailDialogProps {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Exercise instruction database - expandable by admin in future
const getExerciseInstructions = (exerciseName: string): { 
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
  
  if (!exercise) return null;
  
  const exerciseData = getExerciseInstructions(exercise.exercise_name);
  const sectionInfo = getSectionInfo(exercise.section_type);
  const SectionIcon = sectionInfo.icon;

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
          <TabsList className="grid w-full grid-cols-3 bg-charcoal p-1 rounded-lg">
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
              <span className="hidden sm:inline">Form Tips</span>
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
              <h4 className="font-semibold text-primary flex items-center gap-2 mb-4">
                <Target className="w-5 h-5" />
                Step-by-Step Instructions
              </h4>
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
