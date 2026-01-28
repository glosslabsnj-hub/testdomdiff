import { useState, useCallback } from "react";
import { Dumbbell, ChevronDown, ChevronRight, Edit2, Save, X, Plus, Trash2, Wind, Flame, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  useTemplateCategories,
  useProgramTemplates,
  useTemplateDetails,
  type TemplateCategory,
  type ProgramTemplate,
  type TemplateExercise,
} from "@/hooks/useProgramTemplates";

// Map 6-section premium format to 4-section simple display
const SECTION_MAPPING: Record<string, string> = {
  warmup: "warmup",
  activation: "warmup",
  mobility: "warmup",
  main: "main",
  strength: "main",
  accessory: "main",
  finisher: "finisher",
  conditioning: "finisher",
  cooldown: "cooldown",
  recovery: "cooldown",
};

const SECTION_CONFIG = [
  { key: "warmup", label: "Warm-Up", icon: Wind, colorClass: "text-amber-400" },
  { key: "main", label: "Main Workout", icon: Dumbbell, colorClass: "text-primary" },
  { key: "finisher", label: "Finisher", icon: Flame, colorClass: "text-destructive" },
  { key: "cooldown", label: "Cool-Down", icon: Heart, colorClass: "text-blue-400" },
];

function getDisplaySection(sectionType: string | null): string {
  return SECTION_MAPPING[sectionType || "main"] || "main";
}

export default function ProgramLibrary() {
  const { data: categories = [], isLoading: categoriesLoading } = useTemplateCategories();
  const { data: templates = [], isLoading: templatesLoading } = useProgramTemplates();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    const next = new Set(expandedCategories);
    if (next.has(categoryId)) {
      next.delete(categoryId);
    } else {
      next.add(categoryId);
    }
    setExpandedCategories(next);
  };

  const toggleTemplate = (templateId: string) => {
    const next = new Set(expandedTemplates);
    if (next.has(templateId)) {
      next.delete(templateId);
      setSelectedTemplateId(null);
    } else {
      next.add(templateId);
      setSelectedTemplateId(templateId);
    }
    setExpandedTemplates(next);
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
            <h2 className="text-xl font-bold">Program Library</h2>
            <p className="text-sm text-muted-foreground">
              {templates.length} workout templates • Expand days to edit exercises
            </p>
          </div>
        </div>
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
                expandedTemplates={expandedTemplates}
                onToggleTemplate={toggleTemplate}
                selectedTemplateId={selectedTemplateId}
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
  expandedTemplates: Set<string>;
  onToggleTemplate: (id: string) => void;
  selectedTemplateId: string | null;
}

