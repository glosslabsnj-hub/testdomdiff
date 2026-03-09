import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ChefHat, Flame, Beef, Wheat, Droplet,
  ShoppingCart, Printer, ChevronDown, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMealPlanAssignment } from "@/hooks/useMealPlanAssignment";
import { useMealFeedback } from "@/hooks/useMealFeedback";
import { useAuth } from "@/contexts/AuthContext";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import UpgradePrompt from "@/components/UpgradePrompt";
import BasicNutritionPlan from "@/components/nutrition/BasicNutritionPlan";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardBackLink from "@/components/DashboardBackLink";
import { MealCard } from "@/components/nutrition/MealCard";
import { MealSwapDialog } from "@/components/nutrition/MealSwapDialog";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import EmptyState from "@/components/EmptyState";
import type { MealPlanMeal } from "@/hooks/useMealPlanAssignment";

const MEAL_TYPE_ORDER = ["breakfast", "lunch", "dinner", "snack"] as const;

const Nutrition = () => {
  const { assignedPlan, userCalories, loading } = useMealPlanAssignment();
  const { profile } = useAuth();
  const { isMembership, isCoaching } = useEffectiveSubscription();
  const {
    addFeedback, 
    removeFeedback, 
    getMealFeedback, 
    createSwap, 
    removeSwap, 
    getActiveSwap,
    swaps 
  } = useMealFeedback();
  
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  const [selectedDay, setSelectedDay] = useState("1");
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [mealToSwap, setMealToSwap] = useState<MealPlanMeal | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCheckedItem = useCallback((item: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  }, []);

  // Get all meals from the plan for swap options - must be before early return
  const allMeals = useMemo(() => {
    if (!assignedPlan) return [];
    return assignedPlan.days.flatMap(day => day.meals);
  }, [assignedPlan]);

  // Membership users get basic nutrition plan
  if (isMembership) {
    return <BasicNutritionPlan userGoal={profile?.goal} />;
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

  // Generate shopping list from the currently selected week (7 days)
  const shoppingList = useMemo(() => {
    if (!assignedPlan) return [];

    // Only generate for the current week's worth of days (7 days)
    const currentWeekStart = Math.floor((parseInt(selectedDay) - 1) / 7) * 7;
    const weekDays = assignedPlan.days.slice(currentWeekStart, currentWeekStart + 7);

    const ingredientMap = new Map<string, { amount: string; notes?: string }>();

    weekDays.forEach(day => {
      day.meals.forEach(meal => {
        meal.ingredients.forEach(ing => {
          const key = ing.item.toLowerCase();
          if (!ingredientMap.has(key)) {
            ingredientMap.set(key, { amount: ing.amount, notes: ing.notes });
          }
        });
      });
    });

    return Array.from(ingredientMap.entries())
      .map(([item, details]) => ({
        item: item.charAt(0).toUpperCase() + item.slice(1),
        ...details
      }))
      .sort((a, b) => a.item.localeCompare(b.item));
  }, [assignedPlan, selectedDay]);

  // Handle opening swap dialog
  const handleOpenSwap = (meal: MealPlanMeal) => {
    setMealToSwap(meal);
    setSwapDialogOpen(true);
  };

  // Handle swap confirmation
  const handleSwap = async (newMealId: string) => {
    if (!mealToSwap) return;
    const dayNumber = parseInt(selectedDay);
    await createSwap(mealToSwap.id, newMealId, dayNumber);
  };

  // Handle revert swap
  const handleRevert = async (originalMealId: string) => {
    const swap = getActiveSwap(originalMealId);
    if (swap) {
      await removeSwap(swap.id);
    }
  };

  // Get the effective meal (swapped or original)
  const getEffectiveMeal = (originalMeal: MealPlanMeal): { meal: MealPlanMeal; isSwapped: boolean } => {
    const swap = getActiveSwap(originalMeal.id);
    if (swap) {
      const swappedMeal = allMeals.find(m => m.id === swap.swapped_meal_id);
      if (swappedMeal) {
        return { meal: swappedMeal, isSwapped: true };
      }
    }
    return { meal: originalMeal, isSwapped: false };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="section-container py-8">
          <DashboardSkeleton variant="cards" count={4} />
          <div className="mt-8">
            <DashboardSkeleton variant="list" count={4} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const currentDay = assignedPlan?.days.find(d => d.day_number.toString() === selectedDay);
  const sortedMeals = currentDay?.meals.sort((a, b) => 
    MEAL_TYPE_ORDER.indexOf(a.meal_type) - MEAL_TYPE_ORDER.indexOf(b.meal_type)
  ) || [];

  // Calculate daily totals (using effective meals)
  const dailyTotals = sortedMeals.reduce(
    (acc, originalMeal) => {
      const { meal } = getEffectiveMeal(originalMeal);
      return {
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein_g,
        carbs: acc.carbs + meal.carbs_g,
        fats: acc.fats + meal.fats_g
      };
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  return (
    <DashboardLayout>
      <div className="section-container py-8">
        <DashboardBackLink />

        <div className="mb-8">
          <h1 className="headline-section mb-2">
            {isCoaching ? (
              <>Meal <span className="text-primary">Planning</span></>
            ) : (
              <>Chow <span className="text-primary">Hall</span></>
            )}
          </h1>
          <p className="text-muted-foreground">
            {isCoaching 
              ? "Your personalized nutrition plan. Fuel for your transformation."
              : "Your tray is ready. Personalized nutrition based on your goal and body composition."}
          </p>
        </div>

        {/* Step 1: User Stats Card */}
        {userCalories && (
          <Card className="bg-charcoal border-border mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold mr-1">
                  1
                </div>
                <ChefHat className="h-5 w-5 text-primary" />
                Know Your Numbers
              </CardTitle>
              <p className="text-sm text-muted-foreground ml-10">Step 1: Your daily macro targets based on your goal</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
                <div className="text-center p-3 sm:p-4 rounded-lg bg-background border border-border">
                  <Flame className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-orange-500" />
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-foreground">{userCalories.targetCalories}</p>
                  <p className="text-xs text-muted-foreground">Calories</p>
                </div>
                <div className="text-center p-3 sm:p-4 rounded-lg bg-background border border-border">
                  <Beef className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-red-500" />
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-foreground">{userCalories.protein}g</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div className="text-center p-3 sm:p-4 rounded-lg bg-background border border-border">
                  <Wheat className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-amber-500" />
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-foreground">{userCalories.carbs}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div className="text-center p-3 sm:p-4 rounded-lg bg-background border border-border">
                  <Droplet className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-blue-500" />
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-foreground">{userCalories.fats}g</p>
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
          <EmptyState
            type="nutrition"
            title="Your Meal Plan is Coming Soon"
            description="Your personalized nutrition plan is being prepared based on your goals, body composition, and preferences. Focus on whole foods with protein at every meal."
            actionLabel="View Sample Meals"
            actionLink="/dashboard"
          />
        ) : (
          <>
            {/* Step 2: Assigned Template Info */}
            <Card className="bg-card border-primary/30 mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold mr-1">
                    2
                  </div>
                  Follow Your Template
                </CardTitle>
                <p className="text-sm text-muted-foreground ml-10">Step 2: Your assigned meal plan template</p>
              </CardHeader>
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
              <div className="relative">
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                  <TabsList className="inline-flex w-auto sm:grid sm:grid-cols-7 sm:w-full bg-charcoal border border-border">
                    {assignedPlan.days.map(day => (
                      <TabsTrigger
                        key={day.id}
                        value={day.day_number.toString()}
                        className="text-xs sm:text-sm min-w-[52px] min-h-[40px] px-3 sm:px-2"
                      >
                        {day.day_name.slice(0, 3)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                {/* Scroll fade indicator (mobile only) */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden" />
              </div>

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
                      {sortedMeals.map(originalMeal => {
                        const { meal, isSwapped } = getEffectiveMeal(originalMeal);
                        const feedback = getMealFeedback(meal.id);
                        
                        return (
                          <MealCard 
                            key={originalMeal.id} 
                            meal={meal} 
                            isExpanded={expandedMeals.has(meal.id)}
                            onToggle={() => toggleMealExpanded(meal.id)}
                            userFeedback={feedback.map(f => ({ type: f.feedback_type }))}
                            onLike={() => addFeedback(meal.id, "like")}
                            onSkip={() => addFeedback(meal.id, "skip")}
                            onMade={() => addFeedback(meal.id, "made")}
                            onSwap={() => handleOpenSwap(originalMeal)}
                            isSwapped={isSwapped}
                            onRevert={isSwapped ? () => handleRevert(originalMeal.id) : undefined}
                          />
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>

            {/* Step 3: Shopping List (collapsible) */}
            <Card className="bg-charcoal border-border">
              <CardHeader
                className="cursor-pointer"
                onClick={() => toggleMealExpanded("shopping-list")}
              >
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold mr-1">
                    3
                  </div>
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Shop Your List
                  <Badge variant="secondary" className="ml-auto text-xs">{shoppingList.length} items</Badge>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedMeals.has("shopping-list") ? "rotate-180" : ""}`} />
                </CardTitle>
                <p className="text-sm text-muted-foreground ml-10">
                  Tap to {expandedMeals.has("shopping-list") ? "collapse" : "view"} this week's grocery list
                  {checkedItems.size > 0 && ` (${checkedItems.size}/${shoppingList.length} checked)`}
                </p>
              </CardHeader>
              {expandedMeals.has("shopping-list") && (
                <CardContent>
                  {shoppingList.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Shopping list will appear once meals are added.
                    </p>
                  ) : (
                    <>
                      {checkedItems.size > 0 && (
                        <div className="flex justify-end mb-2">
                          <button
                            onClick={() => setCheckedItems(new Set())}
                            className="text-xs text-primary hover:underline"
                          >
                            Clear all checks
                          </button>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                        {shoppingList.map((item, i) => {
                          const isChecked = checkedItems.has(item.item);
                          return (
                            <button
                              key={i}
                              onClick={() => toggleCheckedItem(item.item)}
                              className={`flex items-center gap-2.5 p-3 rounded text-left text-sm break-words border transition-all ${
                                isChecked
                                  ? "bg-green-500/10 border-green-500/30 line-through text-muted-foreground/50"
                                  : "bg-background border-border hover:border-primary/30"
                              }`}
                            >
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                                isChecked ? "bg-green-500 border-green-500" : "border-muted-foreground/40"
                              }`}>
                                {isChecked && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-medium">{item.item}</span>
                                {item.amount && (
                                  <span className="text-muted-foreground ml-1 text-xs">({item.amount})</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </CardContent>
              )}
            </Card>
          </>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button variant="gold" asChild>
            <Link to="/dashboard/check-in">Go to Weekly Check-In</Link>
          </Button>
        </div>

        {/* Swap Dialog */}
        {mealToSwap && userCalories && (
          <MealSwapDialog
            open={swapDialogOpen}
            onOpenChange={setSwapDialogOpen}
            currentMeal={mealToSwap}
            availableMeals={allMeals}
            onSwap={handleSwap}
            targetCalories={userCalories.targetCalories}
            targetProtein={userCalories.protein}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Nutrition;
