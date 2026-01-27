import { useState, useCallback } from "react";
import { Utensils, ChevronDown, ChevronRight, Edit2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useNutritionTemplateCategories,
  useNutritionTemplates,
  useNutritionTemplateDetails,
  type NutritionTemplateCategory,
  type NutritionTemplateWithCategory,
} from "@/hooks/useNutritionTemplates";
import { type ClientWithSubscription } from "@/hooks/useClientAnalytics";
import ClientRecommendationBanner from "./ClientRecommendationBanner";

interface FreeWorldNutritionTemplatesProps {
  selectedClient?: ClientWithSubscription | null;
}

export default function FreeWorldNutritionTemplates({ selectedClient }: FreeWorldNutritionTemplatesProps) {
  const { data: categories = [], isLoading: categoriesLoading } = useNutritionTemplateCategories();
  const { data: templates = [], isLoading: templatesLoading } = useNutritionTemplates();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handleViewRecommended = useCallback((categoryId: string | null) => {
    if (!categoryId) return;
    const next = new Set(expandedCategories);
    next.add(categoryId);
    setExpandedCategories(next);
    // Scroll to category
    setTimeout(() => {
      const element = document.getElementById(`nutrition-category-${categoryId}`);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [expandedCategories]);

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

  // Group templates without a category
  const uncategorizedTemplates = templates.filter((t) => !t.category_id);

  const loading = categoriesLoading || templatesLoading;

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between py-4 flex-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Utensils className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Nutrition Template Library</h2>
            <p className="text-sm text-muted-foreground">
              {templates.length} complete meal plans organized by goal and activity
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
          {selectedClient && (
            <ClientRecommendationBanner
              client={selectedClient}
              type="nutrition"
              onViewRecommended={handleViewRecommended}
            />
          )}
          <div className="space-y-2 pr-4 pb-8">
            {categories.map((category) => (
              <NutritionCategoryAccordion
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
            {/* Uncategorized templates */}
            {uncategorizedTemplates.length > 0 && (
              <NutritionCategoryAccordion
                key="uncategorized"
                category={{
                  id: "uncategorized",
                  name: "Uncategorized",
                  description: "Templates pending categorization",
                  target_profile: "Various",
                  icon: null,
                  display_order: 99,
                  is_active: true,
                }}
                templates={uncategorizedTemplates}
                isExpanded={expandedCategories.has("uncategorized")}
                onToggle={() => toggleCategory("uncategorized")}
                expandedTemplates={expandedTemplates}
                onToggleTemplate={toggleTemplate}
                selectedTemplateId={selectedTemplateId}
              />
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function NutritionCategoryAccordion({
  category,
  templates,
  isExpanded,
  onToggle,
  expandedTemplates,
  onToggleTemplate,
  selectedTemplateId,
}: {
  category: NutritionTemplateCategory;
  templates: NutritionTemplateWithCategory[];
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
            <NutritionTemplateRow
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

function NutritionTemplateRow({
  template,
  isExpanded,
  onToggle,
  isSelected,
}: {
  template: NutritionTemplateWithCategory;
  isExpanded: boolean;
  onToggle: () => void;
  isSelected: boolean;
}) {
  const { data: details, isLoading } = useNutritionTemplateDetails(isSelected ? template.id : null);

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
              {template.calorie_range_min}-{template.calorie_range_max} cal
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
            <NutritionDetailsView details={details} template={template} />
          ) : (
            <p className="text-sm text-muted-foreground">No details available</p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function NutritionDetailsView({
  details,
  template,
}: {
  details: {
    days: Array<{ id: string; day_name: string; day_number: number }>;
    meals: Array<{
      id: string;
      day_id: string;
      meal_type: string;
      meal_name: string;
      calories: number;
      protein_g: number;
      carbs_g: number;
      fats_g: number;
    }>;
  };
  template: NutritionTemplateWithCategory;
}) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));

  const toggleDay = (dayNum: number) => {
    const next = new Set(expandedDays);
    if (next.has(dayNum)) {
      next.delete(dayNum);
    } else {
      next.add(dayNum);
    }
    setExpandedDays(next);
  };

  const getMealsForDay = (dayId: string) => {
    return details.meals.filter((m) => m.day_id === dayId);
  };

  const getMealTypeOrder = (type: string) => {
    const order: Record<string, number> = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
    return order[type] ?? 4;
  };

  if (details.days.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          This template has no days defined yet.
        </p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Protein:</span>{" "}
            <span className="font-medium">{template.daily_protein_g}g</span>
          </div>
          <div>
            <span className="text-muted-foreground">Carbs:</span>{" "}
            <span className="font-medium">{template.daily_carbs_g}g</span>
          </div>
          <div>
            <span className="text-muted-foreground">Fats:</span>{" "}
            <span className="font-medium">{template.daily_fats_g}g</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Macro summary */}
      <div className="grid grid-cols-3 gap-4 text-sm mb-4 p-3 bg-muted/30 rounded-lg">
        <div>
          <span className="text-muted-foreground">Protein:</span>{" "}
          <span className="font-medium text-green-400">{template.daily_protein_g}g</span>
        </div>
        <div>
          <span className="text-muted-foreground">Carbs:</span>{" "}
          <span className="font-medium text-blue-400">{template.daily_carbs_g}g</span>
        </div>
        <div>
          <span className="text-muted-foreground">Fats:</span>{" "}
          <span className="font-medium text-amber-400">{template.daily_fats_g}g</span>
        </div>
      </div>

      {/* Days */}
      {details.days.map((day) => (
        <Collapsible
          key={day.id}
          open={expandedDays.has(day.day_number)}
          onOpenChange={() => toggleDay(day.day_number)}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer hover:text-purple-400 transition-colors">
              {expandedDays.has(day.day_number) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <span className="font-medium text-sm">
                Day {day.day_number}: {day.day_name}
              </span>
              <span className="text-xs text-muted-foreground">
                ({getMealsForDay(day.id).length} meals)
              </span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="ml-6 mt-2 space-y-2">
              {getMealsForDay(day.id)
                .sort((a, b) => getMealTypeOrder(a.meal_type) - getMealTypeOrder(b.meal_type))
                .map((meal) => (
                  <div
                    key={meal.id}
                    className="p-2 rounded text-sm bg-muted/50 flex items-center justify-between"
                  >
                    <div>
                      <span className="capitalize text-muted-foreground">{meal.meal_type}:</span>{" "}
                      <span className="font-medium">{meal.meal_name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {meal.calories} cal • P{meal.protein_g}g C{meal.carbs_g}g F{meal.fats_g}g
                    </div>
                  </div>
                ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
