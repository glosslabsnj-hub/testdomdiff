import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Edit, Trash2, Loader2, ChefHat, Calendar, 
  Flame, Beef, Wheat, Droplet, Clock, Users, ArrowLeft, X
} from "lucide-react";
import { useMealPlanTemplates, useMealPlanDays, useMealPlanMeals } from "@/hooks/useMealPlanTemplates";
import { GOAL_OPTIONS } from "@/lib/constants";
import type { MealPlanTemplate, MealPlanDay, MealPlanMeal, MealIngredient } from "@/hooks/useMealPlanAssignment";

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast", icon: "🌅" },
  { value: "lunch", label: "Lunch", icon: "☀️" },
  { value: "dinner", label: "Dinner", icon: "🌙" },
  { value: "snack", label: "Snack", icon: "🍎" }
] as const;

export default function MealPlanManager() {
  const { templates, loading: templatesLoading, createTemplate, updateTemplate, deleteTemplate } = useMealPlanTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<MealPlanTemplate | null>(null);
  const [selectedDay, setSelectedDay] = useState<MealPlanDay | null>(null);
  
  const { days, loading: daysLoading, createAllDays } = useMealPlanDays(selectedTemplate?.id || null);
  const { meals, loading: mealsLoading, createMeal, updateMeal, deleteMeal } = useMealPlanMeals(selectedDay?.id || null);

  // Template dialog state
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MealPlanTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    goal_type: "Lose fat",
    calorie_range_min: 1600,
    calorie_range_max: 1800,
    daily_protein_g: 150,
    daily_carbs_g: 150,
    daily_fats_g: 50,
    description: "",
    is_active: true,
    display_order: 0
  });

  // Meal dialog state
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealPlanMeal | null>(null);
  const [mealForm, setMealForm] = useState({
    meal_type: "breakfast" as "breakfast" | "lunch" | "dinner" | "snack",
    meal_name: "",
    calories: 400,
    protein_g: 30,
    carbs_g: 40,
    fats_g: 15,
    prep_time_min: 10,
    cook_time_min: 15,
    servings: 1,
    instructions: "",
    notes: "",
    display_order: 0
  });
  const [ingredients, setIngredients] = useState<MealIngredient[]>([]);
  const [newIngredient, setNewIngredient] = useState({ item: "", amount: "", notes: "" });

  // Group templates by goal type
  const groupedTemplates = useMemo(() => {
    return GOAL_OPTIONS.map(goal => ({
      goal,
      templates: templates.filter(t => t.goal_type === goal)
    }));
  }, [templates]);

  // Template handlers
  const openTemplateDialog = (template?: MealPlanTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name,
        goal_type: template.goal_type,
        calorie_range_min: template.calorie_range_min,
        calorie_range_max: template.calorie_range_max,
        daily_protein_g: template.daily_protein_g,
        daily_carbs_g: template.daily_carbs_g,
        daily_fats_g: template.daily_fats_g,
        description: template.description || "",
        is_active: template.is_active,
        display_order: template.display_order
      });
    } else {
      setEditingTemplate(null);
      setTemplateForm({
        name: "",
        goal_type: "Lose fat",
        calorie_range_min: 1600,
        calorie_range_max: 1800,
        daily_protein_g: 150,
        daily_carbs_g: 150,
        daily_fats_g: 50,
        description: "",
        is_active: true,
        display_order: templates.length
      });
    }
    setTemplateDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, templateForm);
    } else {
      const created = await createTemplate(templateForm);
      if (created) {
        await createAllDays(created.id);
      }
    }
    setTemplateDialogOpen(false);
  };

  // Meal handlers
  const openMealDialog = (meal?: MealPlanMeal) => {
    if (meal) {
      setEditingMeal(meal);
      setMealForm({
        meal_type: meal.meal_type,
        meal_name: meal.meal_name,
        calories: meal.calories,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fats_g: meal.fats_g,
        prep_time_min: meal.prep_time_min,
        cook_time_min: meal.cook_time_min,
        servings: meal.servings,
        instructions: meal.instructions || "",
        notes: meal.notes || "",
        display_order: meal.display_order
      });
      setIngredients(meal.ingredients || []);
    } else {
      setEditingMeal(null);
      setMealForm({
        meal_type: "breakfast",
        meal_name: "",
        calories: 400,
        protein_g: 30,
        carbs_g: 40,
        fats_g: 15,
        prep_time_min: 10,
        cook_time_min: 15,
        servings: 1,
        instructions: "",
        notes: "",
        display_order: meals.length
      });
      setIngredients([]);
    }
    setNewIngredient({ item: "", amount: "", notes: "" });
    setMealDialogOpen(true);
  };

  const addIngredient = () => {
    if (newIngredient.item && newIngredient.amount) {
      setIngredients([...ingredients, { ...newIngredient }]);
      setNewIngredient({ item: "", amount: "", notes: "" });
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSaveMeal = async () => {
    if (!selectedDay) return;
    
    const mealData = {
      ...mealForm,
      day_id: selectedDay.id,
      ingredients,
      image_url: null
    };

    if (editingMeal) {
      await updateMeal(editingMeal.id, mealData);
    } else {
      await createMeal(mealData);
    }
    setMealDialogOpen(false);
  };

  // Loading state
  if (templatesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Day detail view
  if (selectedDay && selectedTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedDay(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {selectedTemplate.name}
          </Button>
          <h3 className="text-xl font-bold text-foreground">{selectedDay.day_name} Meals</h3>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => openMealDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Meal
          </Button>
        </div>

        {mealsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : meals.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No meals added yet. Click "Add Meal" to create your first meal.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {MEAL_TYPES.map(mealType => {
              const typeMeals = meals.filter(m => m.meal_type === mealType.value);
              if (typeMeals.length === 0) return null;
              
              return (
                <div key={mealType.value}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <span>{mealType.icon}</span>
                    {mealType.label}
                  </h4>
                  <div className="grid gap-3">
                    {typeMeals.map(meal => (
                      <Card key={meal.id} className="bg-card/50">
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h5 className="font-semibold text-foreground">{meal.meal_name}</h5>
                              <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Flame className="h-3 w-3 text-orange-500" />
                                  {meal.calories} cal
                                </span>
                                <span className="flex items-center gap-1">
                                  <Beef className="h-3 w-3 text-red-500" />
                                  {meal.protein_g}g protein
                                </span>
                                <span className="flex items-center gap-1">
                                  <Wheat className="h-3 w-3 text-amber-500" />
                                  {meal.carbs_g}g carbs
                                </span>
                                <span className="flex items-center gap-1">
                                  <Droplet className="h-3 w-3 text-blue-500" />
                                  {meal.fats_g}g fats
                                </span>
                              </div>
                              {meal.ingredients.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {meal.ingredients.slice(0, 5).map((ing, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {ing.item}
                                    </Badge>
                                  ))}
                                  {meal.ingredients.length > 5 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{meal.ingredients.length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => openMealDialog(meal)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-destructive"
                                onClick={() => deleteMeal(meal.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Meal Dialog */}
        <Dialog open={mealDialogOpen} onOpenChange={setMealDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMeal ? "Edit Meal" : "Add New Meal"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Meal Type</Label>
                  <Select 
                    value={mealForm.meal_type} 
                    onValueChange={(v) => setMealForm({ ...mealForm, meal_type: v as typeof mealForm.meal_type })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEAL_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Meal Name</Label>
                  <Input 
                    value={mealForm.meal_name} 
                    onChange={(e) => setMealForm({ ...mealForm, meal_name: e.target.value })}
                    placeholder="e.g., Power Breakfast Bowl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Calories</Label>
                  <Input 
                    type="number" 
                    value={mealForm.calories} 
                    onChange={(e) => setMealForm({ ...mealForm, calories: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Protein (g)</Label>
                  <Input 
                    type="number" 
                    value={mealForm.protein_g} 
                    onChange={(e) => setMealForm({ ...mealForm, protein_g: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Carbs (g)</Label>
                  <Input 
                    type="number" 
                    value={mealForm.carbs_g} 
                    onChange={(e) => setMealForm({ ...mealForm, carbs_g: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Fats (g)</Label>
                  <Input 
                    type="number" 
                    value={mealForm.fats_g} 
                    onChange={(e) => setMealForm({ ...mealForm, fats_g: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="flex items-center gap-1"><Clock className="h-3 w-3" /> Prep Time (min)</Label>
                  <Input 
                    type="number" 
                    value={mealForm.prep_time_min} 
                    onChange={(e) => setMealForm({ ...mealForm, prep_time_min: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1"><Clock className="h-3 w-3" /> Cook Time (min)</Label>
                  <Input 
                    type="number" 
                    value={mealForm.cook_time_min} 
                    onChange={(e) => setMealForm({ ...mealForm, cook_time_min: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1"><Users className="h-3 w-3" /> Servings</Label>
                  <Input 
                    type="number" 
                    value={mealForm.servings} 
                    onChange={(e) => setMealForm({ ...mealForm, servings: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <Label className="mb-2 block">Ingredients</Label>
                <div className="flex gap-2 mb-2">
                  <Input 
                    placeholder="Ingredient" 
                    value={newIngredient.item}
                    onChange={(e) => setNewIngredient({ ...newIngredient, item: e.target.value })}
                    className="flex-1"
                  />
                  <Input 
                    placeholder="Amount" 
                    value={newIngredient.amount}
                    onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
                    className="w-32"
                  />
                  <Input 
                    placeholder="Notes" 
                    value={newIngredient.notes}
                    onChange={(e) => setNewIngredient({ ...newIngredient, notes: e.target.value })}
                    className="w-32"
                  />
                  <Button type="button" onClick={addIngredient} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ing, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 py-1">
                      {ing.amount} {ing.item}
                      {ing.notes && <span className="text-muted-foreground">({ing.notes})</span>}
                      <button onClick={() => removeIngredient(i)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Instructions</Label>
                <Textarea 
                  value={mealForm.instructions}
                  onChange={(e) => setMealForm({ ...mealForm, instructions: e.target.value })}
                  placeholder="Step-by-step cooking instructions..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Notes (Tips, Substitutions)</Label>
                <Textarea 
                  value={mealForm.notes}
                  onChange={(e) => setMealForm({ ...mealForm, notes: e.target.value })}
                  placeholder="Optional tips or substitutions..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setMealDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveMeal} disabled={!mealForm.meal_name}>Save Meal</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Template detail view
  if (selectedTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedTemplate(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          <div>
            <h3 className="text-xl font-bold text-foreground">{selectedTemplate.name}</h3>
            <p className="text-sm text-muted-foreground">
              {selectedTemplate.calorie_range_min}-{selectedTemplate.calorie_range_max} cal | 
              P: {selectedTemplate.daily_protein_g}g C: {selectedTemplate.daily_carbs_g}g F: {selectedTemplate.daily_fats_g}g
            </p>
          </div>
        </div>

        {daysLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : days.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No days created yet.</p>
              <Button onClick={() => createAllDays(selectedTemplate.id)}>
                <Plus className="h-4 w-4 mr-2" />
                Create 7-Day Week
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-7 gap-3">
            {days.map(day => (
              <Card 
                key={day.id} 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSelectedDay(day)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{day.day_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Click to add meals</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Template list view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Meal Plan Templates</h3>
        <Button onClick={() => openTemplateDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <Tabs defaultValue={GOAL_OPTIONS[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {GOAL_OPTIONS.map(goal => (
            <TabsTrigger key={goal} value={goal} className="text-xs">
              {goal.replace(" - lose fat and build muscle", "")}
            </TabsTrigger>
          ))}
        </TabsList>

        {groupedTemplates.map(({ goal, templates: goalTemplates }) => (
          <TabsContent key={goal} value={goal} className="mt-4">
            {goalTemplates.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <ChefHat className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No templates for this goal yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {goalTemplates.map(template => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer hover:border-primary transition-colors ${!template.is_active ? 'opacity-60' : ''}`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                        {!template.is_active && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-2">
                        {template.calorie_range_min}-{template.calorie_range_max} calories
                      </p>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline">P: {template.daily_protein_g}g</Badge>
                        <Badge variant="outline">C: {template.daily_carbs_g}g</Badge>
                        <Badge variant="outline">F: {template.daily_fats_g}g</Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={(e) => { e.stopPropagation(); openTemplateDialog(template); }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-destructive"
                          onClick={(e) => { e.stopPropagation(); deleteTemplate(template.id); }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Template Name</Label>
              <Input 
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                placeholder="e.g., Fat Loss - 1800 Calories"
              />
            </div>

            <div>
              <Label>Goal Type</Label>
              <Select 
                value={templateForm.goal_type}
                onValueChange={(v) => setTemplateForm({ ...templateForm, goal_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_OPTIONS.map(goal => (
                    <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Calories</Label>
                <Input 
                  type="number"
                  value={templateForm.calorie_range_min}
                  onChange={(e) => setTemplateForm({ ...templateForm, calorie_range_min: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Max Calories</Label>
                <Input 
                  type="number"
                  value={templateForm.calorie_range_max}
                  onChange={(e) => setTemplateForm({ ...templateForm, calorie_range_max: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Protein (g)</Label>
                <Input 
                  type="number"
                  value={templateForm.daily_protein_g}
                  onChange={(e) => setTemplateForm({ ...templateForm, daily_protein_g: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Carbs (g)</Label>
                <Input 
                  type="number"
                  value={templateForm.daily_carbs_g}
                  onChange={(e) => setTemplateForm({ ...templateForm, daily_carbs_g: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Fats (g)</Label>
                <Input 
                  type="number"
                  value={templateForm.daily_fats_g}
                  onChange={(e) => setTemplateForm({ ...templateForm, daily_fats_g: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea 
                value={templateForm.description}
                onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                placeholder="Brief description of this meal plan..."
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch 
                checked={templateForm.is_active}
                onCheckedChange={(v) => setTemplateForm({ ...templateForm, is_active: v })}
              />
              <Label>Active</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveTemplate} disabled={!templateForm.name}>Save Template</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