function CategorySection({
  category,
  templates,
  isExpanded,
  onToggle,
  expandedTemplates,
  onToggleTemplate,
  selectedTemplateId,
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
            <TemplateRow
              key={template.id}
              template={template}
              isExpanded={expandedTemplates.has(template.id)}
              onToggle={() => onToggleTemplate(template.id)}
              isSelected={selectedTemplateId === template.id}
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

interface TemplateRowProps {
  template: ProgramTemplate;
  isExpanded: boolean;
  onToggle: () => void;
  isSelected: boolean;
}

function TemplateRow({ template, isExpanded, onToggle, isSelected }: TemplateRowProps) {
  const { data: details, isLoading } = useTemplateDetails(isSelected ? template.id : null);

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div
          className={`w-full flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
            isExpanded
              ? "bg-blue-500/10 border-blue-500/50"
              : "bg-background border-border hover:border-blue-500/30"
          }`}
        >
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-blue-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="font-medium text-sm">{template.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {template.days_per_week || 4} days/week
            </Badge>
            {template.difficulty && (
              <Badge variant="outline" className="text-xs capitalize">
                {template.difficulty}
              </Badge>
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-6 mt-2 p-4 bg-background/50 rounded-lg border border-border">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : details ? (
            <TemplateDetailsView details={details} />
          ) : (
            <p className="text-sm text-muted-foreground">No details available</p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface TemplateDetailsViewProps {
  details: {
    template: ProgramTemplate;
    weeks: Array<{ id: string; week_number: number; title: string | null; focus_description: string | null }>;
    days: Array<{ id: string; week_id: string | null; day_of_week: string; workout_name: string; is_rest_day: boolean | null; display_order: number | null }>;
    exercises: TemplateExercise[];
  };
}

function TemplateDetailsView({ details }: TemplateDetailsViewProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

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

  const getDaysForWeek = (weekId: string) => {
    return details.days
      .filter((d) => d.week_id === weekId)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  };

  const getExercisesForDay = (dayId: string) => {
    return details.exercises.filter((e) => e.day_id === dayId);
  };

  if (details.weeks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This template has no weeks defined yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {details.weeks.map((week) => (
        <Collapsible
          key={week.id}
          open={expandedWeeks.has(week.week_number)}
          onOpenChange={() => toggleWeek(week.week_number)}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer hover:text-blue-400 transition-colors p-2 rounded hover:bg-muted/30">
              {expandedWeeks.has(week.week_number) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <span className="font-medium text-sm">
                Week {week.week_number}: {week.title || week.focus_description || "Training Week"}
              </span>
              <Badge variant="outline" className="text-xs ml-auto">
                {getDaysForWeek(week.id).filter(d => !d.is_rest_day).length} training days
              </Badge>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="ml-6 mt-2 space-y-2">
              {getDaysForWeek(week.id).map((day) => (
                <DayCard
                  key={day.id}
                  day={day}
                  exercises={getExercisesForDay(day.id)}
                  isExpanded={expandedDays.has(day.id)}
                  onToggle={() => toggleDay(day.id)}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}

interface DayCardProps {
  day: { id: string; day_of_week: string; workout_name: string; is_rest_day: boolean | null };
  exercises: TemplateExercise[];
  isExpanded: boolean;
  onToggle: () => void;
}

function DayCard({ day, exercises, isExpanded, onToggle }: DayCardProps) {
  const queryClient = useQueryClient();

  if (day.is_rest_day) {
    return (
      <div className="p-3 rounded-lg bg-muted/20 text-muted-foreground text-sm">
        <span className="font-medium">{day.day_of_week}:</span> Rest Day
      </div>
    );
  }

  // Group exercises by display section (mapping 6 sections to 4)
  const groupedExercises: Record<string, TemplateExercise[]> = {
    warmup: [],
    main: [],
    finisher: [],
    cooldown: [],
  };

  exercises.forEach((ex) => {
    const displaySection = getDisplaySection(ex.section_type);
    groupedExercises[displaySection].push(ex);
  });

  // Sort each group by display_order
  Object.keys(groupedExercises).forEach((key) => {
    groupedExercises[key].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  });

  const handleAddExercise = async (sectionType: string) => {
    // Map display section back to a database section type
    const dbSectionType = sectionType === "warmup" ? "activation" 
      : sectionType === "main" ? "strength" 
      : sectionType === "finisher" ? "conditioning" 
      : "recovery";

    try {
      const { error } = await supabase
        .from("program_template_exercises")
        .insert({
          day_id: day.id,
          section_type: dbSectionType,
          exercise_name: "New Exercise",
          sets: "3",
          reps_or_time: "10-12",
          rest: "60s",
          display_order: 99,
        });

      if (error) throw error;
      toast.success("Exercise added");
      queryClient.invalidateQueries({ queryKey: ["template-details"] });
    } catch (error) {
      console.error("Failed to add exercise:", error);
      toast.error("Failed to add exercise");
    }
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-blue-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="font-medium text-sm">
                {day.day_of_week}: {day.workout_name}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {exercises.length} exercises
            </Badge>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-6 mt-3 space-y-4 pb-2">
          {SECTION_CONFIG.map(({ key, label, icon: Icon, colorClass }) => {
            const sectionExercises = groupedExercises[key];
            
            return (
              <div key={key}>
                <div className={`flex items-center gap-2 text-xs uppercase tracking-wider ${colorClass} mb-2`}>
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  <span className="text-muted-foreground">({sectionExercises.length})</span>
                </div>
                <div className="space-y-1">
                  {sectionExercises.map((exercise) => (
                    <ExerciseRow key={exercise.id} exercise={exercise} />
                  ))}
                  {sectionExercises.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-1">No exercises</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs mt-1"
                  onClick={() => handleAddExercise(key)}
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
}

function ExerciseRow({ exercise }: { exercise: TemplateExercise }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    exercise_name: exercise.exercise_name,
    sets: exercise.sets || "",
    reps_or_time: exercise.reps_or_time || "",
    rest: exercise.rest || "",
    notes: exercise.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = useCallback(async () => {
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
        })
        .eq("id", exercise.id);

      if (error) throw error;
      toast.success("Exercise updated");
      queryClient.invalidateQueries({ queryKey: ["template-details"] });
      setIsEditing(false);
    } catch (err: unknown) {
      toast.error("Failed to update: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setSaving(false);
    }
  }, [editData, exercise.id, queryClient]);

  const handleDelete = useCallback(async () => {
    try {
      const { error } = await supabase
        .from("program_template_exercises")
        .delete()
        .eq("id", exercise.id);

      if (error) throw error;
      toast.success("Exercise removed");
      queryClient.invalidateQueries({ queryKey: ["template-details"] });
    } catch (err: unknown) {
      toast.error("Failed to delete: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  }, [exercise.id, queryClient]);

  const handleCancel = () => {
    setEditData({
      exercise_name: exercise.exercise_name,
      sets: exercise.sets || "",
      reps_or_time: exercise.reps_or_time || "",
      rest: exercise.rest || "",
      notes: exercise.notes || "",
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-3 rounded-lg bg-charcoal border border-blue-500/50 space-y-2">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-5">
            <Input
              value={editData.exercise_name}
              onChange={(e) => setEditData({ ...editData, exercise_name: e.target.value })}
              placeholder="Exercise name"
              className="h-8 text-sm"
            />
          </div>
          <div className="col-span-2">
            <Input
              value={editData.sets}
              onChange={(e) => setEditData({ ...editData, sets: e.target.value })}
              placeholder="Sets"
              className="h-8 text-sm text-center"
            />
          </div>
          <div className="col-span-2">
            <Input
              value={editData.reps_or_time}
              onChange={(e) => setEditData({ ...editData, reps_or_time: e.target.value })}
              placeholder="Reps"
              className="h-8 text-sm text-center"
            />
          </div>
          <div className="col-span-2">
            <Input
              value={editData.rest}
              onChange={(e) => setEditData({ ...editData, rest: e.target.value })}
              placeholder="Rest"
              className="h-8 text-sm text-center"
            />
          </div>
          <div className="col-span-1 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-green-400 hover:text-green-300"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={handleCancel}
              disabled={saving}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Input
          value={editData.notes}
          onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
          placeholder="Notes (optional)"
          className="h-8 text-sm"
        />
      </div>
    );
  }

  return (
    <div
      className="group flex items-center justify-between p-2 rounded hover:bg-muted/30 cursor-pointer transition-colors"
      onClick={() => setIsEditing(true)}
    >
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium">{exercise.exercise_name}</span>
        {exercise.notes && (
          <span className="text-xs text-muted-foreground ml-2">({exercise.notes})</span>
        )}
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="tabular-nums">{exercise.sets} sets</span>
        <span className="tabular-nums">{exercise.reps_or_time}</span>
        {exercise.rest && <span className="tabular-nums">{exercise.rest} rest</span>}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <Edit2 className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
