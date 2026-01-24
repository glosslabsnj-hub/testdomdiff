import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Loader2, ChefHat, Flame, Beef, Wheat, Droplet, 
  Clock, Users, ChevronDown, ChevronUp, ShoppingCart, Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useMealPlanAssignment } from "@/hooks/useMealPlanAssignment";
import { useAuth } from "@/contexts/AuthContext";
import UpgradePrompt from "@/components/UpgradePrompt";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import type { MealPlanMeal } from "@/hooks/useMealPlanAssignment";

const MEAL_TYPE_ORDER = ["breakfast", "lunch", "dinner", "snack"] as const;
const MEAL_TYPE_ICONS: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍎"
};

const Nutrition = () => {
  const { assignedPlan, userCalories, loading } = useMealPlanAssignment();
  const { subscription, profile } = useAuth();
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  const [selectedDay, setSelectedDay] = useState("1");

  // Only transformation and coaching users can access
  if (subscription?.plan_type === "membership") {
    return <UpgradePrompt feature="Nutrition Templates" upgradeTo="transformation" />;
  }

  const toggleMealExpanded = (mealId: string) => {
    setExpandedMeals(prev => {
      const next = new Set(prev);
      if (next.has(mealId)) {
        next.delete(mealId);
      } else {
        next.add(mealId);
      }
      return next;
    });
  };

  // Generate shopping list from all meals in the week
  const generateShoppingList = () => {
    if (!assignedPlan) return [];
    
    const ingredientMap = new Map<string, { amount: string; notes?: string }>();
    
    assignedPlan.days.forEach(day => {
      day.meals.forEach(meal => {
        meal.ingredients.forEach(ing => {
          const key = ing.item.toLowerCase();
          if (!ingredientMap.has(key)) {
            ingredientMap.set(key, { amount: ing.amount, notes: ing.notes });
          }
        });
      });
    });
    
    return Array.from(ingredientMap.entries()).map(([item, details]) => ({
      item: item.charAt(0).toUpperCase() + item.slice(1),
      ...details
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentDay = assignedPlan?.days.find(d => d.day_number.toString() === selectedDay);
  const sortedMeals = currentDay?.meals.sort((a, b) => 
    MEAL_TYPE_ORDER.indexOf(a.meal_type) - MEAL_TYPE_ORDER.indexOf(b.meal_type)
  ) || [];

  // Calculate daily totals
  const dailyTotals = sortedMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein_g,
      carbs: acc.carbs + meal.carbs_g,
      fats: acc.fats + meal.fats_g
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />
      <main className="flex-1 section-container py-8 pt-24">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="headline-section mb-2">
            Your <span className="text-primary">Meal Plan</span>
          </h1>
          <p className="text-muted-foreground">
            Personalized nutrition based on your goal and body composition.
          </p>
        </div>

        {/* User Stats Card */}
        {userCalories && (
          <Card className="bg-charcoal border-border mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-primary" />
                Your Daily Targets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-background border border-border">
                  <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold text-foreground">{userCalories.targetCalories}</p>
                  <p className="text-xs text-muted-foreground">Daily Calories</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-background border border-border">
                  <Beef className="h-6 w-6 mx-auto mb-2 text-red-500" />
                  <p className="text-2xl font-bold text-foreground">{userCalories.protein}g</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-background border border-border">
                  <Wheat className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                  <p className="text-2xl font-bold text-foreground">{userCalories.carbs}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-background border border-border">
                  <Droplet className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold text-foreground">{userCalories.fats}g</p>
                  <p className="text-xs text-muted-foreground">Fats</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Based on your goal: {profile?.goal || "Recomposition"} | 
                BMR: {userCalories.bmr} | TDEE: {userCalories.tdee}
              </p>
            </CardContent>
          </Card>
        )}

        {!assignedPlan || assignedPlan.days.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <ChefHat className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Meal Plan Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                Your personalized meal plan is being prepared based on your goals and body composition.
              </p>
              <p className="text-sm text-muted-foreground">
                In the meantime, focus on eating whole foods with a protein source at every meal.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Assigned Template Info */}
            <Card className="bg-card border-primary/30 mb-6">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <Badge className="bg-primary/20 text-primary border-primary/30 mb-2">
                      {assignedPlan.template.name}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {assignedPlan.template.calorie_range_min}-{assignedPlan.template.calorie_range_max} cal/day | 
                      P: {assignedPlan.template.daily_protein_g}g C: {assignedPlan.template.daily_carbs_g}g F: {assignedPlan.template.daily_fats_g}g
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Day Tabs */}
            <Tabs value={selectedDay} onValueChange={setSelectedDay} className="mb-8">
              <TabsList className="grid grid-cols-7 bg-charcoal border border-border">
                {assignedPlan.days.map(day => (
                  <TabsTrigger 
                    key={day.id} 
                    value={day.day_number.toString()}
                    className="text-xs sm:text-sm"
                  >
                    {day.day_name.slice(0, 3)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {assignedPlan.days.map(day => (
                <TabsContent key={day.id} value={day.day_number.toString()} className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{day.day_name}</h3>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span>{dailyTotals.calories} cal</span>
                      <span>•</span>
                      <span>{dailyTotals.protein}g P</span>
                    </div>
                  </div>

                  {sortedMeals.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No meals added for this day yet.
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {sortedMeals.map(meal => (
                        <MealCard 
                          key={meal.id} 
                          meal={meal} 
                          isExpanded={expandedMeals.has(meal.id)}
                          onToggle={() => toggleMealExpanded(meal.id)}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>

            {/* Shopping List */}
            <Card className="bg-charcoal border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Weekly Shopping List
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generateShoppingList().length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Shopping list will appear once meals are added.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {generateShoppingList().map((item, i) => (
                      <div 
                        key={i} 
                        className="p-2 rounded bg-background border border-border text-sm"
                      >
                        <span className="font-medium">{item.item}</span>
                        {item.amount && (
                          <span className="text-muted-foreground ml-1">({item.amount})</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <div className="mt-8 flex gap-4">
          <Button variant="gold" asChild>
            <Link to="/dashboard/check-in">Go to Weekly Check-In</Link>
          </Button>
          <Button variant="goldOutline" asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Meal Card Component
function MealCard({ 
  meal, 
  isExpanded, 
  onToggle 
}: { 
  meal: MealPlanMeal; 
  isExpanded: boolean; 
  onToggle: () => void;
}) {
  return (
    <Card className="bg-card border-border overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div className="p-4 cursor-pointer hover:bg-muted/20 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{MEAL_TYPE_ICONS[meal.meal_type]}</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {meal.meal_type}
                  </Badge>
                </div>
                <h4 className="font-semibold text-foreground">{meal.meal_name}</h4>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {meal.calories} cal
                  </span>
                  <span className="flex items-center gap-1">
                    <Beef className="h-3 w-3 text-red-500" />
                    {meal.protein_g}g
                  </span>
                  <span className="flex items-center gap-1">
                    <Wheat className="h-3 w-3 text-amber-500" />
                    {meal.carbs_g}g
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplet className="h-3 w-3 text-blue-500" />
                    {meal.fats_g}g
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                {(meal.prep_time_min > 0 || meal.cook_time_min > 0) && (
                  <span className="text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {meal.prep_time_min + meal.cook_time_min} min
                  </span>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
            {/* Prep Info */}
            <div className="flex flex-wrap gap-4 text-sm">
              {meal.prep_time_min > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Prep: {meal.prep_time_min} min</span>
                </div>
              )}
              {meal.cook_time_min > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Cook: {meal.cook_time_min} min</span>
                </div>
              )}
              {meal.servings > 1 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Servings: {meal.servings}</span>
                </div>
              )}
            </div>

            {/* Ingredients */}
            {meal.ingredients.length > 0 && (
              <div>
                <h5 className="font-medium text-foreground mb-2">Ingredients</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {meal.ingredients.map((ing, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-2 p-2 rounded bg-charcoal border border-border text-sm"
                    >
                      <span className="font-medium text-primary">{ing.amount}</span>
                      <span>{ing.item}</span>
                      {ing.notes && (
                        <span className="text-muted-foreground">({ing.notes})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            {meal.instructions && (
              <div>
                <h5 className="font-medium text-foreground mb-2">Instructions</h5>
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {meal.instructions}
                </div>
              </div>
            )}

            {/* Notes */}
            {meal.notes && (
              <div className="p-3 rounded bg-primary/10 border border-primary/20">
                <p className="text-sm text-foreground">
                  <span className="font-medium">💡 Tip:</span> {meal.notes}
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default Nutrition;
