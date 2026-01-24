import { useState, useMemo } from "react";
import { Dumbbell, Plus, Edit, Trash2, ArrowLeft, Loader2, ArrowRight, Video, Save, Search } from "lucide-react";
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
  { value: "warmup", label: "Warm-up", color: "text-yellow-400" },
  { value: "main", label: "Main Work", color: "text-primary" },
  { value: "finisher", label: "Finisher", color: "text-red-400" },
  { value: "cooldown", label: "Cool-down", color: "text-blue-400" },
] as const;

export default function WorkoutContentManager() {
  const { templates, loading: templatesLoading, createTemplate, updateTemplate, deleteTemplate } = useWorkoutTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const { exercises, loading: exercisesLoading, createExercise, updateExercise, deleteExercise } = useWorkoutExercises(selectedTemplate?.id || null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Template dialog (for create/edit)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    template_slug: "",
    focus: "",
    description: "",
    is_bodyweight: false,
    is_active: true,
    display_order: 0,
    video_url: "",
  });

  // Exercise dialog
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

  // Filter templates by search
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const q = searchQuery.toLowerCase();
    return templates.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.focus?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  }, [templates, searchQuery]);

  // Open template dialog for create/edit
  const openTemplateDialog = (template?: WorkoutTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name,
        template_slug: template.template_slug,
        focus: template.focus || "",
        description: template.description || "",
        is_bodyweight: template.is_bodyweight,
        is_active: template.is_active,
        display_order: template.display_order,
        video_url: template.video_url || "",
      });
    } else {
      setEditingTemplate(null);
      setTemplateForm({
        name: "",
        template_slug: "",
        focus: "",
        description: "",
        is_bodyweight: false,
        is_active: true,
        display_order: templates.length,
        video_url: "",
      });
    }
    setTemplateDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim()) return;
    
    const slug = templateForm.template_slug || templateForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, { ...templateForm, template_slug: slug });
    } else {
      await createTemplate({ ...templateForm, template_slug: slug } as any);
    }
    setTemplateDialogOpen(false);
  };

  const handleDeleteTemplate = async (template: WorkoutTemplate) => {
    if (confirm(`Delete "${template.name}" and all its exercises? This cannot be undone.`)) {
      await deleteTemplate(template.id);
      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(null);
      }
    }
  };

  // Exercise functions
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

  if (templatesLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Template detail view
  if (selectedTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Templates
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{selectedTemplate.name}</h2>
              {selectedTemplate.is_bodyweight && (
                <Badge variant="outline" className="text-xs">Bodyweight</Badge>
              )}
              {!selectedTemplate.is_active && (
                <Badge variant="secondary" className="text-xs">Inactive</Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">{selectedTemplate.focus}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => openTemplateDialog(selectedTemplate)}>
            <Edit className="h-4 w-4 mr-2" /> Edit Template
          </Button>
          <Button variant="gold" size="sm" onClick={() => openExerciseDialog()}>
            <Plus className="h-4 w-4 mr-2" /> Add Exercise
          </Button>
        </div>

        {selectedTemplate.description && (
          <p className="text-muted-foreground">{selectedTemplate.description}</p>
        )}

        {exercisesLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-6">
            {groupedExercises.map((section) => (
              <Card key={section.value} className="bg-charcoal border-border">
                <CardHeader className="pb-2">
                  <CardTitle className={`text-sm uppercase tracking-wider ${section.color}`}>{section.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  {section.exercises.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center italic">No exercises added yet</p>
                  ) : (
                    <div className="space-y-2">
                      {section.exercises.map((exercise) => (
                        <div key={exercise.id} className="flex items-center gap-4 p-3 rounded bg-background border border-border group">
                          <div className="flex-1">
                            <p className="font-medium">{exercise.exercise_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {[
                                exercise.sets && `${exercise.sets} sets`,
                                exercise.reps_or_time,
                                exercise.rest && `Rest: ${exercise.rest}`
                              ].filter(Boolean).join(" • ")}
                            </p>
                            {exercise.notes && <p className="text-xs text-primary/80 mt-1">{exercise.notes}</p>}
                          </div>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" onClick={() => openExerciseDialog(exercise)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" onClick={() => handleDeleteExercise(exercise.id)}>
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

        {/* Exercise Dialog */}
        <Dialog open={exerciseDialogOpen} onOpenChange={setExerciseDialogOpen}>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                {editingExercise ? "Edit Exercise" : "Add Exercise"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Section</Label>
                <Select value={exerciseForm.section_type} onValueChange={(v: any) => setExerciseForm({ ...exerciseForm, section_type: v })}>
                  <SelectTrigger className="bg-charcoal border-border mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SECTION_TYPES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        <span className={s.color}>{s.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Exercise Name *</Label>
                <Input 
                  value={exerciseForm.exercise_name} 
                  onChange={(e) => setExerciseForm({ ...exerciseForm, exercise_name: e.target.value })} 
                  className="bg-charcoal border-border mt-1" 
                  placeholder="e.g., Push-ups" 
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Sets</Label>
                  <Input value={exerciseForm.sets} onChange={(e) => setExerciseForm({ ...exerciseForm, sets: e.target.value })} className="bg-charcoal border-border mt-1" placeholder="4" />
                </div>
                <div>
                  <Label>Reps/Time</Label>
                  <Input value={exerciseForm.reps_or_time} onChange={(e) => setExerciseForm({ ...exerciseForm, reps_or_time: e.target.value })} className="bg-charcoal border-border mt-1" placeholder="10-12" />
                </div>
                <div>
                  <Label>Rest</Label>
                  <Input value={exerciseForm.rest} onChange={(e) => setExerciseForm({ ...exerciseForm, rest: e.target.value })} className="bg-charcoal border-border mt-1" placeholder="60s" />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={exerciseForm.notes} onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })} className="bg-charcoal border-border mt-1" placeholder="Coaching cues..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExerciseDialogOpen(false)}>Cancel</Button>
              <Button variant="gold" onClick={handleSaveExercise} disabled={!exerciseForm.exercise_name.trim()}>
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Template list view
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold">Workout Templates</h2>
          <p className="text-muted-foreground text-sm">Create and manage reusable workout templates</p>
        </div>
        <Button variant="gold" onClick={() => openTemplateDialog()}>
          <Plus className="h-4 w-4 mr-2" /> New Template
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search templates..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="pl-10 bg-charcoal border-border"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="bg-charcoal border-border group relative">
            <CardContent className="p-5">
              <div 
                className="cursor-pointer"
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-start gap-4">
                  <Dumbbell className="w-8 h-8 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold truncate">{template.name}</h3>
                      {!template.is_active && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                      {template.is_bodyweight && <Badge variant="outline" className="text-xs">Bodyweight</Badge>}
                      {template.video_url && <Video className="w-3 h-3 text-primary" />}
                    </div>
                    <p className="text-sm text-primary mb-1 truncate">{template.focus}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </div>
              
              {/* Action buttons - always visible */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); openTemplateDialog(template); }}>
                  <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(template); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 bg-charcoal rounded-lg border border-border">
          <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchQuery ? "No templates match your search" : "No templates yet. Create your first one!"}
          </p>
        </div>
      )}

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              {editingTemplate ? "Edit Template" : "New Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Template Name *</Label>
              <Input 
                value={templateForm.name} 
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} 
                className="bg-charcoal border-border mt-1" 
                placeholder="e.g., Push Day Power" 
              />
            </div>
            <div>
              <Label>Focus</Label>
              <Input 
                value={templateForm.focus} 
                onChange={(e) => setTemplateForm({ ...templateForm, focus: e.target.value })} 
                className="bg-charcoal border-border mt-1" 
                placeholder="e.g., Chest, Shoulders, Triceps" 
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea 
                value={templateForm.description} 
                onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })} 
                className="bg-charcoal border-border mt-1" 
                placeholder="Brief description of this workout..." 
              />
            </div>
            <div>
              <Label>Video URL (optional)</Label>
              <Input 
                value={templateForm.video_url} 
                onChange={(e) => setTemplateForm({ ...templateForm, video_url: e.target.value })} 
                className="bg-charcoal border-border mt-1" 
                placeholder="https://youtube.com/embed/..." 
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-charcoal border border-border">
              <div>
                <Label>Bodyweight Only</Label>
                <p className="text-xs text-muted-foreground">Available to Membership tier</p>
              </div>
              <Switch
                checked={templateForm.is_bodyweight}
                onCheckedChange={(v) => setTemplateForm({ ...templateForm, is_bodyweight: v })}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-charcoal border border-border">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">Visible to users</p>
              </div>
              <Switch
                checked={templateForm.is_active}
                onCheckedChange={(v) => setTemplateForm({ ...templateForm, is_active: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
            <Button variant="gold" onClick={handleSaveTemplate} disabled={!templateForm.name.trim()}>
              <Save className="h-4 w-4 mr-2" /> {editingTemplate ? "Update" : "Create"} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
