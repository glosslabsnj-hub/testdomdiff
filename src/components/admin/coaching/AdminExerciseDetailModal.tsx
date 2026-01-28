import { useState, useCallback } from "react";
import {
  Dumbbell,
  Target,
  Shield,
  Timer,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Zap,
  TrendingUp,
  Edit2,
  Eye,
  Save,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { TemplateExercise } from "@/hooks/useProgramTemplates";

interface AdminExerciseDetailModalProps {
  exercise: TemplateExercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Default instructions for common exercises when no custom content exists
const getDefaultContent = (exerciseName: string) => {
  const lower = exerciseName.toLowerCase();
  
  const defaults: Record<string, { instructions: string; formTips: string; muscles: string; scaling: string }> = {
    "push-up": {
      instructions: "SET UP: Place hands slightly wider than shoulder-width, fingers spread and pointing forward. Position your body in a straight line from head to heels—imagine a steel rod running through your spine.\n\nTHE DESCENT: Inhale as you bend your elbows, lowering your chest toward the ground. Keep elbows at a 45-degree angle to your body (not flared out). Lower until your chest is 1-2 inches from the floor.\n\nTHE DRIVE: Exhale forcefully as you press through your palms. Focus on squeezing your chest muscles together. Lock out at the top without hyperextending elbows.\n\nTEMPO: Use a controlled 2-second descent, pause briefly at the bottom, then explosive 1-second push. This maximizes muscle engagement and time under tension.\n\nMIND-MUSCLE: Visualize your chest muscles doing the work. Don't just push—actively contract and squeeze throughout the movement.",
      formTips: "Keep your core braced like you're about to take a punch—no sagging hips or piking\nMaintain a neutral neck by looking at a spot 6 inches in front of your hands\nGrip the ground with your fingertips for stability\nSqueeze your glutes to maintain hip alignment\nAt the top, protract your shoulder blades slightly for full range",
      muscles: "Primary: Chest (Pectoralis Major), Triceps\nSecondary: Front Deltoids, Serratus Anterior\nStabilizers: Core, Lower Back, Glutes",
      scaling: "EASIER: Incline push-ups on a bench or wall, or knee push-ups\nHARDER: Deficit push-ups, diamond push-ups, or add a weight vest",
    },
    "squat": {
      instructions: "SET UP: Stand with feet shoulder-width apart or slightly wider. Point toes out 15-30 degrees. Arms can be crossed at chest, extended forward, or hands behind head.\n\nINITIATE: Begin by pushing your hips BACK first, like sitting into a chair behind you. This loads your posterior chain properly. Keep your chest proud and eyes forward.\n\nTHE DESCENT: Bend at hips and knees simultaneously while maintaining a vertical torso. Track knees over toes—they should point the same direction as your feet. Descend until hip crease drops below knee level (parallel or deeper).\n\nTHE DRIVE: Press through your WHOLE foot—heels AND balls of feet. Drive your knees out as you stand. Squeeze glutes hard at the top. Don't hyperextend your lower back.\n\nBREATHING: Big breath into your belly before descending (brace), hold through the bottom, exhale as you drive up past the sticking point.",
      formTips: "Weight should be distributed 60% heels, 40% balls of feet—never on toes\nKeep your chest up by imagining someone has a string attached to your sternum\nDon't let knees cave inward—actively push them out over pinky toes\nMaintain a neutral spine—no excessive forward lean or rounding\nIf heels rise, work on ankle mobility or elevate heels slightly",
      muscles: "Primary: Quadriceps, Glutes, Hamstrings\nSecondary: Adductors, Hip Flexors\nStabilizers: Core, Spinal Erectors, Calves",
      scaling: "EASIER: Box squats, goblet squats, or reduce depth\nHARDER: Pause squats, jump squats, single-leg variations",
    },
    "pull-up": {
      instructions: "SET UP: Grip the bar with hands shoulder-width apart, palms facing away (overhand). Start from a dead hang with arms fully extended and shoulders engaged (not shrugged to ears).\n\nENGAGE FIRST: Before pulling, depress your shoulder blades (pull them down and back). This activates your lats and protects your shoulders. You should feel your chest lift slightly.\n\nTHE PULL: Drive your elbows DOWN and BACK, not just bending them. Imagine pulling the bar to your chest, not pulling yourself to the bar. Lead with your chest, not your chin.\n\nTHE TOP: Pull until your chin clears the bar OR chest touches it. Squeeze your back muscles hard for 1 second. Your body should remain relatively straight—no excessive kipping or swinging.\n\nTHE DESCENT: Lower yourself under control for 2-3 seconds. Don't just drop. Return to a full dead hang before the next rep to ensure complete range of motion.",
      formTips: "Keep your core tight to prevent swinging—imagine someone is about to punch your stomach\nAvoid craning your neck to get chin over bar—this means you're not truly completing the rep\nSqueeze your glutes to maintain body alignment\nThink 'elbows to hips' to maximize lat engagement\nDon't use momentum—each rep should be strict and controlled",
      muscles: "Primary: Latissimus Dorsi (Lats), Biceps\nSecondary: Rear Deltoids, Rhomboids, Trapezius\nStabilizers: Core, Forearms, Brachialis",
      scaling: "EASIER: Band-assisted pull-ups, negative pull-ups (slow descent only), or inverted rows\nHARDER: Weighted pull-ups, L-sit pull-ups, archer pull-ups",
    },
    "plank": {
      instructions: "SET UP: Position yourself on forearms and toes. Elbows directly under shoulders, forearms parallel or hands clasped. Feet hip-width apart for stability.\n\nALIGNMENT: Create one straight line from head to heels. Don't let hips sag (common mistake) or pike up. Your back should be flat enough to balance a glass of water.\n\nENGAGE EVERYTHING: Brace your core like you're about to be punched. Squeeze glutes hard. Push forearms into the ground. Pull belly button toward spine. Squeeze quads to lock legs straight.\n\nBREATHING: This is crucial—don't hold your breath. Breathe steadily through the hold. Small, controlled breaths while maintaining tension.\n\nMENTAL FOCUS: When it burns, focus on your breathing and form. The plank is as much mental as physical. Stay present with each second.",
      formTips: "Look at a spot between your hands to maintain neutral neck—don't look up or tuck chin\nSpread shoulder blades apart (protraction) to engage serratus anterior\nImagine pulling elbows toward toes and toes toward elbows (without moving) to increase core engagement\nIf low back starts hurting, you've lost form—reset or take a break\nKeep shoulders away from ears—stay long through the neck",
      muscles: "Primary: Rectus Abdominis, Transverse Abdominis\nSecondary: Obliques, Erector Spinae\nStabilizers: Shoulders, Glutes, Quadriceps",
      scaling: "EASIER: Knee plank, incline plank on bench, or shorter hold times\nHARDER: Single-arm plank, feet-elevated plank, plank with shoulder taps",
    },
    "burpee": {
      instructions: "SET UP: Stand with feet shoulder-width apart, arms at your sides. This is your starting and ending position for each rep.\n\nDROP: Bend knees and hinge at hips, placing hands on the floor in front of you. Jump or step feet back into a high plank position.\n\nPUSH-UP (optional): Lower chest to the ground and press back up. For strict burpees, this is required. For speed burpees, you can skip this.\n\nJUMP IN: Explosively jump or step feet back toward hands. Land with feet outside your hands in a deep squat position.\n\nJUMP UP: Explode upward, jumping as high as possible. Reach arms overhead. Land softly with bent knees, immediately flowing into the next rep.\n\nRHYTHM: Find a sustainable pace. It's better to maintain consistent reps than to sprint and burn out.",
      formTips: "Keep core tight throughout—don't let hips sag in the plank\nLand softly on the jump to protect joints\nHands should be directly under shoulders in plank position\nMaintain control even when fatigued—sloppy burpees lead to injury\nBreathe out on the jump up, breathe in on the way down",
      muscles: "Primary: Full Body—Chest, Shoulders, Quads, Glutes\nSecondary: Triceps, Core, Hamstrings\nCardiovascular: High heart rate elevation",
      scaling: "EASIER: Step back/forward instead of jumping, remove the push-up, or remove the jump\nHARDER: Add a tuck jump, add a push-up, or add a lateral jump",
    },
    "lunge": {
      instructions: "SET UP: Stand tall with feet hip-width apart. Hands on hips, at sides, or holding weights.\n\nSTEP: Take a large step forward (about 2-3 feet). Your stance should be wide enough to allow both knees to reach 90 degrees.\n\nDESCEND: Lower straight down by bending both knees. Front knee tracks over ankle (not past toes). Back knee lowers toward the floor, stopping 1-2 inches from ground.\n\nBODY POSITION: Torso stays upright—don't lean forward. Keep hips square (facing forward). Weight distributed evenly between both legs.\n\nRETURN: Push through the front heel to drive back to standing. Squeeze front glute as you rise. Alternate legs or complete all reps on one side.",
      formTips: "Keep front knee stable—don't let it cave inward or drift past toes\nStep far enough forward to protect the front knee\nMaintain upright posture—engage core to prevent forward lean\nBack heel will naturally lift—stay on the ball of back foot\nLook straight ahead to help with balance",
      muscles: "Primary: Quadriceps, Glutes, Hamstrings\nSecondary: Hip Flexors, Adductors, Calves\nStabilizers: Core, Hip Stabilizers",
      scaling: "EASIER: Shorter range of motion, hold onto support, or reverse lunges\nHARDER: Walking lunges, jumping lunges, deficit lunges",
    },
    "dip": {
      instructions: "SET UP: Grip parallel bars or stable surfaces with arms straight. Support your full body weight with locked elbows. Lean slightly forward for chest emphasis, stay upright for triceps.\n\nDESCEND: Lower by bending elbows, keeping them close to body or slightly flared. Go down until upper arms are parallel to the ground or you feel a stretch in the chest.\n\nDEPTH: Don't go too deep too soon—this can strain shoulders. Build depth gradually over time. The bottom position should feel like a controlled stretch, not pain.\n\nPRESS: Drive through palms to push yourself back up. Focus on squeezing triceps and chest. Lock out at the top without hyperextending.\n\nBODY CONTROL: Minimize swinging. Keep legs still—crossed or straight. Control the movement throughout.",
      formTips: "Keep shoulders down and back—don't shrug toward ears\nLean forward slightly for more chest activation, stay upright for triceps\nDon't flare elbows excessively—this stresses the shoulder joint\nIf you feel shoulder pain, reduce depth or skip the exercise\nKeep core engaged to control body position",
      muscles: "Primary: Triceps, Chest (Pectoralis Major)\nSecondary: Front Deltoids, Rhomboids\nStabilizers: Core, Serratus Anterior",
      scaling: "EASIER: Bench dips, band-assisted dips, or machine dips\nHARDER: Weighted dips, ring dips, Korean dips",
    },
    "row": {
      instructions: "SET UP: For bent-over row—hinge at hips with slight knee bend. Back flat, chest up, looking at the ground a few feet ahead. Arms hang straight down.\n\nGRIP: Hold weight with chosen grip. Overhand (palms down) targets upper back. Underhand (palms up) engages more biceps. Neutral grip is balanced.\n\nTHE PULL: Drive elbows back and up, squeezing shoulder blades together. Pull to your hip or lower rib area, not to your chest. Think 'elbows to ceiling.'\n\nTHE SQUEEZE: At the top, pause and squeeze your back muscles for 1-2 seconds. Feel the contraction between your shoulder blades.\n\nTHE LOWER: Control the weight back down. Don't just drop it. Full extension at the bottom for complete range of motion.",
      formTips: "Keep back flat throughout—don't round spine to get more weight\nHips stay back, chest stays proud\nAvoid using momentum or body english to swing weight up\nElbow path should be close to body, not flared out\nMaintain neutral neck—don't crane to look up",
      muscles: "Primary: Latissimus Dorsi, Rhomboids, Trapezius\nSecondary: Biceps, Rear Deltoids\nStabilizers: Core, Spinal Erectors, Hamstrings",
      scaling: "EASIER: Inverted rows, cable rows, or lighter weight with pause\nHARDER: Single-arm rows, Pendlay rows, heavy barbell rows",
    },
  };

  // Find matching default
  for (const [key, value] of Object.entries(defaults)) {
    if (lower.includes(key)) {
      return value;
    }
  }

  return {
    instructions: "SET UP: Position your body with proper alignment for this movement. Engage your core and establish a stable base.\n\nEXECUTION: Perform each rep with controlled tempo—typically 2 seconds down, brief pause, 1 second up. Focus on the muscles you're targeting.\n\nBREATHING: Exhale during the exertion (hardest part), inhale during the easier portion. Never hold your breath.\n\nRANGE OF MOTION: Use full range appropriate for your mobility. Partial reps cheat your results.\n\nMIND-MUSCLE: Stay mentally connected to the movement. Feel the target muscles working through each rep.",
    formTips: "Maintain neutral spine throughout the movement\nControl the weight—don't let momentum take over\nUse full range of motion appropriate for your mobility\nIf form breaks down, reduce intensity or take a rest\nQuality always beats quantity",
    muscles: "Varies based on exercise selection",
    scaling: "Scale difficulty based on your current fitness level",
  };
};

const getSectionInfo = (sectionType: string | null) => {
  switch ((sectionType || "main").toLowerCase()) {
    case "warmup":
    case "activation":
    case "mobility":
      return { label: "Warm-Up", colorClass: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    case "main":
    case "strength":
    case "accessory":
      return { label: "Main Work", colorClass: "bg-primary/20 text-primary border-primary/30" };
    case "finisher":
    case "conditioning":
      return { label: "Finisher", colorClass: "bg-destructive/20 text-destructive border-destructive/30" };
    case "cooldown":
    case "recovery":
      return { label: "Cool-Down", colorClass: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    default:
      return { label: sectionType || "Exercise", colorClass: "bg-muted text-muted-foreground" };
  }
};

export default function AdminExerciseDetailModal({
  exercise,
  open,
  onOpenChange,
}: AdminExerciseDetailModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("howto");
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Get defaults for this exercise
  const defaults = exercise ? getDefaultContent(exercise.exercise_name) : getDefaultContent("");

  // Edit state
  const [editData, setEditData] = useState({
    exercise_name: "",
    sets: "",
    reps_or_time: "",
    rest: "",
    notes: "",
    instructions: "",
    form_tips: "",
    scaling_options: "",
    coach_notes: "",
    progression_notes: "",
  });

  // Reset edit state when exercise changes
  const resetEditData = useCallback(() => {
    if (exercise) {
      setEditData({
        exercise_name: exercise.exercise_name,
        sets: exercise.sets || "",
        reps_or_time: exercise.reps_or_time || "",
        rest: exercise.rest || "",
        notes: exercise.notes || "",
        instructions: exercise.instructions || defaults.instructions,
        form_tips: exercise.form_tips || defaults.formTips,
        scaling_options: exercise.scaling_options || "",
        coach_notes: exercise.coach_notes || "",
        progression_notes: exercise.progression_notes || "",
      });
    }
  }, [exercise, defaults]);

  // Initialize edit data when modal opens
  useState(() => {
    resetEditData();
  });

  if (!exercise) return null;

  const sectionInfo = getSectionInfo(exercise.section_type);

  // Parse instructions/form tips for display
  const displayInstructions = (editData.instructions || defaults.instructions).split("\n\n").filter(Boolean);
  const displayFormTips = (editData.form_tips || defaults.formTips).split("\n").filter(Boolean);
  const displayMuscles = (defaults.muscles || "").split("\n").filter(Boolean);
  const displayScaling = (editData.scaling_options || defaults.scaling || "").split("\n").filter(Boolean);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("program_template_exercises")
        .update({
          exercise_name: editData.exercise_name,
          sets: editData.sets || null,
          reps_or_time: editData.reps_or_time || null,
          rest: editData.rest || null,
          notes: editData.notes || null,
          instructions: editData.instructions || null,
          form_tips: editData.form_tips || null,
          scaling_options: editData.scaling_options || null,
          coach_notes: editData.coach_notes || null,
          progression_notes: editData.progression_notes || null,
        })
        .eq("id", exercise.id);

      if (error) throw error;
      toast.success("Exercise updated");
      queryClient.invalidateQueries({ queryKey: ["template-details"] });
      setIsEditMode(false);
    } catch (err: unknown) {
      toast.error("Failed to save: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    resetEditData();
    setIsEditMode(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsEditMode(false);
      resetEditData();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader className="pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-amber-500/20 flex items-center justify-center shrink-0">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <Badge className={sectionInfo.colorClass}>{sectionInfo.label}</Badge>
                {isEditMode ? (
                  <Input
                    value={editData.exercise_name}
                    onChange={(e) => setEditData({ ...editData, exercise_name: e.target.value })}
                    className="mt-2 text-lg font-bold"
                  />
                ) : (
                  <DialogTitle className="text-xl font-display mt-1">
                    {exercise.exercise_name}
                  </DialogTitle>
                )}
              </div>
            </div>
            
            {/* View/Edit Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={isEditMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (isEditMode) {
                    handleSave();
                  } else {
                    resetEditData();
                    setIsEditMode(true);
                  }
                }}
                disabled={saving}
              >
                {isEditMode ? (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </>
                )}
              </Button>
              {isEditMode && (
                <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Workout Parameters */}
        <div className="grid grid-cols-3 gap-3 py-4">
          {isEditMode ? (
            <>
              <div className="bg-charcoal rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Sets</p>
                <Input
                  value={editData.sets}
                  onChange={(e) => setEditData({ ...editData, sets: e.target.value })}
                  className="h-8 text-center font-bold"
                />
              </div>
              <div className="bg-charcoal rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Reps/Time</p>
                <Input
                  value={editData.reps_or_time}
                  onChange={(e) => setEditData({ ...editData, reps_or_time: e.target.value })}
                  className="h-8 text-center font-bold"
                />
              </div>
              <div className="bg-charcoal rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Rest</p>
                <Input
                  value={editData.rest}
                  onChange={(e) => setEditData({ ...editData, rest: e.target.value })}
                  className="h-8 text-center font-bold"
                />
              </div>
            </>
          ) : (
            <>
              <div className="bg-charcoal rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Sets</p>
                <p className="text-xl font-bold text-primary">{exercise.sets || "—"}</p>
              </div>
              <div className="bg-charcoal rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Reps/Time</p>
                <p className="text-xl font-bold">{exercise.reps_or_time || "—"}</p>
              </div>
              <div className="bg-charcoal rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Rest</p>
                <p className="text-xl font-bold text-muted-foreground">{exercise.rest || "—"}</p>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-charcoal p-1 rounded-lg">
            <TabsTrigger
              value="howto"
              className="flex items-center gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-amber-500/10 data-[state=active]:text-primary transition-all"
            >
              <Target className="w-4 h-4" />
              <span>How To</span>
            </TabsTrigger>
            <TabsTrigger
              value="form"
              className="flex items-center gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-amber-500/10 data-[state=active]:text-primary transition-all"
            >
              <Shield className="w-4 h-4" />
              <span>Form</span>
            </TabsTrigger>
            <TabsTrigger
              value="coaching"
              className="flex items-center gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-amber-500/10 data-[state=active]:text-primary transition-all"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Coaching</span>
            </TabsTrigger>
          </TabsList>

          {/* How To Tab */}
          <TabsContent value="howto" className="space-y-4 mt-4">
            {isEditMode ? (
              <div className="bg-charcoal rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-primary">Instructions</span>
                  <span className="text-xs text-muted-foreground">(one step per line)</span>
                </div>
                <Textarea
                  value={editData.instructions}
                  onChange={(e) => setEditData({ ...editData, instructions: e.target.value })}
                  rows={6}
                  placeholder="Step 1&#10;Step 2&#10;Step 3..."
                  className="text-sm"
                />
              </div>
            ) : (
              <>
                {/* Step by step instructions */}
                <div className="bg-charcoal rounded-lg p-4">
                  <h4 className="font-semibold text-primary flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5" />
                    Step-by-Step Instructions
                  </h4>
                  <div className="space-y-3">
                    {displayInstructions.map((step, i) => (
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
                  <p className="text-sm text-muted-foreground">
                    Exhale on exertion, inhale on the return
                  </p>
                </div>

                {/* Muscles worked */}
                <div className="bg-charcoal rounded-lg p-4">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Muscles Worked
                  </h4>
                  <div className="space-y-2">
                    {displayMuscles.map((muscleGroup, i) => (
                      <div key={i} className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{muscleGroup.split(":")[0]}:</span>
                        <span>{muscleGroup.split(":")[1] || muscleGroup}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Form Tips Tab */}
          <TabsContent value="form" className="space-y-4 mt-4">
            {isEditMode ? (
              <>
                <div className="bg-charcoal rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-green-400">Form Tips</span>
                    <span className="text-xs text-muted-foreground">(one tip per line)</span>
                  </div>
                  <Textarea
                    value={editData.form_tips}
                    onChange={(e) => setEditData({ ...editData, form_tips: e.target.value })}
                    rows={4}
                    placeholder="Tip 1&#10;Tip 2&#10;Tip 3..."
                    className="text-sm"
                  />
                </div>

                <div className="bg-charcoal rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-primary">Scaling Options</span>
                  </div>
                  <Textarea
                    value={editData.scaling_options}
                    onChange={(e) => setEditData({ ...editData, scaling_options: e.target.value })}
                    rows={3}
                    placeholder="Easier: ...&#10;Harder: ..."
                    className="text-sm"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Form checkpoints */}
                <div className="bg-charcoal rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5" />
                    Form Checkpoints
                  </h4>
                  <div className="space-y-3">
                    {displayFormTips.map((tip, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-green-500/5 rounded-lg border border-green-500/10"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scaling options - always show from defaults or custom */}
                <div className="bg-gradient-to-r from-primary/10 to-amber-500/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-primary flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4" />
                    Scaling Options
                  </h4>
                  <div className="space-y-2">
                    {displayScaling.map((option, i) => (
                      <div key={i} className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{option.split(":")[0]}:</span>
                        <span>{option.split(":")[1] || option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Coaching Tab */}
          <TabsContent value="coaching" className="space-y-4 mt-4">
            {isEditMode ? (
              <>
                <div className="bg-charcoal rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-primary">Coach Notes</span>
                  </div>
                  <Textarea
                    value={editData.coach_notes}
                    onChange={(e) => setEditData({ ...editData, coach_notes: e.target.value })}
                    rows={4}
                    placeholder="Special notes for the coach or client..."
                    className="text-sm"
                  />
                </div>

                <div className="bg-charcoal rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-green-400">Progression Notes</span>
                  </div>
                  <Textarea
                    value={editData.progression_notes}
                    onChange={(e) => setEditData({ ...editData, progression_notes: e.target.value })}
                    rows={3}
                    placeholder="How to progress this exercise over time..."
                    className="text-sm"
                  />
                </div>

                <div className="bg-charcoal rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold text-amber-400">General Notes</span>
                  </div>
                  <Textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    rows={2}
                    placeholder="Any additional notes..."
                    className="text-sm"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Coach Notes */}
                {exercise.coach_notes && (
                  <div className="bg-gradient-to-r from-primary/10 to-amber-500/5 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-semibold text-primary flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4" />
                      Coach Notes
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {exercise.coach_notes}
                    </p>
                  </div>
                )}

                {/* Progression Notes */}
                {exercise.progression_notes && (
                  <div className="bg-charcoal rounded-lg p-4">
                    <h4 className="font-semibold text-green-400 flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4" />
                      Progression Notes
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {exercise.progression_notes}
                    </p>
                  </div>
                )}

                {/* General Notes */}
                {exercise.notes && (
                  <div className="bg-charcoal rounded-lg p-4">
                    <h4 className="font-semibold text-amber-400 flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4" />
                      Notes
                    </h4>
                    <p className="text-sm text-muted-foreground">{exercise.notes}</p>
                  </div>
                )}

                {/* Empty state */}
                {!exercise.coach_notes && !exercise.progression_notes && !exercise.notes && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No coaching notes yet</p>
                    <p className="text-sm mt-1">Click Edit to add coach notes, progression tips, and more</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
