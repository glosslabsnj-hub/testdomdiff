import { useState } from "react";
import { Dumbbell, ChevronDown, ChevronRight, Edit2, Save, X, Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  useTemplateCategories,
  useProgramTemplates,
  useTemplateDetails,
  useUpdateTemplate,
  type TemplateCategory,
  type ProgramTemplate,
  type TemplateExercise,
} from "@/hooks/useProgramTemplates";

export default function ProgramLibrary() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading: categoriesLoading } = useTemplateCategories();
  const { data: templates = [], isLoading: templatesLoading } = useProgramTemplates();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const updateTemplateMutation = useUpdateTemplate();

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

  const loading = categoriesLoading || templatesLoading;

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between py-4 flex-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Workout Template Library</h2>
            <p className="text-sm text-muted-foreground">
              {templates.length} pre-built 4-week programs • Click Edit for full inline editing
            </p>
          </div>
        </div>
        <Button variant="goldOutline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Template
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4 flex-1">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
}

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
        <div className="w-full flex items-center justify-between p-4 bg-charcoal rounded-lg border border-border hover:border-blue-500/50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-blue-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <span className="font-medium">{category.name}</span>
              <span className="text-muted-foreground ml-2 text-sm">
                ({templates.length} templates)
              </span>
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
            <TemplateEditableRow
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

interface TemplateEditableRowProps {
  template: ProgramTemplate;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  allCategories: TemplateCategory[];
}

function TemplateEditableRow({
  template,
  isEditing,
  onEdit,
  onCancel,
  allCategories,
}: TemplateEditableRowProps) {
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

  if (!isEditing) {
    return (
      <div className="w-full flex items-center justify-between p-3 rounded-lg border bg-background border-border hover:border-blue-500/30 transition-colors">
        <div className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">{template.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {template.days_per_week || 4} days/week
          </Badge>
          <Button variant="ghost" size="sm" className="h-7" onClick={onEdit}>
            <Edit2 className="w-3 h-3 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-blue-500/50 bg-blue-500/5 overflow-hidden">
      {/* Edit Header */}
      <div className="flex items-center justify-between p-3 bg-blue-500/10 border-b border-blue-500/30">
        <div className="flex items-center gap-2">
          <Edit2 className="w-4 h-4 text-blue-400" />
          <span className="font-medium text-sm">Editing: {template.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSaveTemplate}
          >
            <Save className="w-4 h-4 mr-1" />
            Save Template
          </Button>
        </div>
      </div>

      {/* Template Info Fields */}
      <div className="p-4 space-y-4 border-b border-border">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Template Name</label>
            <Input
              value={editedTemplate.name}
              onChange={(e) => setEditedTemplate({ ...editedTemplate, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Category</label>
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
            <label className="text-xs text-muted-foreground mb-1 block">Days Per Week</label>
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
            <label className="text-xs text-muted-foreground mb-1 block">Difficulty</label>
            <Select
              value={editedTemplate.difficulty}
              onValueChange={(v) => setEditedTemplate({ ...editedTemplate, difficulty: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Description</label>
          <Textarea
            value={editedTemplate.description}
            onChange={(e) => setEditedTemplate({ ...editedTemplate, description: e.target.value })}
            rows={2}
          />
        </div>
      </div>

      {/* Weeks/Days/Exercises Editor */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
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
                        <ChevronDown className="w-4 h-4 text-blue-400" />
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
                        const sections = ["warmup", "main", "finisher", "cooldown"];

                        return (
                          <Collapsible
                            key={day.id}
                            open={expandedDays.has(day.id)}
                            onOpenChange={() => toggleDay(day.id)}
                          >
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/30 cursor-pointer">
                                {expandedDays.has(day.id) ? (
                                  <ChevronDown className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                                <span className="text-sm font-medium">{day.day_of_week}: {day.workout_name}</span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {dayExercises.length} exercises
                                </span>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="ml-6 mt-2 space-y-3">
                                {sections.map((section) => {
                                  const sectionExercises = dayExercises.filter(
                                    (e) => (e.section_type || "main") === section
                                  );
                                  if (sectionExercises.length === 0 && section !== "main") return null;

                                  return (
                                    <div key={section} className="space-y-1">
                                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        {section}
                                      </p>
                                      {sectionExercises.map((exercise) => (
                                        <ExerciseEditRow
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
            No weeks defined. Save template and assign to a client to auto-generate structure.
          </p>
        )}
      </div>
    </div>
  );
}

interface ExerciseEditRowProps {
  exercise: TemplateExercise;
  onSave: (updates: Partial<TemplateExercise>) => void;
  onDelete: () => void;
  isSaving: boolean;
}

function ExerciseEditRow({ exercise, onSave, onDelete, isSaving }: ExerciseEditRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState({
    exercise_name: exercise.exercise_name,
    sets: exercise.sets || "",
    reps_or_time: exercise.reps_or_time || "",
    rest: exercise.rest || "",
    notes: exercise.notes || "",
  });

  const handleSave = () => {
    onSave(edited);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-2 rounded border border-blue-500/30 bg-blue-500/5 space-y-2">
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-2">
            <Input
              value={edited.exercise_name}
              onChange={(e) => setEdited({ ...edited, exercise_name: e.target.value })}
              placeholder="Exercise name"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Input
              value={edited.sets}
              onChange={(e) => setEdited({ ...edited, sets: e.target.value })}
              placeholder="Sets"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Input
              value={edited.reps_or_time}
              onChange={(e) => setEdited({ ...edited, reps_or_time: e.target.value })}
              placeholder="Reps"
              className="h-8 text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={edited.rest}
            onChange={(e) => setEdited({ ...edited, rest: e.target.value })}
            placeholder="Rest"
            className="h-8 text-sm w-24"
          />
          <Input
            value={edited.notes}
            onChange={(e) => setEdited({ ...edited, notes: e.target.value })}
            placeholder="Notes"
            className="h-8 text-sm flex-1"
          />
          <Button size="sm" className="h-8" onClick={handleSave} disabled={isSaving}>
            <Save className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8" onClick={() => setIsEditing(false)}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded bg-muted/20 hover:bg-muted/30 group">
      <GripVertical className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
      <span className="text-sm flex-1">{exercise.exercise_name}</span>
      <span className="text-xs text-muted-foreground">
        {exercise.sets} × {exercise.reps_or_time}
      </span>
      {exercise.rest && (
        <span className="text-xs text-muted-foreground">{exercise.rest} rest</span>
      )}
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
