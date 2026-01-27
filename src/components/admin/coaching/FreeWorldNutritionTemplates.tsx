import { useState, useCallback, useRef, useEffect } from "react";
import { Utensils, ChevronDown, ChevronRight, Edit2, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useNutritionTemplateCategories,
  useNutritionTemplates,
  useNutritionTemplateDetails,
  type NutritionTemplateCategory,
  type NutritionTemplateWithCategory,
} from "@/hooks/useNutritionTemplates";
import { useNutritionTemplateSuggestion, getNutritionMatchQuality } from "@/hooks/useNutritionSuggestion";
import { type ClientWithSubscription } from "@/hooks/useClientAnalytics";
import ExpandableMealCard from "./ExpandableMealCard";
import NutritionGroceryList from "./NutritionGroceryList";

interface FreeWorldNutritionTemplatesProps {
  selectedClient?: ClientWithSubscription | null;
}

export default function FreeWorldNutritionTemplates({ selectedClient }: FreeWorldNutritionTemplatesProps) {
  const { data: categories = [], isLoading: categoriesLoading } = useNutritionTemplateCategories();
  const { data: templates = [], isLoading: templatesLoading } = useNutritionTemplates();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const templateRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Client profile for recommendations
  const clientProfile = selectedClient ? {
    goal: selectedClient.goal,
    goal_type: selectedClient.goal_type,
    activity_level: selectedClient.activity_level,
    weight: selectedClient.weight,
    height: selectedClient.height,
    age: selectedClient.age,
    dietary_restrictions: selectedClient.dietary_restrictions,
    meal_prep_preference: selectedClient.meal_prep_preference,
  } : null;

  const { recommendation } = useNutritionTemplateSuggestion(templates, categories, clientProfile);

  const handleViewRecommended = useCallback((templateId: string | null) => {
    if (!templateId || !recommendation) return;
    
    // Expand the category
    const nextCategories = new Set(expandedCategories);
    nextCategories.add(recommendation.category.id);
    setExpandedCategories(nextCategories);
    
    // Expand the template
    const nextTemplates = new Set(expandedTemplates);
    nextTemplates.add(recommendation.template.id);
    setExpandedTemplates(nextTemplates);
    setSelectedTemplateId(recommendation.template.id);
    
    // Scroll to template after expansion
    setTimeout(() => {
      const element = templateRefs.current[recommendation.template.id];
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }, [expandedCategories, expandedTemplates, recommendation]);

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
          {selectedClient && recommendation && (
            <NutritionRecommendationBanner
              clientName={selectedClient.first_name || selectedClient.email?.split("@")[0] || "Client"}
              recommendation={recommendation}
              onViewRecommended={() => handleViewRecommended(recommendation.template.id)}
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
                templateRefs={templateRefs}
                recommendedTemplateId={recommendation?.template.id}
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
                templateRefs={templateRefs}
                recommendedTemplateId={undefined}
              />
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// New Recommendation Banner Component
function NutritionRecommendationBanner({
  clientName,
  recommendation,
  onViewRecommended,
}: {
  clientName: string;
  recommendation: {
    category: NutritionTemplateCategory;
    template: NutritionTemplateWithCategory;
    score: number;
    reasons: string[];
    tdee: number;
    targetCalories: number;
  };
  onViewRecommended: () => void;
}) {
  const quality = getNutritionMatchQuality(recommendation.score);

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
            Category: <span className="text-foreground">{recommendation.category.name}</span>
          </div>
          
          {/* Template - Best Match */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-purple-400">{recommendation.template.name}</span>
            <Badge variant="secondary" className="text-xs">
              {recommendation.template.calorie_range_min}-{recommendation.template.calorie_range_max} cal
            </Badge>
            <Badge className={`text-xs ${quality.color} bg-transparent border`}>
              {quality.label}
            </Badge>
          </div>
          
          {/* TDEE/Target Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <span>TDEE: {recommendation.tdee} cal</span>
            <span>→</span>
            <span>Target: {recommendation.targetCalories} cal</span>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 shrink-0"
          onClick={onViewRecommended}
        >
          <Utensils className="w-4 h-4 mr-2" />
          View Template
        </Button>
      </div>
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
  templateRefs,
  recommendedTemplateId,
}: {
  category: NutritionTemplateCategory;
  templates: NutritionTemplateWithCategory[];
  isExpanded: boolean;
  onToggle: () => void;
  expandedTemplates: Set<string>;
  onToggleTemplate: (id: string) => void;
  selectedTemplateId: string | null;
  templateRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  recommendedTemplateId?: string;
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
              templateRef={(el) => { templateRefs.current[template.id] = el; }}
              isRecommended={template.id === recommendedTemplateId}
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
  templateRef,
  isRecommended,
}: {
  template: NutritionTemplateWithCategory;
  isExpanded: boolean;
  onToggle: () => void;
  isSelected: boolean;
  templateRef: (el: HTMLDivElement | null) => void;
  isRecommended: boolean;
}) {
  const { data: details, isLoading } = useNutritionTemplateDetails(isSelected ? template.id : null);

  return (
    <div ref={templateRef}>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div
            className={`w-full flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
              isExpanded
                ? "bg-purple-500/10 border-purple-500/50"
                : isRecommended
                ? "bg-purple-500/5 border-purple-500/30 hover:border-purple-500/50"
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
              {isRecommended && (
                <Badge className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/50">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Best Match
                </Badge>
              )}
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
    </div>
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
      prep_time_min: number | null;
      cook_time_min: number | null;
      servings: number | null;
      instructions: string | null;
      notes: string | null;
      image_url: string | null;
      display_order: number | null;
    }>;
  };
  template: NutritionTemplateWithCategory;
}) {
  const [activeWeek, setActiveWeek] = useState("1");
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());

  // Group days by week (7 days per week)
  const weeks = [1, 2, 3, 4];
  const getDaysForWeek = (weekNum: number) => {
    const startDay = (weekNum - 1) * 7 + 1;
    const endDay = weekNum * 7;
    return details.days.filter((d) => d.day_number >= startDay && d.day_number <= endDay);
  };

  const toggleMeal = (mealId: string) => {
    const next = new Set(expandedMeals);
    if (next.has(mealId)) {
      next.delete(mealId);
    } else {
      next.add(mealId);
    }
    setExpandedMeals(next);
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

  const currentWeekDays = getDaysForWeek(parseInt(activeWeek));

  return (
    <div className="space-y-4">
      {/* Macro summary */}
      <div className="grid grid-cols-3 gap-4 text-sm p-3 bg-muted/30 rounded-lg">
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

      {/* Week Tabs */}
      <Tabs value={activeWeek} onValueChange={setActiveWeek}>
        <div className="flex items-center justify-between mb-3">
          <TabsList className="bg-muted/50">
            {weeks.map((week) => (
              <TabsTrigger key={week} value={String(week)} className="text-xs">
                Week {week}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Grocery List for current week */}
          <NutritionGroceryList
            weekNumber={parseInt(activeWeek)}
            days={currentWeekDays}
            meals={details.meals}
          />
        </div>

        {weeks.map((weekNum) => (
          <TabsContent key={weekNum} value={String(weekNum)} className="space-y-3 mt-0">
            {getDaysForWeek(weekNum).map((day) => (
              <Collapsible key={day.id} defaultOpen={day.day_number === (weekNum - 1) * 7 + 1}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:text-purple-400 transition-colors p-2 rounded-lg hover:bg-muted/30">
                    <ChevronRight className="w-4 h-4 data-[state=open]:rotate-90 transition-transform" />
                    <span className="font-medium text-sm">{day.day_name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({getMealsForDay(day.id).length} meals)
                    </span>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-6 mt-1 space-y-2">
                    {getMealsForDay(day.id)
                      .sort((a, b) => getMealTypeOrder(a.meal_type) - getMealTypeOrder(b.meal_type))
                      .map((meal) => (
                        <ExpandableMealCard
                          key={meal.id}
                          meal={meal}
                          isExpanded={expandedMeals.has(meal.id)}
                          onToggle={() => toggleMeal(meal.id)}
                        />
                      ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
