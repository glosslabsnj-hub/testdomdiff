import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MealTemplate {
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  meal_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  prep_time_min: number;
  cook_time_min: number;
  servings: number;
  ingredients: { item: string; amount: string; notes?: string }[];
  instructions: string;
  notes?: string;
}

// Breakfast templates
const BREAKFASTS: MealTemplate[] = [
  {
    meal_type: "breakfast",
    meal_name: "Power Egg Scramble",
    calories: 420,
    protein_g: 35,
    carbs_g: 25,
    fats_g: 22,
    prep_time_min: 5,
    cook_time_min: 10,
    servings: 1,
    ingredients: [
      { item: "Whole eggs", amount: "3 large" },
      { item: "Egg whites", amount: "3 large" },
      { item: "Spinach", amount: "1 cup", notes: "fresh" },
      { item: "Bell pepper", amount: "1/2", notes: "diced" },
      { item: "Olive oil", amount: "1 tsp" },
      { item: "Whole wheat toast", amount: "1 slice" }
    ],
    instructions: "1. Heat oil in pan over medium heat.\n2. Sauté peppers 2 min.\n3. Add spinach, cook until wilted.\n4. Pour in eggs, scramble until done.\n5. Serve with toast.",
    notes: "Add hot sauce for metabolism boost."
  },
  {
    meal_type: "breakfast",
    meal_name: "Protein Oatmeal Bowl",
    calories: 380,
    protein_g: 30,
    carbs_g: 45,
    fats_g: 10,
    prep_time_min: 5,
    cook_time_min: 5,
    servings: 1,
    ingredients: [
      { item: "Rolled oats", amount: "1/2 cup", notes: "dry" },
      { item: "Protein powder", amount: "1 scoop", notes: "vanilla or unflavored" },
      { item: "Banana", amount: "1/2", notes: "sliced" },
      { item: "Peanut butter", amount: "1 tbsp" },
      { item: "Cinnamon", amount: "1/2 tsp" },
      { item: "Water or milk", amount: "1 cup" }
    ],
    instructions: "1. Cook oats with water/milk.\n2. Remove from heat, stir in protein powder.\n3. Top with banana, peanut butter, cinnamon.",
    notes: "Make ahead and reheat for quick mornings."
  },
  {
    meal_type: "breakfast",
    meal_name: "Greek Yogurt Parfait",
    calories: 350,
    protein_g: 28,
    carbs_g: 40,
    fats_g: 8,
    prep_time_min: 5,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Greek yogurt", amount: "1 cup", notes: "plain, 0% fat" },
      { item: "Mixed berries", amount: "1/2 cup" },
      { item: "Granola", amount: "1/4 cup" },
      { item: "Honey", amount: "1 tsp" },
      { item: "Almonds", amount: "10", notes: "sliced" }
    ],
    instructions: "1. Layer yogurt in bowl or jar.\n2. Add berries.\n3. Top with granola and almonds.\n4. Drizzle with honey.",
    notes: "Prep the night before for grab-and-go."
  },
  {
    meal_type: "breakfast",
    meal_name: "Breakfast Burrito",
    calories: 480,
    protein_g: 32,
    carbs_g: 38,
    fats_g: 22,
    prep_time_min: 10,
    cook_time_min: 10,
    servings: 1,
    ingredients: [
      { item: "Whole wheat tortilla", amount: "1 large" },
      { item: "Eggs", amount: "3 whole" },
      { item: "Black beans", amount: "1/4 cup", notes: "drained" },
      { item: "Salsa", amount: "2 tbsp" },
      { item: "Cheese", amount: "1 oz", notes: "shredded" },
      { item: "Avocado", amount: "1/4" }
    ],
    instructions: "1. Scramble eggs.\n2. Warm tortilla.\n3. Layer beans, eggs, cheese, salsa, avocado.\n4. Wrap tightly and serve.",
    notes: "Can be made in batches and frozen."
  }
];

