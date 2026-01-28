import { useState } from "react";
import {
  Library,
  Loader2,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  Plus,
  Edit2,
  Save,
  X,
  Trash2,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  useTemplateCategories,
  useProgramTemplates,
  useTemplateDetails,
  useUpdateTemplate,
  useCreateTemplate,
  type ProgramTemplate,
  type TemplateCategory,
  type TemplateExercise,
} from "@/hooks/useProgramTemplates";

const SECTION_CONFIG: Record<string, { label: string; color: string }> = {
  activation: { label: "ACTIVATION", color: "text-amber-400" },
  mobility: { label: "MOBILITY", color: "text-cyan-400" },
  warmup: { label: "WARM-UP", color: "text-yellow-500" },
  strength: { label: "STRENGTH BLOCK", color: "text-primary" },
  main: { label: "MAIN WORK", color: "text-primary" },
  accessory: { label: "ACCESSORY BLOCK", color: "text-blue-400" },
  conditioning: { label: "CONDITIONING", color: "text-red-400" },
  finisher: { label: "FINISHER", color: "text-red-500" },
  recovery: { label: "RECOVERY", color: "text-green-400" },
  cooldown: { label: "COOL-DOWN", color: "text-blue-300" },
};

const DIFFICULTY_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

export default function ProgramTemplateManager() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading: categoriesLoading } = useTemplateCategories();
  const { data: templates = [], isLoading: templatesLoading } = useProgramTemplates();
  const createTemplate = useCreateTemplate();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    difficulty: "Intermediate",
    days_per_week: 4,
  });

  const toggleCategory = (categoryId: string) => {
    const next = new Set(expandedCategories);
    if (next.has(categoryId)) {
      next.delete(categoryId);
    } else {
      next.add(categoryId);
    }
    setExpandedCategories(next);
  };

  const getTemplatesForCategory = (categoryId: string) => {
    return templates.filter((t) => t.category_id === categoryId);
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !selectedCategoryId) return;

    await createTemplate.mutateAsync({
      name: newTemplate.name,
      description: newTemplate.description || null,
      category_id: selectedCategoryId,
      days_per_week: newTemplate.days_per_week,
      difficulty: newTemplate.difficulty,
      display_order: 0,
      is_active: true,
      equipment: null,
      goal_focus: null,
    });

    setIsCreateDialogOpen(false);
    setNewTemplate({
      name: "",
      description: "",
      difficulty: "Intermediate",
      days_per_week: 4,
    });
    setSelectedCategoryId(null);
  };

  const loading = categoriesLoading || templatesLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Library className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Free World Templates</h2>
            <p className="text-sm text-muted-foreground">
              {templates.length} premium 4-week programs • Full inline editing
            </p>
          </div>
        </div>
        <Button variant="gold" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Template
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 flex-none">
        {categories.map((category) => {
          const count = getTemplatesForCategory(category.id).length;
          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all ${
                expandedCategories.has(category.id)
                  ? "ring-2 ring-primary bg-primary/10"
                  : "hover:border-muted-foreground"
              }`}
              onClick={() => toggleCategory(category.id)}
            >
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">{count}</div>
                <div className="text-sm font-medium truncate">{category.name}</div>
                <div className="text-xs text-muted-foreground">templates</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Categories with Templates */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-2 pr-4 pb-8">
          {categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              templates={getTemplatesForCategory(category.id)}
              isExpanded={expandedCategories.has(category.id)}
              onToggle={() => toggleCategory(category.id)}
              editingTemplateId={editingTemplateId}
              onEditTemplate={setEditingTemplateId}
              allCategories={categories}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Category</Label>
              <Select value={selectedCategoryId || ""} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Template Name</Label>
              <Input
                value={newTemplate.name}
                onChange={(e) => setNewTemplate((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Total Body Foundations"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={newTemplate.description}
                onChange={(e) => setNewTemplate((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief description..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Difficulty</Label>
                <Select
                  value={newTemplate.difficulty}
                  onValueChange={(v) => setNewTemplate((p) => ({ ...p, difficulty: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Days Per Week</Label>
                <Select
                  value={String(newTemplate.days_per_week)}
                  onValueChange={(v) => setNewTemplate((p) => ({ ...p, days_per_week: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} days
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              onClick={handleCreateTemplate}
              disabled={!newTemplate.name || !selectedCategoryId || createTemplate.isPending}
            >
              {createTemplate.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- Category Section ----------
interface CategorySectionProps {
  category: TemplateCategory;
  templates: ProgramTemplate[];
  isExpanded: boolean;
  onToggle: () => void;
  editingTemplateId: string | null;
  onEditTemplate: (id: string | null) => void;
  allCategories: TemplateCategory[];
}

function CategorySection({
  category,
  templates,
  isExpanded,
  onToggle,
  editingTemplateId,
  onEditTemplate,
  allCategories,
}: CategorySectionProps) {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div className="w-full flex items-center justify-between p-4 bg-charcoal rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-primary" />
            ) : (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <span className="font-medium">{category.name}</span>
              <span className="text-muted-foreground ml-2 text-sm">({templates.length} templates)</span>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {category.target_profile}
          </Badge>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-8 mt-2 space-y-2">
          {templates.map((template) => (
            <TemplateEditor
              key={template.id}
              template={template}
              isEditing={editingTemplateId === template.id}
              onEdit={() => onEditTemplate(template.id)}
              onCancel={() => onEditTemplate(null)}
              allCategories={allCategories}
            />
          ))}
          {templates.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No templates in this category yet
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ---------- Template Editor ----------
interface TemplateEditorProps {
  template: ProgramTemplate;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  allCategories: TemplateCategory[];
}

function TemplateEditor({ template, isEditing, onEdit, onCancel, allCategories }: TemplateEditorProps) {
  const queryClient = useQueryClient();
  const { data: details, isLoading } = useTemplateDetails(isEditing ? template.id : null);
  const updateTemplateMutation = useUpdateTemplate();

  const [editedTemplate, setEditedTemplate] = useState({
    name: template.name,
    description: template.description || "",
    category_id: template.category_id || "",
    days_per_week: template.days_per_week || 4,
    difficulty: template.difficulty || "Beginner",
  });

  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [savingExercise, setSavingExercise] = useState<string | null>(null);

  const handleSaveTemplate = async () => {
    try {
      await updateTemplateMutation.mutateAsync({
        id: template.id,
        name: editedTemplate.name,
        description: editedTemplate.description || null,
        category_id: editedTemplate.category_id || null,
        days_per_week: editedTemplate.days_per_week,
        difficulty: editedTemplate.difficulty,
      });
      onCancel();
    } catch (error) {
      console.error("Failed to save template:", error);
    }
  };

  const handleSaveExercise = async (exerciseId: string, updates: Partial<TemplateExercise>) => {
    setSavingExercise(exerciseId);
    try {
      const { error } = await supabase
        .from("program_template_exercises")
        .update(updates)
        .eq("id", exerciseId);

      if (error) throw error;
      toast.success("Exercise updated");
      queryClient.invalidateQueries({ queryKey: ["template-details", template.id] });
    } catch (error) {
      console.error("Failed to update exercise:", error);
      toast.error("Failed to update exercise");
    } finally {
      setSavingExercise(null);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      const { error } = await supabase
        .from("program_template_exercises")
        .delete()
        .eq("id", exerciseId);

      if (error) throw error;
      toast.success("Exercise removed");
      queryClient.invalidateQueries({ queryKey: ["template-details", template.id] });
    } catch (error) {
      console.error("Failed to delete exercise:", error);
      toast.error("Failed to delete exercise");
    }
  };

  const handleAddExercise = async (dayId: string, sectionType: string) => {
    try {
      const { error } = await supabase
        .from("program_template_exercises")
        .insert({
          day_id: dayId,
          section_type: sectionType,
          exercise_name: "New Exercise",
          sets: "3",
          reps_or_time: "10-12",
          rest: "60s",
          display_order: 99,
        });

      if (error) throw error;
      toast.success("Exercise added");
      queryClient.invalidateQueries({ queryKey: ["template-details", template.id] });
    } catch (error) {
      console.error("Failed to add exercise:", error);
      toast.error("Failed to add exercise");
    }
  };

  const toggleWeek = (weekNum: number) => {
    const next = new Set(expandedWeeks);
    if (next.has(weekNum)) {
      next.delete(weekNum);
    } else {
      next.add(weekNum);
    }
    setExpandedWeeks(next);
  };

  const toggleDay = (dayId: string) => {
    const next = new Set(expandedDays);
    if (next.has(dayId)) {
      next.delete(dayId);
    } else {
      next.add(dayId);
    }
    setExpandedDays(next);
  };

  // Collapsed view
  if (!isEditing) {
    return (
      <div className="w-full flex items-center justify-between p-3 rounded-lg border bg-background border-border hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">{template.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {template.days_per_week || 4} days/week
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {template.difficulty}
          </Badge>
          <Button variant="ghost" size="sm" className="h-7" onClick={onEdit}>
            <Edit2 className="w-3 h-3 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    );
  }

  // Expanded editing view
  return (
    <div className="rounded-lg border-2 border-primary/50 bg-primary/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-primary/10 border-b border-primary/30">
        <div className="flex items-center gap-2">
          <Edit2 className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Editing: {template.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button variant="gold" size="sm" onClick={handleSaveTemplate}>
            <Save className="w-4 h-4 mr-1" />
            Save Template
          </Button>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4 space-y-4 border-b border-border">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Template Name</Label>
            <Input
              value={editedTemplate.name}
              onChange={(e) => setEditedTemplate({ ...editedTemplate, name: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Select
              value={editedTemplate.category_id}
              onValueChange={(v) => setEditedTemplate({ ...editedTemplate, category_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Days Per Week</Label>
            <Select
              value={String(editedTemplate.days_per_week)}
              onValueChange={(v) => setEditedTemplate({ ...editedTemplate, days_per_week: parseInt(v) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7].map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} days/week
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Difficulty</Label>
            <Select
              value={editedTemplate.difficulty}
              onValueChange={(v) => setEditedTemplate({ ...editedTemplate, difficulty: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Description</Label>
          <Textarea
            value={editedTemplate.description}
            onChange={(e) => setEditedTemplate({ ...editedTemplate, description: e.target.value })}
            rows={2}
          />
        </div>
      </div>

      {/* Weeks/Days/Exercises */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : details && details.weeks.length > 0 ? (
          <div className="space-y-2">
            {details.weeks.map((week) => {
              const weekDays = details.days.filter((d) => d.week_id === week.id);

              return (
                <Collapsible
                  key={week.id}
                  open={expandedWeeks.has(week.week_number)}
                  onOpenChange={() => toggleWeek(week.week_number)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/30 cursor-pointer">
                      {expandedWeeks.has(week.week_number) ? (
                        <ChevronDown className="w-4 h-4 text-primary" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <span className="font-medium text-sm">
                        Week {week.week_number}: {week.title || week.focus_description || "Training Week"}
                      </span>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {weekDays.filter((d) => !d.is_rest_day).length} training days
                      </Badge>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-6 mt-2 space-y-2">
                      {weekDays.map((day) => {
                        if (day.is_rest_day) {
                          return (
                            <div key={day.id} className="p-2 rounded bg-muted/20 text-sm text-muted-foreground">
                              <span className="font-medium">{day.day_of_week}:</span> Rest Day
                            </div>
                          );
                        }

                        const dayExercises = details.exercises.filter((e) => e.day_id === day.id);
                        const sections = Object.keys(SECTION_CONFIG);

                        return (
                          <Collapsible
                            key={day.id}
                            open={expandedDays.has(day.id)}
                            onOpenChange={() => toggleDay(day.id)}
                          >
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/30 cursor-pointer">
                                {expandedDays.has(day.id) ? (
                                  <ChevronDown className="w-4 h-4 text-primary" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                                <span className="text-sm font-medium">
                                  {day.day_of_week}: {day.workout_name}
                                </span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {dayExercises.length} exercises
                                </span>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="ml-6 mt-2 space-y-4">
                                {sections.map((section) => {
                                  const sectionExercises = dayExercises.filter(
                                    (e) => (e.section_type || "main") === section
                                  );
                                  if (sectionExercises.length === 0) return null;

                                  const config = SECTION_CONFIG[section] || { label: section.toUpperCase(), color: "text-foreground" };

                                  return (
                                    <div key={section} className="space-y-2">
                                      <div className={`text-xs font-bold uppercase tracking-wide ${config.color}`}>
                                        {config.label}
                                      </div>
                                      {sectionExercises.map((exercise) => (
                                        <ExerciseRow
                                          key={exercise.id}
                                          exercise={exercise}
                                          onSave={(updates) => handleSaveExercise(exercise.id, updates)}
                                          onDelete={() => handleDeleteExercise(exercise.id)}
                                          isSaving={savingExercise === exercise.id}
                                        />
                                      ))}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => handleAddExercise(day.id, section)}
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Exercise
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No weeks defined yet. This template needs workout data.
          </p>
        )}
      </div>
    </div>
  );
}

// ---------- Exercise Row with Full Editing ----------
interface ExerciseRowProps {
  exercise: TemplateExercise;
  onSave: (updates: Partial<TemplateExercise>) => void;
  onDelete: () => void;
  isSaving: boolean;
}

function ExerciseRow({ exercise, onSave, onDelete, isSaving }: ExerciseRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState({
    exercise_name: exercise.exercise_name,
    sets: exercise.sets || "",
    reps_or_time: exercise.reps_or_time || "",
    rest: exercise.rest || "",
    notes: exercise.notes || "",
    instructions: exercise.instructions || "",
    form_tips: exercise.form_tips || "",
    video_url: exercise.video_url || "",
    coach_notes: exercise.coach_notes || "",
    scaling_options: exercise.scaling_options || "",
    progression_notes: exercise.progression_notes || "",
  });

  const handleSave = () => {
    onSave(edited);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
        {/* Row 1: Name, Sets, Reps, Rest */}
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-2">
            <Label className="text-xs text-muted-foreground">Exercise Name</Label>
            <Input
              value={edited.exercise_name}
              onChange={(e) => setEdited({ ...edited, exercise_name: e.target.value })}
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Sets</Label>
            <Input
              value={edited.sets}
              onChange={(e) => setEdited({ ...edited, sets: e.target.value })}
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Reps/Time</Label>
            <Input
              value={edited.reps_or_time}
              onChange={(e) => setEdited({ ...edited, reps_or_time: e.target.value })}
              className="h-9"
            />
          </div>
        </div>

        {/* Row 2: Rest, Notes */}
        <div className="grid grid-cols-4 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">Rest</Label>
            <Input
              value={edited.rest}
              onChange={(e) => setEdited({ ...edited, rest: e.target.value })}
              className="h-9"
            />
          </div>
          <div className="col-span-3">
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Input
              value={edited.notes}
              onChange={(e) => setEdited({ ...edited, notes: e.target.value })}
              className="h-9"
            />
          </div>
        </div>

        {/* Coaching Details Section */}
        <div className="border-t border-border pt-3 mt-3">
          <div className="text-xs font-semibold text-primary mb-2">COACHING DETAILS</div>
          
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">Instructions (How to Perform)</Label>
              <Textarea
                value={edited.instructions}
                onChange={(e) => setEdited({ ...edited, instructions: e.target.value })}
                rows={2}
                placeholder="Step-by-step instructions for this exercise..."
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Form Tips (Coaching Cues)</Label>
              <Textarea
                value={edited.form_tips}
                onChange={(e) => setEdited({ ...edited, form_tips: e.target.value })}
                rows={2}
                placeholder="Key form cues and common mistakes to avoid..."
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Video URL</Label>
              <div className="flex gap-2">
                <Input
                  value={edited.video_url}
                  onChange={(e) => setEdited({ ...edited, video_url: e.target.value })}
                  className="h-9"
                  placeholder="https://..."
                />
                {edited.video_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => window.open(edited.video_url, "_blank")}
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Coaching Section */}
        <div className="border-t border-border pt-3">
          <div className="text-xs font-semibold text-primary mb-2">ADVANCED COACHING</div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Coach Notes</Label>
              <Textarea
                value={edited.coach_notes}
                onChange={(e) => setEdited({ ...edited, coach_notes: e.target.value })}
                rows={2}
                placeholder="Private coaching notes..."
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Scaling Options</Label>
              <Textarea
                value={edited.scaling_options}
                onChange={(e) => setEdited({ ...edited, scaling_options: e.target.value })}
                rows={2}
                placeholder="Easier/harder variations..."
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Progression Notes</Label>
              <Textarea
                value={edited.progression_notes}
                onChange={(e) => setEdited({ ...edited, progression_notes: e.target.value })}
                rows={2}
                placeholder="How to progress next week..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button size="sm" variant="gold" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            Save Exercise
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded bg-muted/20 hover:bg-muted/30 group">
      <span className="text-sm flex-1">{exercise.exercise_name}</span>
      <span className="text-xs text-muted-foreground">
        {exercise.sets} × {exercise.reps_or_time}
      </span>
      {exercise.rest && <span className="text-xs text-muted-foreground">{exercise.rest} rest</span>}
      {exercise.video_url && <Video className="w-3 h-3 text-primary" />}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
        onClick={() => setIsEditing(true)}
      >
        <Edit2 className="w-3 h-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}
