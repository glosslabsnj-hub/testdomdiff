import { useState } from "react";
import { Dumbbell, Plus, Edit, Trash2, ArrowLeft, Loader2, ArrowRight, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useWorkoutTemplates, useWorkoutExercises, WorkoutTemplate, WorkoutExercise } from "@/hooks/useWorkoutContent";

const SECTION_TYPES = [
  { value: "warmup", label: "Warm-up" },
  { value: "main", label: "Main Work" },
  { value: "finisher", label: "Finisher" },
  { value: "cooldown", label: "Cool-down" },
] as const;

export default function WorkoutContentManager() {
  const { templates, loading: templatesLoading, updateTemplate } = useWorkoutTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const { exercises, loading: exercisesLoading, createExercise, updateExercise, deleteExercise } = useWorkoutExercises(selectedTemplate?.id || null);

  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<WorkoutExercise | null>(null);
  const [exerciseForm, setExerciseForm] = useState({
    section_type: "main" as "warmup" | "main" | "finisher" | "cooldown",
    exercise_name: "",
    sets: "",
    reps_or_time: "",
    rest: "",
    notes: "",
    scaling_options: "",
    display_order: 0,
  });

  // Template settings dialog
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [templateSettings, setTemplateSettings] = useState({
    is_bodyweight: false,
    video_url: "",
  });

  const openExerciseDialog = (exercise?: WorkoutExercise) => {
    if (exercise) {
      setEditingExercise(exercise);
      setExerciseForm({
        section_type: exercise.section_type,
        exercise_name: exercise.exercise_name,
        sets: exercise.sets || "",
        reps_or_time: exercise.reps_or_time || "",
        rest: exercise.rest || "",
        notes: exercise.notes || "",
        scaling_options: exercise.scaling_options || "",
        display_order: exercise.display_order,
      });
    } else {
      setEditingExercise(null);
      setExerciseForm({
        section_type: "main",
        exercise_name: "",
        sets: "",
        reps_or_time: "",
        rest: "",
        notes: "",
        scaling_options: "",
        display_order: exercises.length,
      });
    }
    setExerciseDialogOpen(true);
  };

  const handleSaveExercise = async () => {
    if (!selectedTemplate || !exerciseForm.exercise_name.trim()) return;

    if (editingExercise) {
      await updateExercise(editingExercise.id, exerciseForm);
    } else {
      await createExercise({
        ...exerciseForm,
        template_id: selectedTemplate.id,
      });
    }
    setExerciseDialogOpen(false);
  };

  const handleDeleteExercise = async (id: string) => {
    if (confirm("Delete this exercise?")) {
      await deleteExercise(id);
    }
  };

  const groupedExercises = SECTION_TYPES.map((section) => ({
    ...section,
    exercises: exercises.filter((e) => e.section_type === section.value),
  }));

  const openSettingsDialog = () => {
    if (selectedTemplate) {
      setTemplateSettings({
        is_bodyweight: selectedTemplate.is_bodyweight || false,
        video_url: selectedTemplate.video_url || "",
      });
      setSettingsDialogOpen(true);
    }
  };

  const handleSaveSettings = async () => {
    if (!selectedTemplate) return;
    await updateTemplate(selectedTemplate.id, templateSettings);
    setSelectedTemplate({ ...selectedTemplate, ...templateSettings });
    setSettingsDialogOpen(false);
  };

  if (templatesLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (selectedTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedTemplate(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="headline-card">{selectedTemplate.name}</h2>
              {selectedTemplate.is_bodyweight && (
                <Badge variant="outline" className="text-xs">Bodyweight</Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">{selectedTemplate.focus}</p>
          </div>
          <Button variant="outline" size="sm" onClick={openSettingsDialog}>
            Settings
          </Button>
          <Button variant="gold" onClick={() => openExerciseDialog()}>
            <Plus className="h-4 w-4 mr-2" /> Add Exercise
          </Button>
        </div>

        {exercisesLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-6">
            {groupedExercises.map((section) => (
              <Card key={section.value} className="bg-charcoal border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary uppercase tracking-wider">{section.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  {section.exercises.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">No exercises added yet</p>
                  ) : (
                    <div className="space-y-2">
                      {section.exercises.map((exercise) => (
                        <div key={exercise.id} className="flex items-center gap-4 p-3 rounded bg-background border border-border">
                          <div className="flex-1">
                            <p className="font-medium">{exercise.exercise_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {[exercise.sets, exercise.reps_or_time, exercise.rest].filter(Boolean).join(" • ")}
                            </p>
                            {exercise.notes && <p className="text-xs text-muted-foreground mt-1">{exercise.notes}</p>}
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => openExerciseDialog(exercise)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteExercise(exercise.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={exerciseDialogOpen} onOpenChange={setExerciseDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>{editingExercise ? "Edit Exercise" : "Add Exercise"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Section</label>
                <Select value={exerciseForm.section_type} onValueChange={(v: any) => setExerciseForm({ ...exerciseForm, section_type: v })}>
                  <SelectTrigger className="bg-charcoal border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SECTION_TYPES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Exercise Name *</label>
                <Input value={exerciseForm.exercise_name} onChange={(e) => setExerciseForm({ ...exerciseForm, exercise_name: e.target.value })} className="bg-charcoal border-border" placeholder="e.g., Push-ups" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Sets</label>
                  <Input value={exerciseForm.sets} onChange={(e) => setExerciseForm({ ...exerciseForm, sets: e.target.value })} className="bg-charcoal border-border" placeholder="e.g., 4" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Reps/Time</label>
                  <Input value={exerciseForm.reps_or_time} onChange={(e) => setExerciseForm({ ...exerciseForm, reps_or_time: e.target.value })} className="bg-charcoal border-border" placeholder="e.g., 15 reps" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Rest</label>
                  <Input value={exerciseForm.rest} onChange={(e) => setExerciseForm({ ...exerciseForm, rest: e.target.value })} className="bg-charcoal border-border" placeholder="e.g., 60s" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Notes</label>
                <Textarea value={exerciseForm.notes} onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })} className="bg-charcoal border-border" placeholder="e.g., Go to failure on last set" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Scaling Options</label>
                <Textarea value={exerciseForm.scaling_options} onChange={(e) => setExerciseForm({ ...exerciseForm, scaling_options: e.target.value })} className="bg-charcoal border-border" placeholder="e.g., Beginner: Knee push-ups" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExerciseDialogOpen(false)}>Cancel</Button>
              <Button variant="gold" onClick={handleSaveExercise}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Template Settings Dialog */}
        <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Template Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_bodyweight">Bodyweight Only</Label>
                  <p className="text-xs text-muted-foreground">
                    Available to Membership tier (no equipment)
                  </p>
                </div>
                <Switch
                  id="is_bodyweight"
                  checked={templateSettings.is_bodyweight}
                  onCheckedChange={(v) => setTemplateSettings({ ...templateSettings, is_bodyweight: v })}
                />
              </div>
              <div>
                <Label htmlFor="video_url">Video URL</Label>
                <Input
                  id="video_url"
                  value={templateSettings.video_url}
                  onChange={(e) => setTemplateSettings({ ...templateSettings, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/embed/..."
                  className="bg-charcoal border-border mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  YouTube or Vimeo embed URL for this workout
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
              <Button variant="gold" onClick={handleSaveSettings}>Save Settings</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="headline-card">Workout Templates</h2>
      </div>
      <p className="text-muted-foreground text-sm">Click a template to add/edit exercises</p>

      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="bg-charcoal border-border cursor-pointer hover:border-primary/50 hover:scale-[1.01] active:scale-[0.99] transition-all group"
            onClick={() => setSelectedTemplate(template)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedTemplate(template);
              }
            }}
          >
            <CardContent className="p-4 sm:p-6 pointer-events-none">
              <div className="flex items-start gap-3 sm:gap-4">
                <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{template.name}</h3>
                    {!template.is_active && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                    {template.is_bodyweight && <Badge variant="outline" className="text-xs">Bodyweight</Badge>}
                    {template.video_url && <Video className="w-3 h-3 text-primary" />}
                  </div>
                  <p className="text-xs sm:text-sm text-primary mb-1 sm:mb-2 truncate">{template.focus}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