// Lunch templates
const LUNCHES: MealTemplate[] = [
  {
    meal_type: "lunch",
    meal_name: "Grilled Chicken Power Bowl",
    calories: 520,
    protein_g: 45,
    carbs_g: 45,
    fats_g: 18,
    prep_time_min: 10,
    cook_time_min: 15,
    servings: 1,
    ingredients: [
      { item: "Chicken breast", amount: "6 oz" },
      { item: "Brown rice", amount: "1/2 cup", notes: "cooked" },
      { item: "Broccoli", amount: "1 cup" },
      { item: "Sweet potato", amount: "1/2 medium", notes: "cubed" },
      { item: "Olive oil", amount: "1 tbsp" },
      { item: "Lemon juice", amount: "1 tbsp" }
    ],
    instructions: "1. Season chicken with salt, pepper, lemon.\n2. Grill or pan-cook 6-7 min per side.\n3. Roast sweet potato and broccoli at 400°F for 20 min.\n4. Serve over rice.",
    notes: "Meal prep multiple servings for the week."
  },
  {
    meal_type: "lunch",
    meal_name: "Turkey & Avocado Wrap",
    calories: 480,
    protein_g: 38,
    carbs_g: 35,
    fats_g: 22,
    prep_time_min: 10,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Turkey breast", amount: "6 oz", notes: "sliced" },
      { item: "Whole wheat wrap", amount: "1 large" },
      { item: "Avocado", amount: "1/2" },
      { item: "Lettuce", amount: "1 cup" },
      { item: "Tomato", amount: "1/2", notes: "sliced" },
      { item: "Mustard", amount: "1 tbsp" }
    ],
    instructions: "1. Lay out wrap.\n2. Spread avocado and mustard.\n3. Layer turkey, lettuce, tomato.\n4. Roll tightly, cut in half.",
    notes: "Add pickles for extra crunch."
  },
  {
    meal_type: "lunch",
    meal_name: "Tuna Salad Stuffed Peppers",
    calories: 420,
    protein_g: 42,
    carbs_g: 25,
    fats_g: 18,
    prep_time_min: 15,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Canned tuna", amount: "2 cans", notes: "drained, in water" },
      { item: "Bell peppers", amount: "2", notes: "halved, seeds removed" },
      { item: "Greek yogurt", amount: "2 tbsp" },
      { item: "Celery", amount: "2 stalks", notes: "diced" },
      { item: "Red onion", amount: "2 tbsp", notes: "diced" },
      { item: "Dijon mustard", amount: "1 tsp" }
    ],
    instructions: "1. Mix tuna with yogurt, mustard, celery, onion.\n2. Season with salt and pepper.\n3. Stuff pepper halves with mixture.\n4. Serve cold.",
    notes: "High protein, low carb option."
  },
  {
    meal_type: "lunch",
    meal_name: "Beef Stir-Fry",
    calories: 550,
    protein_g: 40,
    carbs_g: 42,
    fats_g: 24,
    prep_time_min: 15,
    cook_time_min: 10,
    servings: 1,
    ingredients: [
      { item: "Lean beef strips", amount: "6 oz" },
      { item: "Mixed vegetables", amount: "2 cups", notes: "broccoli, peppers, snap peas" },
      { item: "Brown rice", amount: "1/2 cup", notes: "cooked" },
      { item: "Soy sauce", amount: "2 tbsp", notes: "low sodium" },
      { item: "Sesame oil", amount: "1 tbsp" },
      { item: "Garlic", amount: "2 cloves", notes: "minced" }
    ],
    instructions: "1. Heat sesame oil in wok or large pan.\n2. Cook beef 3-4 min until browned.\n3. Add garlic and vegetables, stir-fry 5 min.\n4. Add soy sauce, toss.\n5. Serve over rice.",
    notes: "Add red pepper flakes for heat."
  }
];

