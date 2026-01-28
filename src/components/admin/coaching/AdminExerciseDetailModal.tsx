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
  
  const defaults: Record<string, { instructions: string; formTips: string; muscles: string }> = {
    "push-up": {
      instructions: "Start in high plank position\nKeep core tight and body straight\nLower chest toward ground\nKeep elbows at 45-degree angle\nPush through palms to return",
      formTips: "Don't let hips sag\nKeep head neutral\nFully extend arms at top",
      muscles: "Chest, Triceps, Shoulders, Core",
    },
    "squat": {
      instructions: "Stand with feet shoulder-width apart\nBrace core and keep chest up\nPush hips back, bend knees\nLower until thighs are parallel\nDrive through heels to stand",
      formTips: "Knees track over toes\nMaintain neutral spine\nWeight in heels",
      muscles: "Quads, Glutes, Hamstrings, Core",
    },
    "pull-up": {
      instructions: "Grip bar shoulder-width apart\nHang with arms extended\nPull chest toward bar\nLead with chest, not chin\nLower under control",
      formTips: "Engage lats before pulling\nNo swinging or kipping\nSqueeze shoulder blades at top",
      muscles: "Lats, Biceps, Rear Delts, Core",
    },
    "plank": {
      instructions: "Start in forearm plank\nCreate straight line from head to heels\nEngage core by drawing belly button in\nSqueeze glutes\nHold position, breathing steadily",
      formTips: "Don't let hips sag or pike\nSpread shoulder blades\nBrace for a punch",
      muscles: "Core, Shoulders, Back, Glutes",
    },
  };

  // Find matching default
  for (const [key, value] of Object.entries(defaults)) {
    if (lower.includes(key)) {
      return value;
    }
  }

  return {
    instructions: "Follow proper form as instructed\nFocus on controlled movement\nMaintain proper posture\nScale as needed for your level",
    formTips: "Control the movement\nFull range of motion\nQuality over quantity",
    muscles: "Multiple muscle groups",
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
  const displayInstructions = (editData.instructions || defaults.instructions).split("\n").filter(Boolean);
  const displayFormTips = (editData.form_tips || defaults.formTips).split("\n").filter(Boolean);
  const displayMuscles = defaults.muscles.split(",").map((m) => m.trim());

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
                  <div className="flex flex-wrap gap-2">
                    {displayMuscles.map((muscle, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="bg-green-500/20 text-green-400 border-green-500/30"
                      >
                        {muscle}
                      </Badge>
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

                {/* Scaling options */}
                {(exercise.scaling_options || editData.scaling_options) && (
                  <div className="bg-gradient-to-r from-primary/10 to-amber-500/5 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-semibold text-primary flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4" />
                      Scaling Options
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {exercise.scaling_options || editData.scaling_options}
                    </p>
                  </div>
                )}
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
