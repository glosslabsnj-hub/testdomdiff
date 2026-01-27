import { useState } from "react";
import { Utensils, ChevronDown, ChevronRight, Edit2, Save, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  useNutritionTemplateCategories,
  useNutritionTemplates,
  useNutritionTemplateDetails,
  useUpdateNutritionTemplate,
  useUpdateNutritionMeal,
  type NutritionTemplateCategory,
  type NutritionTemplateWithCategory,
  type NutritionMealPlanMeal,
} from "@/hooks/useNutritionTemplates";

const DIETARY_TAGS = ["gluten-free", "dairy-free", "vegetarian", "keto"];

export default function NutritionLibrary() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading: categoriesLoading } = useNutritionTemplateCategories();
  const { data: templates = [], isLoading: templatesLoading } = useNutritionTemplates();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

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

  const uncategorizedTemplates = templates.filter((t) => !t.category_id);
  const loading = categoriesLoading || templatesLoading;

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between py-4 flex-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Utensils className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Nutrition Template Library</h2>
            <p className="text-sm text-muted-foreground">
              {templates.length} complete meal plans • Click Edit for full inline editing
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
              <NutritionCategorySection
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
            {uncategorizedTemplates.length > 0 && (
              <NutritionCategorySection
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
                editingTemplateId={editingTemplateId}
                onEditTemplate={setEditingTemplateId}
                allCategories={categories}
              />
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

interface NutritionCategorySectionProps {
  category: NutritionTemplateCategory;
  templates: NutritionTemplateWithCategory[];
  isExpanded: boolean;
  onToggle: () => void;
  editingTemplateId: string | null;
  onEditTemplate: (id: string | null) => void;
  allCategories: NutritionTemplateCategory[];
}

function NutritionCategorySection({
  category,
  templates,
  isExpanded,
  onToggle,
  editingTemplateId,
  onEditTemplate,
  allCategories,
}: NutritionCategorySectionProps) {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div className="w-full flex items-center justify-between p-4 bg-charcoal rounded-lg border border-border hover:border-green-500/50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-green-400" />
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
            <NutritionTemplateEditableRow
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

interface NutritionTemplateEditableRowProps {
  template: NutritionTemplateWithCategory;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  allCategories: NutritionTemplateCategory[];
}

function NutritionTemplateEditableRow({
  template,
  isEditing,
  onEdit,
  onCancel,
  allCategories,
}: NutritionTemplateEditableRowProps) {
  const queryClient = useQueryClient();
  const { data: details, isLoading } = useNutritionTemplateDetails(isEditing ? template.id : null);
  const updateTemplateMutation = useUpdateNutritionTemplate();
  const updateMealMutation = useUpdateNutritionMeal();

  const [editedTemplate, setEditedTemplate] = useState({
    name: template.name,
    description: template.description || "",
    category_id: template.category_id || "",
    goal_type: template.goal_type,
    calorie_range_min: template.calorie_range_min,
    calorie_range_max: template.calorie_range_max,
    daily_protein_g: template.daily_protein_g,
    daily_carbs_g: template.daily_carbs_g,
    daily_fats_g: template.daily_fats_g,
    dietary_tags: template.dietary_tags || [],
  });

  const [activeWeek, setActiveWeek] = useState("1");
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());

  const handleSaveTemplate = async () => {
    try {
      await updateTemplateMutation.mutateAsync({
        id: template.id,
        name: editedTemplate.name,
        description: editedTemplate.description || null,
        category_id: editedTemplate.category_id || null,
        goal_type: editedTemplate.goal_type,
        calorie_range_min: editedTemplate.calorie_range_min,
        calorie_range_max: editedTemplate.calorie_range_max,
        daily_protein_g: editedTemplate.daily_protein_g,
        daily_carbs_g: editedTemplate.daily_carbs_g,
        daily_fats_g: editedTemplate.daily_fats_g,
        dietary_tags: editedTemplate.dietary_tags,
      });
      onCancel();
    } catch (error) {
      console.error("Failed to save template:", error);
    }
  };

  const handleSaveMeal = async (mealId: string, updates: Partial<NutritionMealPlanMeal>) => {
    try {
      await updateMealMutation.mutateAsync({ id: mealId, ...updates });
      queryClient.invalidateQueries({ queryKey: ["nutrition-template-details", template.id] });
    } catch (error) {
      console.error("Failed to update meal:", error);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      const { error } = await supabase
        .from("meal_plan_meals")
        .delete()
        .eq("id", mealId);

      if (error) throw error;
      toast.success("Meal removed");
      queryClient.invalidateQueries({ queryKey: ["nutrition-template-details", template.id] });
    } catch (error) {
      console.error("Failed to delete meal:", error);
      toast.error("Failed to delete meal");
    }
  };

  const toggleDietaryTag = (tag: string) => {
    const current = editedTemplate.dietary_tags || [];
    if (current.includes(tag)) {
      setEditedTemplate({
        ...editedTemplate,
        dietary_tags: current.filter((t) => t !== tag),
      });
    } else {
      setEditedTemplate({
        ...editedTemplate,
        dietary_tags: [...current, tag],
      });
    }
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

  // Get days for current week
  const getDaysForWeek = (weekNum: number) => {
    if (!details) return [];
    const startDay = (weekNum - 1) * 7 + 1;
    const endDay = weekNum * 7;
    return details.days.filter((d) => d.day_number >= startDay && d.day_number <= endDay);
  };

  const getMealsForDay = (dayId: string) => {
    if (!details) return [];
    return details.meals
      .filter((m) => m.day_id === dayId)
      .sort((a, b) => {
        const order: Record<string, number> = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
        return (order[a.meal_type] ?? 4) - (order[b.meal_type] ?? 4);
      });
  };

  if (!isEditing) {
    return (
      <div className="w-full flex items-center justify-between p-3 rounded-lg border bg-background border-border hover:border-green-500/30 transition-colors">
        <div className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">{template.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {template.calorie_range_min}-{template.calorie_range_max} cal
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
    <div className="rounded-lg border-2 border-green-500/50 bg-green-500/5 overflow-hidden">
      {/* Edit Header */}
      <div className="flex items-center justify-between p-3 bg-green-500/10 border-b border-green-500/30">
        <div className="flex items-center gap-2">
          <Edit2 className="w-4 h-4 text-green-400" />
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
            className="bg-green-600 hover:bg-green-700"
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

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Calorie Range</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={editedTemplate.calorie_range_min}
                onChange={(e) => setEditedTemplate({ ...editedTemplate, calorie_range_min: parseInt(e.target.value) || 0 })}
                className="w-20"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                value={editedTemplate.calorie_range_max}
                onChange={(e) => setEditedTemplate({ ...editedTemplate, calorie_range_max: parseInt(e.target.value) || 0 })}
                className="w-20"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Goal Type</label>
            <Select
              value={editedTemplate.goal_type}
              onValueChange={(v) => setEditedTemplate({ ...editedTemplate, goal_type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fat_loss">Fat Loss</SelectItem>
                <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                <SelectItem value="recomposition">Recomposition</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Daily Macros (g)</label>
            <div className="flex items-center gap-1 text-xs">
              <div className="flex-1">
                <span className="text-muted-foreground">P:</span>
                <Input
                  type="number"
                  value={editedTemplate.daily_protein_g}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, daily_protein_g: parseInt(e.target.value) || 0 })}
                  className="h-7 w-14 inline-block ml-1"
                />
              </div>
              <div className="flex-1">
                <span className="text-muted-foreground">C:</span>
                <Input
                  type="number"
                  value={editedTemplate.daily_carbs_g}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, daily_carbs_g: parseInt(e.target.value) || 0 })}
                  className="h-7 w-14 inline-block ml-1"
                />
              </div>
              <div className="flex-1">
                <span className="text-muted-foreground">F:</span>
                <Input
                  type="number"
                  value={editedTemplate.daily_fats_g}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, daily_fats_g: parseInt(e.target.value) || 0 })}
                  className="h-7 w-14 inline-block ml-1"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Dietary Tags</label>
          <div className="flex flex-wrap gap-2">
            {DIETARY_TAGS.map((tag) => (
              <div key={tag} className="flex items-center gap-2">
                <Checkbox
                  id={`tag-${tag}`}
                  checked={(editedTemplate.dietary_tags || []).includes(tag)}
                  onCheckedChange={() => toggleDietaryTag(tag)}
                />
                <label htmlFor={`tag-${tag}`} className="text-sm capitalize cursor-pointer">
                  {tag}
                </label>
              </div>
            ))}
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

      {/* Weeks/Days/Meals Editor */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : details && details.days.length > 0 ? (
          <div className="space-y-4">
            {/* Week Tabs */}
            <Tabs value={activeWeek} onValueChange={setActiveWeek}>
              <TabsList className="grid grid-cols-4 w-full max-w-sm">
                {[1, 2, 3, 4].map((week) => (
                  <TabsTrigger key={week} value={String(week)}>
                    Week {week}
                  </TabsTrigger>
                ))}
              </TabsList>

              {[1, 2, 3, 4].map((week) => (
                <TabsContent key={week} value={String(week)} className="mt-4 space-y-3">
                  {getDaysForWeek(week).map((day) => {
                    const meals = getMealsForDay(day.id);
                    
                    return (
                      <div key={day.id} className="border border-border rounded-lg p-3">
                        <p className="font-medium text-sm mb-2">Day {day.day_number}: {day.day_name}</p>
                        <div className="space-y-2">
                          {meals.map((meal) => (
                            <MealEditRow
                              key={meal.id}
                              meal={meal}
                              isExpanded={expandedMeals.has(meal.id)}
                              onToggle={() => toggleMeal(meal.id)}
                              onSave={(updates) => handleSaveMeal(meal.id, updates)}
                              onDelete={() => handleDeleteMeal(meal.id)}
                            />
                          ))}
                          {meals.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-2">No meals defined</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {getDaysForWeek(week).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No days defined for this week
                    </p>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No meal plan days defined yet.
          </p>
        )}
      </div>
    </div>
  );
}

interface MealEditRowProps {
  meal: NutritionMealPlanMeal;
  isExpanded: boolean;
  onToggle: () => void;
  onSave: (updates: Partial<NutritionMealPlanMeal>) => void;
  onDelete: () => void;
}

function MealEditRow({ meal, isExpanded, onToggle, onSave, onDelete }: MealEditRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState({
    meal_name: meal.meal_name,
    calories: meal.calories,
    protein_g: meal.protein_g,
    carbs_g: meal.carbs_g,
    fats_g: meal.fats_g,
    prep_time_min: meal.prep_time_min || 0,
    instructions: meal.instructions || "",
  });

  const handleSave = () => {
    onSave(edited);
    setIsEditing(false);
  };

  const mealTypeColor: Record<string, string> = {
    breakfast: "text-yellow-400",
    lunch: "text-orange-400",
    dinner: "text-red-400",
    snack: "text-purple-400",
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-2 rounded hover:bg-muted/30 cursor-pointer group">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-green-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <span className={`text-xs font-medium uppercase ${mealTypeColor[meal.meal_type] || "text-muted-foreground"}`}>
              {meal.meal_type}:
            </span>
            <span className="text-sm">{meal.meal_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{meal.calories} cal</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                if (!isExpanded) onToggle();
              }}
            >
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-6 mt-2 p-3 bg-muted/20 rounded-lg space-y-3">
          {isEditing ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Meal Name</label>
                  <Input
                    value={edited.meal_name}
                    onChange={(e) => setEdited({ ...edited, meal_name: e.target.value })}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Prep Time (min)</label>
                  <Input
                    type="number"
                    value={edited.prep_time_min}
                    onChange={(e) => setEdited({ ...edited, prep_time_min: parseInt(e.target.value) || 0 })}
                    className="h-8"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Calories</label>
                  <Input
                    type="number"
                    value={edited.calories}
                    onChange={(e) => setEdited({ ...edited, calories: parseInt(e.target.value) || 0 })}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Protein (g)</label>
                  <Input
                    type="number"
                    value={edited.protein_g}
                    onChange={(e) => setEdited({ ...edited, protein_g: parseInt(e.target.value) || 0 })}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Carbs (g)</label>
                  <Input
                    type="number"
                    value={edited.carbs_g}
                    onChange={(e) => setEdited({ ...edited, carbs_g: parseInt(e.target.value) || 0 })}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Fats (g)</label>
                  <Input
                    type="number"
                    value={edited.fats_g}
                    onChange={(e) => setEdited({ ...edited, fats_g: parseInt(e.target.value) || 0 })}
                    className="h-8"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Instructions</label>
                <Textarea
                  value={edited.instructions}
                  onChange={(e) => setEdited({ ...edited, instructions: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-green-400">{meal.protein_g}g P</span>
                <span className="text-blue-400">{meal.carbs_g}g C</span>
                <span className="text-yellow-400">{meal.fats_g}g F</span>
                {meal.prep_time_min && (
                  <span className="text-muted-foreground">{meal.prep_time_min} min prep</span>
                )}
              </div>
              {meal.instructions && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {meal.instructions}
                </p>
              )}
              {meal.ingredients && Array.isArray(meal.ingredients) && meal.ingredients.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Ingredients:</p>
                  <ul className="text-sm text-muted-foreground space-y-0.5">
                    {(meal.ingredients as Array<{ item: string; amount: string }>).map((ing, i) => (
                      <li key={i}>• {ing.amount} {ing.item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