// Dinner templates
const DINNERS: MealTemplate[] = [
  {
    meal_type: "dinner",
    meal_name: "Baked Salmon with Asparagus",
    calories: 520,
    protein_g: 45,
    carbs_g: 25,
    fats_g: 28,
    prep_time_min: 10,
    cook_time_min: 20,
    servings: 1,
    ingredients: [
      { item: "Salmon fillet", amount: "6 oz" },
      { item: "Asparagus", amount: "1 bunch" },
      { item: "Olive oil", amount: "1 tbsp" },
      { item: "Lemon", amount: "1", notes: "half for juice, half sliced" },
      { item: "Garlic powder", amount: "1/2 tsp" },
      { item: "Quinoa", amount: "1/2 cup", notes: "cooked" }
    ],
    instructions: "1. Preheat oven to 400°F.\n2. Place salmon and asparagus on baking sheet.\n3. Drizzle with oil, season with garlic powder, salt, pepper.\n4. Top salmon with lemon slices.\n5. Bake 15-18 min.\n6. Serve with quinoa and lemon juice.",
    notes: "Omega-3s support recovery and brain health."
  },
  {
    meal_type: "dinner",
    meal_name: "Lean Ground Turkey Tacos",
    calories: 480,
    protein_g: 40,
    carbs_g: 35,
    fats_g: 20,
    prep_time_min: 10,
    cook_time_min: 15,
    servings: 2,
    ingredients: [
      { item: "Ground turkey", amount: "8 oz", notes: "93% lean" },
      { item: "Corn tortillas", amount: "4 small" },
      { item: "Taco seasoning", amount: "2 tbsp" },
      { item: "Lettuce", amount: "1 cup", notes: "shredded" },
      { item: "Tomato", amount: "1", notes: "diced" },
      { item: "Greek yogurt", amount: "2 tbsp", notes: "instead of sour cream" }
    ],
    instructions: "1. Brown turkey in pan, drain fat.\n2. Add seasoning and 1/4 cup water, simmer 5 min.\n3. Warm tortillas.\n4. Assemble with turkey, lettuce, tomato, yogurt.",
    notes: "Double the recipe for meal prep."
  },
  {
    meal_type: "dinner",
    meal_name: "Grilled Steak with Sweet Potato",
    calories: 580,
    protein_g: 45,
    carbs_g: 40,
    fats_g: 26,
    prep_time_min: 10,
    cook_time_min: 25,
    servings: 1,
    ingredients: [
      { item: "Sirloin steak", amount: "6 oz" },
      { item: "Sweet potato", amount: "1 medium" },
      { item: "Green beans", amount: "1 cup" },
      { item: "Butter", amount: "1 tbsp" },
      { item: "Salt and pepper", amount: "to taste" }
    ],
    instructions: "1. Bake sweet potato at 400°F for 45 min (or microwave 8 min).\n2. Season steak with salt and pepper.\n3. Grill or pan-sear 4-5 min per side for medium.\n4. Steam green beans.\n5. Serve steak with sweet potato and butter, plus green beans.",
    notes: "Let steak rest 5 min before cutting."
  },
  {
    meal_type: "dinner",
    meal_name: "Chicken Breast with Rice and Veggies",
    calories: 500,
    protein_g: 48,
    carbs_g: 45,
    fats_g: 14,
    prep_time_min: 10,
    cook_time_min: 20,
    servings: 1,
    ingredients: [
      { item: "Chicken breast", amount: "7 oz" },
      { item: "Jasmine rice", amount: "1/2 cup", notes: "cooked" },
      { item: "Mixed vegetables", amount: "1.5 cups" },
      { item: "Olive oil", amount: "1 tbsp" },
      { item: "Italian seasoning", amount: "1 tsp" }
    ],
    instructions: "1. Season chicken with Italian seasoning, salt, pepper.\n2. Cook chicken in oiled pan 6-7 min per side.\n3. Steam or roast vegetables.\n4. Serve together with rice.",
    notes: "The classic bodybuilding meal. Simple but effective."
  }
];

// Snack templates
const SNACKS: MealTemplate[] = [
  {
    meal_type: "snack",
    meal_name: "Protein Shake",
    calories: 200,
    protein_g: 25,
    carbs_g: 15,
    fats_g: 5,
    prep_time_min: 2,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Protein powder", amount: "1 scoop" },
      { item: "Banana", amount: "1/2" },
      { item: "Almond milk", amount: "1 cup" },
      { item: "Ice", amount: "1/2 cup" }
    ],
    instructions: "1. Add all ingredients to blender.\n2. Blend until smooth.\n3. Drink immediately.",
    notes: "Great post-workout or between meals."
  },
  {
    meal_type: "snack",
    meal_name: "Hard Boiled Eggs & Almonds",
    calories: 220,
    protein_g: 18,
    carbs_g: 5,
    fats_g: 16,
    prep_time_min: 1,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Hard boiled eggs", amount: "2 large" },
      { item: "Almonds", amount: "15", notes: "raw or roasted" },
      { item: "Salt", amount: "pinch" }
    ],
    instructions: "1. Peel eggs.\n2. Sprinkle with salt.\n3. Eat with almonds.",
    notes: "Prep eggs in batches for the week."
  },
  {
    meal_type: "snack",
    meal_name: "Cottage Cheese & Fruit",
    calories: 180,
    protein_g: 20,
    carbs_g: 18,
    fats_g: 3,
    prep_time_min: 2,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Cottage cheese", amount: "1 cup", notes: "low-fat" },
      { item: "Pineapple", amount: "1/2 cup", notes: "chunks" },
      { item: "Cinnamon", amount: "dash" }
    ],
    instructions: "1. Scoop cottage cheese into bowl.\n2. Top with pineapple.\n3. Sprinkle with cinnamon.",
    notes: "Casein protein - great before bed."
  },
  {
    meal_type: "snack",
    meal_name: "Apple with Peanut Butter",
    calories: 250,
    protein_g: 8,
    carbs_g: 30,
    fats_g: 14,
    prep_time_min: 2,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Apple", amount: "1 medium" },
      { item: "Peanut butter", amount: "2 tbsp", notes: "natural" }
    ],
    instructions: "1. Slice apple.\n2. Dip in peanut butter.\n3. Enjoy.",
    notes: "Classic combination. Fiber + healthy fats."
  }
];

