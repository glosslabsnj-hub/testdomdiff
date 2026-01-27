import { useState } from "react";
import { Dumbbell, ChevronDown, ChevronRight, Edit2, Save, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useTemplateCategories,
  useProgramTemplates,
  useTemplateDetails,
  type TemplateCategory,
  type ProgramTemplate,
} from "@/hooks/useProgramTemplates";

export default function FreeWorldWorkoutTemplates() {
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
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Edit2 className="w-3 h-3" />
            </Button>
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

function TemplateDetailsView({
  details,
}: {
  details: {
    template: ProgramTemplate;
    weeks: Array<{ id: string; week_number: number; title: string | null; focus_description: string | null }>;
    days: Array<{ id: string; week_id: string | null; day_of_week: string; workout_name: string; is_rest_day: boolean | null }>;
    exercises: Array<{ id: string; day_id: string | null; exercise_name: string; sets: string | null; reps_or_time: string | null }>;
  };
}) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));

  const toggleWeek = (weekNum: number) => {
    const next = new Set(expandedWeeks);
    if (next.has(weekNum)) {
      next.delete(weekNum);
    } else {
      next.add(weekNum);
    }
    setExpandedWeeks(next);
  };

  const getDaysForWeek = (weekId: string) => {
    return details.days.filter((d) => d.week_id === weekId);
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
            <div className="flex items-center gap-2 cursor-pointer hover:text-purple-400 transition-colors">
              {expandedWeeks.has(week.week_number) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <span className="font-medium text-sm">
                Week {week.week_number}: {week.title || week.focus_description || "Training Week"}
              </span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="ml-6 mt-2 space-y-2">
              {getDaysForWeek(week.id).map((day) => (
                <div
                  key={day.id}
                  className={`p-2 rounded text-sm ${
                    day.is_rest_day ? "bg-muted/30 text-muted-foreground" : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {day.day_of_week}: {day.workout_name}
                    </span>
                    {!day.is_rest_day && (
                      <span className="text-xs text-muted-foreground">
                        {getExercisesForDay(day.id).length} exercises
                      </span>
                    )}
                  </div>
                  {!day.is_rest_day && getExercisesForDay(day.id).length > 0 && (
                    <div className="mt-2 pl-4 text-xs text-muted-foreground space-y-1">
                      {getExercisesForDay(day.id)
                        .slice(0, 4)
                        .map((ex) => (
                          <div key={ex.id}>
                            • {ex.exercise_name} — {ex.sets}×{ex.reps_or_time}
                          </div>
                        ))}
                      {getExercisesForDay(day.id).length > 4 && (
                        <div className="text-muted-foreground/70">
                          +{getExercisesForDay(day.id).length - 4} more...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
