import { useState } from "react";
import { ChevronDown, ChevronRight, Clock, Users, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useUpdateNutritionMeal, type NutritionMealPlanMeal } from "@/hooks/useNutritionTemplates";

interface Ingredient {
  item: string;
  amount: string;
  notes?: string;
}

interface ExpandableMealCardProps {
  meal: NutritionMealPlanMeal & { ingredients?: Ingredient[] | null };
  isExpanded: boolean;
  onToggle: () => void;
}

export default function ExpandableMealCard({ meal, isExpanded, onToggle }: ExpandableMealCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    meal_name: meal.meal_name,
    calories: meal.calories,
    protein_g: meal.protein_g,
    carbs_g: meal.carbs_g,
    fats_g: meal.fats_g,
    prep_time_min: meal.prep_time_min || 0,
    cook_time_min: meal.cook_time_min || 0,
    servings: meal.servings || 1,
    instructions: meal.instructions || "",
    notes: meal.notes || "",
  });
  
  const updateMeal = useUpdateNutritionMeal();
  
  // Parse ingredients from JSONB
  const ingredients: Ingredient[] = Array.isArray(meal.ingredients) 
    ? meal.ingredients as Ingredient[]
    : [];

  // Parse instructions into numbered steps
  const instructionSteps = (meal.instructions || "")
    .split(/\d+\.\s*/)
    .filter(Boolean)
    .map((step) => step.trim());

  const handleSave = () => {
    updateMeal.mutate({
      id: meal.id,
      ...editData,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      meal_name: meal.meal_name,
      calories: meal.calories,
      protein_g: meal.protein_g,
      carbs_g: meal.carbs_g,
      fats_g: meal.fats_g,
      prep_time_min: meal.prep_time_min || 0,
      cook_time_min: meal.cook_time_min || 0,
      servings: meal.servings || 1,
      instructions: meal.instructions || "",
      notes: meal.notes || "",
    });
    setIsEditing(false);
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div className="p-3 rounded-lg text-sm bg-muted/50 flex items-center justify-between cursor-pointer hover:bg-muted/70 transition-colors">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-purple-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="capitalize text-muted-foreground font-medium">{meal.meal_type}:</span>
            <span className="font-medium">{meal.meal_name}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">
              {meal.calories} cal • P{meal.protein_g}g C{meal.carbs_g}g F{meal.fats_g}g
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(!isEditing);
              }}
            >
              <Edit2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="ml-6 mt-2 p-4 rounded-lg bg-background border border-border space-y-4">
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Meal Name</label>
                  <Input
                    value={editData.meal_name}
                    onChange={(e) => setEditData({ ...editData, meal_name: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Calories</label>
                    <Input
                      type="number"
                      value={editData.calories}
                      onChange={(e) => setEditData({ ...editData, calories: parseInt(e.target.value) || 0 })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Protein</label>
                    <Input
                      type="number"
                      value={editData.protein_g}
                      onChange={(e) => setEditData({ ...editData, protein_g: parseInt(e.target.value) || 0 })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Carbs</label>
                    <Input
                      type="number"
                      value={editData.carbs_g}
                      onChange={(e) => setEditData({ ...editData, carbs_g: parseInt(e.target.value) || 0 })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Fats</label>
                    <Input
                      type="number"
                      value={editData.fats_g}
                      onChange={(e) => setEditData({ ...editData, fats_g: parseInt(e.target.value) || 0 })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Prep Time (min)</label>
                  <Input
                    type="number"
                    value={editData.prep_time_min}
                    onChange={(e) => setEditData({ ...editData, prep_time_min: parseInt(e.target.value) || 0 })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Cook Time (min)</label>
                  <Input
                    type="number"
                    value={editData.cook_time_min}
                    onChange={(e) => setEditData({ ...editData, cook_time_min: parseInt(e.target.value) || 0 })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Servings</label>
                  <Input
                    type="number"
                    value={editData.servings}
                    onChange={(e) => setEditData({ ...editData, servings: parseInt(e.target.value) || 1 })}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Instructions</label>
                <Textarea
                  value={editData.instructions}
                  onChange={(e) => setEditData({ ...editData, instructions: e.target.value })}
                  rows={5}
                  className="text-sm"
                  placeholder="1. First step&#10;2. Second step&#10;..."
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Notes</label>
                <Textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  rows={2}
                  className="text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={updateMeal.isPending}>
                  <Check className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <>
              {/* Time & Servings Badges */}
              <div className="flex flex-wrap gap-2">
                {meal.prep_time_min && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Prep: {meal.prep_time_min} min
                  </Badge>
                )}
                {meal.cook_time_min && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Cook: {meal.cook_time_min} min
                  </Badge>
                )}
                {meal.servings && (
                  <Badge variant="outline" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {meal.servings} serving{meal.servings > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              {/* Ingredients */}
              {ingredients.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                    Ingredients ({ingredients.length})
                  </h4>
                  <ul className="space-y-1">
                    {ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground">•</span>
                        <span>
                          <span className="text-primary">{ing.amount}</span>{" "}
                          {ing.item}
                          {ing.notes && (
                            <span className="text-muted-foreground"> ({ing.notes})</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Instructions */}
              {instructionSteps.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Instructions</h4>
                  <ol className="space-y-2">
                    {instructionSteps.map((step, idx) => (
                      <li key={idx} className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Notes */}
              {meal.notes && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">Chef's Notes</h4>
                  <p className="text-sm italic">{meal.notes}</p>
                </div>
              )}
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