// Template definitions
const TEMPLATE_CONFIGS = [
  // Fat Loss templates (10)
  { name: "Fat Loss - Aggressive", goal: "Lose fat", min: 1400, max: 1600, p: 150, c: 100, f: 45 },
  { name: "Fat Loss - Standard Low", goal: "Lose fat", min: 1600, max: 1800, p: 160, c: 120, f: 50 },
  { name: "Fat Loss - Standard", goal: "Lose fat", min: 1800, max: 2000, p: 170, c: 140, f: 55 },
  { name: "Fat Loss - Moderate", goal: "Lose fat", min: 2000, max: 2200, p: 180, c: 160, f: 60 },
  { name: "Fat Loss - Active", goal: "Lose fat", min: 2200, max: 2400, p: 190, c: 180, f: 65 },
  { name: "Fat Loss - High Volume", goal: "Lose fat", min: 2400, max: 2600, p: 200, c: 200, f: 70 },
  { name: "Fat Loss - Large Frame", goal: "Lose fat", min: 2600, max: 2800, p: 210, c: 220, f: 75 },
  { name: "Fat Loss - Very Active", goal: "Lose fat", min: 2800, max: 3000, p: 220, c: 240, f: 80 },
  { name: "Fat Loss - High Protein", goal: "Lose fat", min: 1800, max: 2000, p: 200, c: 100, f: 65 },
  { name: "Fat Loss - Low Carb", goal: "Lose fat", min: 1600, max: 1800, p: 180, c: 80, f: 70 },
  
  // Muscle Building templates (10)
  { name: "Muscle - Lean Bulk", goal: "Build muscle", min: 2400, max: 2600, p: 180, c: 260, f: 70 },
  { name: "Muscle - Standard", goal: "Build muscle", min: 2600, max: 2800, p: 190, c: 290, f: 75 },
  { name: "Muscle - Mass Gain", goal: "Build muscle", min: 2800, max: 3000, p: 200, c: 320, f: 80 },
  { name: "Muscle - Heavy Bulk", goal: "Build muscle", min: 3000, max: 3200, p: 210, c: 350, f: 85 },
  { name: "Muscle - Extreme", goal: "Build muscle", min: 3200, max: 3400, p: 220, c: 380, f: 90 },
  { name: "Muscle - Max Calories", goal: "Build muscle", min: 3400, max: 3600, p: 230, c: 410, f: 95 },
  { name: "Muscle - Clean Bulk", goal: "Build muscle", min: 2600, max: 2800, p: 200, c: 270, f: 80 },
  { name: "Muscle - High Protein", goal: "Build muscle", min: 2800, max: 3000, p: 240, c: 280, f: 75 },
  { name: "Muscle - Balanced", goal: "Build muscle", min: 2700, max: 2900, p: 200, c: 300, f: 80 },
  { name: "Muscle - Hardgainer", goal: "Build muscle", min: 3300, max: 3500, p: 200, c: 420, f: 100 },
  
  // Recomp templates (10)
  { name: "Recomp - Standard", goal: "Both - lose fat and build muscle", min: 2000, max: 2200, p: 180, c: 180, f: 60 },
  { name: "Recomp - Slight Deficit", goal: "Both - lose fat and build muscle", min: 1800, max: 2000, p: 175, c: 150, f: 55 },
  { name: "Recomp - Slight Surplus", goal: "Both - lose fat and build muscle", min: 2200, max: 2400, p: 185, c: 210, f: 65 },
  { name: "Recomp - High Activity", goal: "Both - lose fat and build muscle", min: 2400, max: 2600, p: 195, c: 240, f: 70 },
  { name: "Recomp - Very Active", goal: "Both - lose fat and build muscle", min: 2600, max: 2800, p: 205, c: 270, f: 75 },
  { name: "Recomp - Large Frame", goal: "Both - lose fat and build muscle", min: 2800, max: 3000, p: 215, c: 300, f: 80 },
  { name: "Recomp - High Protein", goal: "Both - lose fat and build muscle", min: 2200, max: 2400, p: 220, c: 180, f: 65 },
  { name: "Recomp - Balanced", goal: "Both - lose fat and build muscle", min: 2100, max: 2300, p: 190, c: 195, f: 62 },
  { name: "Recomp - Lower Carb", goal: "Both - lose fat and build muscle", min: 2000, max: 2200, p: 200, c: 140, f: 70 },
  { name: "Recomp - Athlete", goal: "Both - lose fat and build muscle", min: 2500, max: 2700, p: 200, c: 260, f: 70 }
];

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function scaleMeal(meal: MealTemplate, factor: number): MealTemplate {
  return {
    ...meal,
    calories: Math.round(meal.calories * factor),
    protein_g: Math.round(meal.protein_g * factor),
    carbs_g: Math.round(meal.carbs_g * factor),
    fats_g: Math.round(meal.fats_g * factor)
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let templatesCreated = 0;
    let daysCreated = 0;
    let mealsCreated = 0;

    for (const config of TEMPLATE_CONFIGS) {
      // Check if template already exists
      const { data: existingTemplate } = await supabase
        .from("meal_plan_templates")
        .select("id")
        .eq("name", config.name)
        .single();

      if (existingTemplate) {
        console.log(`Template "${config.name}" already exists, skipping...`);
        continue;
      }

      // Create template
      const { data: template, error: templateError } = await supabase
        .from("meal_plan_templates")
        .insert({
          name: config.name,
          goal_type: config.goal,
          calorie_range_min: config.min,
          calorie_range_max: config.max,
          daily_protein_g: config.p,
          daily_carbs_g: config.c,
          daily_fats_g: config.f,
          description: `${config.goal} plan for ${config.min}-${config.max} calories/day`,
          is_active: true,
          display_order: templatesCreated
        })
        .select()
        .single();

      if (templateError) {
        console.error(`Error creating template ${config.name}:`, templateError);
        continue;
      }

      templatesCreated++;

      // Calculate scaling factor based on target calories
      const targetCals = (config.min + config.max) / 2;
      const baseCals = 2000; // Base meal calories
      const scaleFactor = targetCals / baseCals;

      // Create 7 days
      for (let dayNum = 1; dayNum <= 7; dayNum++) {
        const { data: day, error: dayError } = await supabase
          .from("meal_plan_days")
          .insert({
            template_id: template.id,
            day_number: dayNum,
            day_name: DAY_NAMES[dayNum - 1]
          })
          .select()
          .single();

        if (dayError) {
          console.error(`Error creating day ${dayNum}:`, dayError);
          continue;
        }

        daysCreated++;

        // Select meals for this day (rotate through options)
        const breakfast = scaleMeal(BREAKFASTS[(dayNum - 1) % BREAKFASTS.length], scaleFactor);
        const lunch = scaleMeal(LUNCHES[(dayNum - 1) % LUNCHES.length], scaleFactor);
        const dinner = scaleMeal(DINNERS[(dayNum - 1) % DINNERS.length], scaleFactor);
        const snack = scaleMeal(SNACKS[(dayNum - 1) % SNACKS.length], scaleFactor);

        const mealsToInsert = [breakfast, lunch, dinner, snack].map((meal, idx) => ({
          day_id: day.id,
          meal_type: meal.meal_type,
          meal_name: meal.meal_name,
          calories: meal.calories,
          protein_g: meal.protein_g,
          carbs_g: meal.carbs_g,
          fats_g: meal.fats_g,
          prep_time_min: meal.prep_time_min,
          cook_time_min: meal.cook_time_min,
          servings: meal.servings,
          ingredients: meal.ingredients,
          instructions: meal.instructions,
          notes: meal.notes || null,
          display_order: idx
        }));

        const { error: mealsError } = await supabase
          .from("meal_plan_meals")
          .insert(mealsToInsert);

        if (mealsError) {
          console.error(`Error creating meals for day ${dayNum}:`, mealsError);
        } else {
          mealsCreated += 4;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${templatesCreated} templates, ${daysCreated} days, and ${mealsCreated} meals`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
