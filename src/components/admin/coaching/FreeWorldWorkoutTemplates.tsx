import { useState, useCallback, useRef } from "react";
import { Dumbbell, ChevronDown, ChevronRight, Edit2, Save, X, Plus, Clock, Flame, Heart, Wind, Star } from "lucide-react";
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
import { useTemplateSuggestion, getMatchQuality } from "@/hooks/useTemplateSuggestion";
import { useWorkoutTemplateSuggestion, getWorkoutMatchQuality } from "@/hooks/useWorkoutSuggestion";
import { type ClientWithSubscription } from "@/hooks/useClientAnalytics";

interface FreeWorldWorkoutTemplatesProps {
  selectedClient?: ClientWithSubscription | null;
}

export default function FreeWorldWorkoutTemplates({ selectedClient }: FreeWorldWorkoutTemplatesProps) {
  const { data: categories = [], isLoading: categoriesLoading } = useTemplateCategories();
  const { data: templates = [], isLoading: templatesLoading } = useProgramTemplates();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const templateRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Client profile for category recommendation
  const clientProfile = selectedClient ? {
    experience: selectedClient.experience,
    body_fat_estimate: selectedClient.body_fat_estimate,
    activity_level: selectedClient.activity_level,
    training_days_per_week: selectedClient.training_days_per_week,
    injuries: selectedClient.injuries,
    goal: selectedClient.goal,
    equipment: selectedClient.equipment,
    training_style: selectedClient.training_style,
    session_length_preference: selectedClient.session_length_preference,
  } : null;

  // Get recommended category first
  const { recommendedCategory: categoryRecommendation } = useTemplateSuggestion(categories, clientProfile);
  
  // Then get recommended template within that category
  const { recommendation: templateRecommendation } = useWorkoutTemplateSuggestion(
    templates,
    categories,
    categoryRecommendation?.category || null,
    clientProfile
  );

  const handleViewRecommended = useCallback(() => {
    if (!templateRecommendation) return;
    
    // Expand the category
    const nextCategories = new Set(expandedCategories);
    nextCategories.add(templateRecommendation.category.id);
    setExpandedCategories(nextCategories);
    
    // Expand the template
    const nextTemplates = new Set(expandedTemplates);
    nextTemplates.add(templateRecommendation.template.id);
    setExpandedTemplates(nextTemplates);
    setSelectedTemplateId(templateRecommendation.template.id);
    
    // Scroll to template after expansion
    setTimeout(() => {
      const element = templateRefs.current[templateRecommendation.template.id];
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }, [expandedCategories, expandedTemplates, templateRecommendation]);

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
  const clientName = selectedClient?.first_name || selectedClient?.email?.split("@")[0] || "Client";

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between py-4 flex-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Workout Template Library</h2>
            <p className="text-sm text-muted-foreground">
              {templates.length} pre-built 4-week programs organized by experience level
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
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <ScrollArea className="flex-1 min-h-0">
          {/* Client Recommendation Banner */}
          {selectedClient && templateRecommendation && categoryRecommendation && (
            <WorkoutRecommendationBanner
              clientName={clientName}
              categoryRecommendation={categoryRecommendation}
              templateRecommendation={templateRecommendation}
              onViewRecommended={handleViewRecommended}
            />
          )}
          <div className="space-y-2 pr-4 pb-8">
            {categories.map((category) => (
              <CategoryAccordion
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

// New Recommendation Banner Component
function WorkoutRecommendationBanner({
  clientName,
  categoryRecommendation,
  templateRecommendation,
  onViewRecommended,
}: {
  clientName: string;
  categoryRecommendation: {
    category: TemplateCategory;
    score: number;
    reasons: string[];
  };
  templateRecommendation: {
    category: TemplateCategory;
    template: ProgramTemplate;
    score: number;
    reasons: string[];
  };
  onViewRecommended: () => void;
}) {
  const categoryQuality = getMatchQuality(categoryRecommendation.score);
  const templateQuality = getWorkoutMatchQuality(templateRecommendation.score);

  return (
    <div className="mb-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-purple-400 fill-purple-400" />
            <span className="text-sm font-medium">Recommended for {clientName}:</span>
          </div>
          
          {/* Category */}
          <div className="text-sm text-muted-foreground mb-1">
            Category: <span className="text-foreground">{categoryRecommendation.category.name}</span>
            <Badge className={`text-xs ${categoryQuality.color} bg-transparent border ml-2`}>
              {categoryQuality.label}
            </Badge>
          </div>
          
          {/* Template - Best Match */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-purple-400">{templateRecommendation.template.name}</span>
            <Badge variant="secondary" className="text-xs">
              {templateRecommendation.template.days_per_week || 4} days/week
            </Badge>
            <Badge className={`text-xs ${templateQuality.color} bg-transparent border`}>
              {templateQuality.label}
            </Badge>
          </div>
          
          {/* Reasons */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-2">
            {templateRecommendation.reasons.slice(0, 3).map((reason, i) => (
              <span key={i}>• {reason}</span>
            ))}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 shrink-0"
          onClick={onViewRecommended}
        >
          <Dumbbell className="w-4 h-4 mr-2" />
          View Template
        </Button>
      </div>
    </div>
  );
}

function CategoryAccordion({
  category,
  templates,
  isExpanded,
  onToggle,
  expandedTemplates,
  onToggleTemplate,
  selectedTemplateId,
}: {
  category: TemplateCategory;
  templates: ProgramTemplate[];
  isExpanded: boolean;
  onToggle: () => void;
  expandedTemplates: Set<string>;
  onToggleTemplate: (id: string) => void;
  selectedTemplateId: string | null;
}) {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div className="w-full flex items-center justify-between p-4 bg-charcoal rounded-lg border border-border hover:border-purple-500/50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-purple-400" />
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

function TemplateRow({
  template,
  isExpanded,
  onToggle,
  isSelected,
}: {
  template: ProgramTemplate;
  isExpanded: boolean;
  onToggle: () => void;
  isSelected: boolean;
}) {
  const { data: details, isLoading } = useTemplateDetails(isSelected ? template.id : null);

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div
          className={`w-full flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
            isExpanded
              ? "bg-purple-500/10 border-purple-500/50"
              : "bg-background border-border hover:border-purple-500/30"
          }`}
        >
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-purple-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="font-medium text-sm">{template.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {template.days_per_week || 4} days/week
            </Badge>
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

interface TemplateDetailsProps {
  details: {
    template: ProgramTemplate;
    weeks: Array<{ id: string; week_number: number; title: string | null; focus_description: string | null }>;
    days: Array<{ id: string; week_id: string | null; day_of_week: string; workout_name: string; is_rest_day: boolean | null; display_order: number | null }>;
    exercises: TemplateExercise[];
  };
}

function TemplateDetailsView({ details }: TemplateDetailsProps) {
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
        This template has no weeks defined yet. Assign it to auto-generate a 4-week structure.
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
            <div className="flex items-center gap-2 cursor-pointer hover:text-purple-400 transition-colors p-2 rounded hover:bg-muted/30">
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
  if (day.is_rest_day) {
    return (
      <div className="p-3 rounded-lg bg-muted/20 text-muted-foreground text-sm">
        <span className="font-medium">{day.day_of_week}:</span> Rest Day
      </div>
    );
  }

  // Map 6-section premium format to 4-section simple display
  const warmupExercises = exercises.filter(e => 
    ["warmup", "activation", "mobility"].includes(e.section_type || "")
  );
  const mainExercises = exercises.filter(e => 
    ["main", "strength", "accessory"].includes(e.section_type || "") || !e.section_type
  );
  const finisherExercises = exercises.filter(e => 
    ["finisher", "conditioning"].includes(e.section_type || "")
  );
  const cooldownExercises = exercises.filter(e => 
    ["cooldown", "recovery"].includes(e.section_type || "")
  );

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-purple-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="font-medium text-sm">
                {day.day_of_week}: {day.workout_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {exercises.length} exercises
              </Badge>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                <Edit2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-6 mt-3 space-y-4 pb-2">
          {/* Warmup Section */}
          {warmupExercises.length > 0 && (
            <ExerciseSection
              title="Warm-Up"
              icon={<Wind className="w-4 h-4" />}
              exercises={warmupExercises}
              colorClass="text-amber-400"
            />
          )}

          {/* Main Workout Section */}
          {mainExercises.length > 0 && (
            <ExerciseSection
              title="Main Workout"
              icon={<Dumbbell className="w-4 h-4" />}
              exercises={mainExercises}
              colorClass="text-primary"
            />
          )}

          {/* Finisher Section */}
          {finisherExercises.length > 0 && (
            <ExerciseSection
              title="Finisher"
              icon={<Flame className="w-4 h-4" />}
              exercises={finisherExercises}
              colorClass="text-destructive"
            />
          )}

          {/* Cooldown Section */}
          {cooldownExercises.length > 0 && (
            <ExerciseSection
              title="Cool-Down"
              icon={<Heart className="w-4 h-4" />}
              exercises={cooldownExercises}
              colorClass="text-blue-400"
            />
          )}

          {exercises.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No exercises defined yet
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface ExerciseSectionProps {
  title: string;
  icon: React.ReactNode;
  exercises: TemplateExercise[];
  colorClass: string;
}

function ExerciseSection({ title, icon, exercises, colorClass }: ExerciseSectionProps) {
  return (
    <div>
      <div className={`flex items-center gap-2 text-xs uppercase tracking-wider ${colorClass} mb-2`}>
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-1">
        {exercises
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          .map((exercise) => (
            <ExerciseRow key={exercise.id} exercise={exercise} />
          ))}
      </div>
    </div>
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
      <div className="p-3 rounded-lg bg-charcoal border border-purple-500/50 space-y-2">
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
      </div>
    </div>
  );
}
