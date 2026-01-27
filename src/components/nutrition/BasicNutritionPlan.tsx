import { Link } from "react-router-dom";
import { ArrowLeft, Flame, Beef, Wheat, Droplet, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import SolitaryMealCard from "./SolitaryMealCard";

interface BasicNutritionPlanProps {
  userGoal?: string | null;
}

interface SolitaryMeal {
  type: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prepTime?: number;
  ingredients: { amount: string; item: string }[];
  instructions: string;
}

interface MealPlan {
  name: string;
  targetCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  meals: SolitaryMeal[];
}

const mealPlans: Record<string, MealPlan> = {
  fat_loss: {
    name: "Fat Loss Protocol",
    targetCalories: 1800,
    protein: 160,
    carbs: 150,
    fats: 50,
    meals: [
      {
        type: "Breakfast",
        name: "Protein Power Start",
        calories: 400,
        protein: 35,
        carbs: 5,
        fats: 28,
        prepTime: 10,
        ingredients: [
          { amount: "3", item: "eggs" },
          { amount: "2 slices", item: "turkey bacon" },
          { amount: "1 cup", item: "spinach" },
        ],
        instructions: "1. Scramble eggs in a non-stick pan over medium heat.\n2. Cook turkey bacon in a separate pan until crispy.\n3. Sauté spinach in remaining pan with a pinch of salt.\n4. Plate together and eat immediately.",
      },
      {
        type: "Lunch",
        name: "Lean & Clean",
        calories: 550,
        protein: 50,
        carbs: 45,
        fats: 12,
        prepTime: 25,
        ingredients: [
          { amount: "6 oz", item: "grilled chicken breast" },
          { amount: "1 cup", item: "white rice" },
          { amount: "1 cup", item: "steamed broccoli" },
        ],
        instructions: "1. Season chicken with salt, pepper, and garlic powder.\n2. Grill chicken on medium-high for 6-7 minutes per side.\n3. Cook rice according to package directions.\n4. Steam broccoli for 4-5 minutes until bright green.\n5. Plate and serve hot.",
      },
      {
        type: "Dinner",
        name: "Evening Fuel",
        calories: 500,
        protein: 45,
        carbs: 35,
        fats: 18,
        prepTime: 20,
        ingredients: [
          { amount: "6 oz", item: "tilapia fillet" },
          { amount: "1 medium", item: "sweet potato" },
          { amount: "2 cups", item: "mixed greens" },
          { amount: "1 tbsp", item: "olive oil" },
        ],
        instructions: "1. Bake sweet potato at 400°F for 45 minutes (prep ahead).\n2. Season tilapia with lemon, salt, and pepper.\n3. Pan-sear tilapia 3-4 minutes per side.\n4. Dress greens with olive oil and a squeeze of lemon.\n5. Plate fish with potato and salad.",
      },
      {
        type: "Snack",
        name: "Protein Hit",
        calories: 350,
        protein: 30,
        carbs: 20,
        fats: 15,
        prepTime: 2,
        ingredients: [
          { amount: "1 cup", item: "Greek yogurt" },
          { amount: "1 handful", item: "almonds (about 15)" },
        ],
        instructions: "1. Scoop Greek yogurt into a bowl.\n2. Top with almonds.\n3. Eat immediately or refrigerate for later.",
      },
    ],
  },
  muscle_building: {
    name: "Muscle Building Protocol",
    targetCalories: 2500,
    protein: 200,
    carbs: 250,
    fats: 75,
    meals: [
      {
        type: "Breakfast",
        name: "Mass Builder",
        calories: 700,
        protein: 45,
        carbs: 75,
        fats: 22,
        prepTime: 15,
        ingredients: [
          { amount: "4", item: "whole eggs" },
          { amount: "1.5 cups", item: "oatmeal (dry measure)" },
          { amount: "1", item: "banana" },
          { amount: "1 glass", item: "whole milk" },
        ],
        instructions: "1. Cook oatmeal with water or milk according to package.\n2. Slice banana and mix into oatmeal.\n3. Scramble eggs in butter until fluffy.\n4. Serve eggs alongside oatmeal with milk on the side.",
      },
      {
        type: "Lunch",
        name: "Yard Fuel",
        calories: 750,
        protein: 55,
        carbs: 70,
        fats: 25,
        prepTime: 30,
        ingredients: [
          { amount: "8 oz", item: "chicken thighs (bone-in)" },
          { amount: "2 cups", item: "white rice (cooked)" },
          { amount: "1 cup", item: "mixed vegetables" },
        ],
        instructions: "1. Season chicken thighs with your favorite rub.\n2. Bake at 425°F for 35-40 minutes until internal temp is 165°F.\n3. Cook rice according to package.\n4. Steam or sauté vegetables with a bit of butter.\n5. Plate everything together.",
      },
      {
        type: "Dinner",
        name: "Iron Plate",
        calories: 800,
        protein: 60,
        carbs: 50,
        fats: 40,
        prepTime: 25,
        ingredients: [
          { amount: "8 oz", item: "ribeye steak" },
          { amount: "1 large", item: "baked potato" },
          { amount: "1 tbsp", item: "butter" },
          { amount: "2 cups", item: "side salad" },
        ],
        instructions: "1. Let steak come to room temperature (20 min).\n2. Season generously with salt and pepper.\n3. Sear in cast iron on high heat, 4 min per side for medium.\n4. Rest steak 5 minutes before slicing.\n5. Top baked potato with butter and serve with salad.",
      },
      {
        type: "Snack",
        name: "Growth Window",
        calories: 450,
        protein: 40,
        carbs: 45,
        fats: 12,
        prepTime: 5,
        ingredients: [
          { amount: "2 scoops", item: "protein powder" },
          { amount: "2 tbsp", item: "peanut butter" },
          { amount: "1", item: "banana" },
          { amount: "1 cup", item: "milk or water" },
        ],
        instructions: "1. Add all ingredients to a blender.\n2. Blend until smooth.\n3. Drink within 30 minutes post-workout for best results.",
      },
    ],
  },
  recomposition: {
    name: "Recomposition Protocol",
    targetCalories: 2100,
    protein: 175,
    carbs: 200,
    fats: 60,
    meals: [
      {
        type: "Breakfast",
        name: "Balanced Start",
        calories: 500,
        protein: 35,
        carbs: 50,
        fats: 18,
        prepTime: 12,
        ingredients: [
          { amount: "3", item: "whole eggs" },
          { amount: "1 cup", item: "oatmeal (cooked)" },
          { amount: "1/2 cup", item: "mixed berries" },
          { amount: "1 cup", item: "black coffee" },
        ],
        instructions: "1. Cook oatmeal with water, top with berries.\n2. Scramble eggs in a non-stick pan.\n3. Brew coffee black—no sugar.\n4. Eat mindfully, no distractions.",
      },
      {
        type: "Lunch",
        name: "Steady State",
        calories: 650,
        protein: 45,
        carbs: 60,
        fats: 22,
        prepTime: 25,
        ingredients: [
          { amount: "6 oz", item: "ground beef (90% lean)" },
          { amount: "1.5 cups", item: "white rice (cooked)" },
          { amount: "1 cup", item: "roasted vegetables" },
        ],
        instructions: "1. Brown ground beef in a skillet, breaking it up.\n2. Season with salt, pepper, and garlic.\n3. Roast vegetables (bell peppers, onions, zucchini) at 400°F for 20 min.\n4. Serve beef over rice with vegetables on the side.",
      },
      {
        type: "Dinner",
        name: "Recovery Meal",
        calories: 600,
        protein: 50,
        carbs: 40,
        fats: 25,
        prepTime: 20,
        ingredients: [
          { amount: "6 oz", item: "salmon fillet" },
          { amount: "1 cup", item: "quinoa (cooked)" },
          { amount: "1 bunch", item: "asparagus" },
          { amount: "1", item: "lemon wedge" },
        ],
        instructions: "1. Season salmon with salt, pepper, and dill.\n2. Bake at 400°F for 12-15 minutes.\n3. Cook quinoa according to package.\n4. Roast asparagus with olive oil for 10 minutes.\n5. Squeeze lemon over fish before serving.",
      },
      {
        type: "Snack",
        name: "Maintenance Fuel",
        calories: 350,
        protein: 30,
        carbs: 25,
        fats: 15,
        prepTime: 3,
        ingredients: [
          { amount: "1 cup", item: "cottage cheese" },
          { amount: "1/4 cup", item: "walnuts" },
          { amount: "1 tsp", item: "honey" },
        ],
        instructions: "1. Scoop cottage cheese into a bowl.\n2. Top with walnuts and drizzle honey.\n3. Mix and enjoy.",
      },
    ],
  },
};

const BasicNutritionPlan = ({ userGoal }: BasicNutritionPlanProps) => {
  // Map user goal to meal plan key
  const getPlanKey = (goal: string | null | undefined): string => {
    if (!goal) return "recomposition";
    const goalLower = goal.toLowerCase();
    if (goalLower.includes("lose") || goalLower.includes("fat") || goalLower.includes("cut")) {
      return "fat_loss";
    }
    if (goalLower.includes("build") || goalLower.includes("muscle") || goalLower.includes("bulk") || goalLower.includes("gain")) {
      return "muscle_building";
    }
    return "recomposition";
  };

  const planKey = getPlanKey(userGoal);
  const plan = mealPlans[planKey];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />
      <main className="flex-1 section-container py-8 pt-24">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cell Block
        </Link>

        <div className="mb-8">
          <h1 className="headline-section mb-2">
            Chow <span className="text-primary">Hall</span>
          </h1>
          <p className="text-muted-foreground">
            Your basic meal template for Solitary. One plan, no choices, no excuses.
          </p>
        </div>

        {/* Solitary Notice */}
        <div className="bg-charcoal p-6 rounded-lg border border-primary/30 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Solitary Confinement Nutrition</h3>
              <p className="text-sm text-muted-foreground mb-3">
                You get one meal template based on your goal. Follow it exactly. 
                Upgrade to Gen Pop for full meal planning with swaps and customization.
              </p>
              <Button variant="goldOutline" size="sm" asChild>
                <Link to="/checkout?plan=transformation" className="inline-flex items-center gap-2">
                  Upgrade to Gen Pop <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Your Plan */}
        <Card className="bg-charcoal border-border mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              {plan.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-background border border-border">
                <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold text-foreground">{plan.targetCalories}</p>
                <p className="text-xs text-muted-foreground">Daily Calories</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background border border-border">
                <Beef className="h-6 w-6 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold text-foreground">{plan.protein}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background border border-border">
                <Wheat className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                <p className="text-2xl font-bold text-foreground">{plan.carbs}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background border border-border">
                <Droplet className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold text-foreground">{plan.fats}g</p>
                <p className="text-xs text-muted-foreground">Fats</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Based on your goal: {userGoal || "Recomposition"}
            </p>
          </CardContent>
        </Card>

        {/* Daily Meals */}
        <div className="space-y-4 mb-8">
          <h2 className="headline-card">Your Daily Meals</h2>
          {plan.meals.map((meal, index) => (
            <SolitaryMealCard key={index} meal={meal} />
          ))}
        </div>

        {/* Guidelines */}
        <Card className="bg-charcoal border-border mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Solitary Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Follow this exact meal plan every day. No substitutions.</li>
              <li>• Prep your meals in advance. Discipline starts in the kitchen.</li>
              <li>• Drink at least 1 gallon of water daily.</li>
              <li>• Eat at consistent times to build routine.</li>
              <li>• No cheat meals. You're in Solitary for a reason.</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex gap-4">
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

export default BasicNutritionPlan;
