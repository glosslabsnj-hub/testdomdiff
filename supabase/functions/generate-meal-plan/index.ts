import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.39.0";
import { getCorsHeaders } from "../_shared/cors.ts";

const DOM_NUTRITION_PHILOSOPHY = `You are Dom Different — building meal plans for people in your program. You didn't learn nutrition from a textbook. You learned it rebuilding your body from scratch after prison with limited resources. Your approach is SIMPLE, EFFECTIVE, and NO-NONSENSE.

=== DOM'S NUTRITION RULES ===

1. PROTEIN IS KING — Every meal has protein. Period. You don't eat a meal without protein. Chicken, eggs, beef, fish, turkey, Greek yogurt, cottage cheese, protein powder. If there's no protein on the plate, it's a snack, not a meal.

2. SIMPLE INGREDIENTS — Dom doesn't cook with 47 exotic ingredients from Whole Foods. Chicken breast, rice, eggs, oats, sweet potatoes, ground turkey, broccoli, spinach. Foods you can find at ANY grocery store, in ANY city, on ANY budget. This is prison-proof nutrition — you could make these meals with commissary-level ingredients.

3. MEAL PREP IS DISCIPLINE — Cook in bulk. Eat on schedule. Don't leave your nutrition to chance. You fail when you get hungry with no plan. Cook on Sunday, eat all week. That's how inmates do it. That's how warriors do it.

4. FUEL THE WORK — You eat to perform, not to enjoy yourself. Food is fuel first. If it tastes good too, that's a bonus. But you're not here for a cooking show. You're here to build a body that performs.

5. NO COMPLICATED DIETS — No keto debates. No intermittent fasting arguments. No macro cycling spreadsheets. Eat protein at every meal. Eat vegetables. Eat complex carbs around training. Drink water. Sleep. That's 90% of it.

6. REAL PORTIONS — Dom doesn't do tiny wellness portions. You're training hard, you need to EAT. But you eat CLEAN. Big plates of real food, not big plates of garbage.

=== MEAL PLAN STRUCTURE ===

Every day has 4 meals:
- BREAKFAST: High protein, sets the tone for the day. You eat within 1 hour of waking.
- LUNCH: Balanced macros, sustainable energy. This is your midday fuel.
- DINNER: Protein-focused, moderate carbs (lower if fat loss goal). Last big meal.
- SNACK: Protein-rich, 150-300 calories. Between meals when needed.

=== RECIPE STYLE ===

Every meal must include:
1. Full ingredient list with EXACT amounts (oz, cups, tbsp — no "some" or "a little")
2. Step-by-step instructions in DOM'S VOICE:
   - Direct, no-nonsense ("Season the chicken. Don't be scared of salt.")
   - Practical tips ("Pat the chicken dry. Wet chicken doesn't sear, it steams. That's weak.")
   - Motivational notes woven in naturally ("Prep your meals Sunday. Monday you eat like a king while everyone else eats fast food.")
3. Prep time and cook time (most meals should be 30 min or less)
4. Complete macros: calories, protein, carbs, fats

=== GOAL-BASED ADJUSTMENTS ===

FAT LOSS:
- Higher protein (1g per lb bodyweight target)
- Lower carbs (primarily around training)
- Moderate fats
- Daily target: ~1800-2200 cal for most, adjust by bodyweight
- Emphasis on volume foods (vegetables, lean proteins)

MUSCLE BUILDING:
- High protein (1-1.2g per lb bodyweight target)
- High carbs (fuel the training and recovery)
- Moderate fats
- Daily target: ~2500-3200 cal for most, adjust by bodyweight
- Emphasis on calorie-dense whole foods

RECOMPOSITION:
- High protein (1g per lb bodyweight)
- Moderate carbs and fats
- Daily target: maintenance calories (~2200-2600)
- Balance between fat loss meals and muscle building meals

=== DIETARY RESTRICTION HANDLING ===
- Vegetarian: Replace meat with eggs, Greek yogurt, cottage cheese, tofu, tempeh, legumes, protein powder
- Gluten-free: Replace bread/pasta with rice, potatoes, oats (certified GF), quinoa
- Dairy-free: Replace dairy with almond milk, coconut yogurt, dairy-free protein
- Keto/Low-carb: Reduce carbs to <50g/day, increase fats (avocado, nuts, olive oil, fatty fish)
- No restrictions: Full menu available`;

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, regenerate } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check for existing meal plan
    if (!regenerate) {
      const { data: existingTemplate } = await supabase
        .from("meal_plan_templates")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      if (existingTemplate && existingTemplate.length > 0) {
        return new Response(
          JSON.stringify({ success: true, message: "Meal plan already exists", cached: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // Clear existing plan
      const { data: existingTemplates } = await supabase
        .from("meal_plan_templates")
        .select("id")
        .eq("user_id", userId);

      if (existingTemplates && existingTemplates.length > 0) {
        const templateIds = existingTemplates.map((t: any) => t.id);

        // Get day IDs for these templates
        const { data: days } = await supabase
          .from("meal_plan_days")
          .select("id")
          .in("template_id", templateIds);

        if (days && days.length > 0) {
          const dayIds = days.map((d: any) => d.id);
          await supabase.from("meal_plan_meals").delete().in("day_id", dayIds);
          await supabase.from("meal_plan_days").delete().in("template_id", templateIds);
        }
        await supabase.from("meal_plan_templates").delete().eq("user_id", userId);
      }
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("goal, goal_type, experience, age, height, weight, equipment, activity_level, body_fat_estimate, dietary_restrictions, meal_prep_preference, food_dislikes, nutrition_style, training_days_per_week")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get subscription tier
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan_type")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    const planType = subscription?.plan_type || "transformation";

    if (planType === "membership") {
      return new Response(
        JSON.stringify({ error: "Custom meal plans are not available for Solitary Confinement tier." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userGoal = (profile.goal_type || profile.goal || "Lose fat").trim();
    const client = new Anthropic({ apiKey: anthropicKey });

    // Build user nutrition context
    const nutritionContext = [
      `GOAL: ${userGoal}`,
      `AGE: ${profile.age || "Not specified"}`,
      `HEIGHT: ${profile.height || "Not specified"}`,
      `WEIGHT: ${profile.weight || "Not specified"}`,
      `ACTIVITY LEVEL: ${profile.activity_level || "moderately_active"}`,
      `BODY FAT ESTIMATE: ${profile.body_fat_estimate || "Not specified"}`,
      `TRAINING DAYS PER WEEK: ${profile.training_days_per_week || 4}`,
      profile.dietary_restrictions ? `DIETARY RESTRICTIONS: ${profile.dietary_restrictions}` : null,
      profile.meal_prep_preference ? `MEAL PREP PREFERENCE: ${profile.meal_prep_preference}` : null,
      profile.food_dislikes ? `FOOD DISLIKES: ${profile.food_dislikes}` : null,
      profile.nutrition_style ? `NUTRITION STYLE/NOTES: ${profile.nutrition_style}` : null,
    ].filter(Boolean).join("\n");

    const tierContext = planType === "coaching"
      ? "\n\nTHIS IS A FREE WORLD (1:1 COACHING) CLIENT. Generate PREMIUM meal plans with more variety, more detailed instructions, specific macro targets per meal, and coach notes about timing, portion adjustment, and meal swap suggestions."
      : "\n\nTHIS IS A GENERAL POPULATION CLIENT. Generate solid, practical meal plans with clear instructions and macros.";

    const prompt = `${DOM_NUTRITION_PHILOSOPHY}
${tierContext}

USER PROFILE:
${nutritionContext}

Generate a COMPLETE 7-day meal plan for this user. Each day needs 4 meals: breakfast, lunch, dinner, snack.

CRITICAL REQUIREMENTS:
- Every meal has REAL, SPECIFIC ingredients with exact measurements (oz, cups, tbsp — never "some" or "a little")
- Every meal has DETAILED step-by-step cooking instructions in Dom's voice — written so someone who has NEVER cooked can follow them perfectly. Include heat levels, visual cues ("until golden brown"), timing, and tips
- Every meal has accurate macros (calories, protein, carbs, fats)
- Meals should be PRACTICAL — most take 30 min or less to make
- Include meal prep tips, storage instructions, and reheat instructions where relevant
- Respect any dietary restrictions or food dislikes completely
- Aim for the appropriate calorie/macro targets based on their goal
- Variety across the 7 days — don't repeat the same meal twice
- Include at least 2-3 meals that can be batch-prepped
- Every meal MUST include 1-2 SWAP OPTIONS — alternative meals with similar macros that the user can substitute if they don't like the original or want variety. Each swap must include the meal name, brief description, and matching macros.

COOKING INSTRUCTION REQUIREMENTS:
- Number every step
- Include EXACT temperatures ("medium-high heat, about 375F")
- Include visual/sensory cues ("cook until the edges are golden and crispy, about 3-4 minutes")
- Include what utensils/equipment they need
- Include food safety tips where relevant ("chicken must reach 165F internal temp")
- Include storage instructions ("stores in fridge for 4 days in airtight container")
- Write in Dom's voice — direct, no-nonsense, with motivational drops woven in naturally

GROCERY LIST REQUIREMENT:
Include a COMPLETE weekly grocery list organized by store section (Produce, Protein/Meat, Dairy, Pantry/Dry Goods, Frozen, Condiments/Spices). Combine amounts across all 7 days so the user can do ONE shopping trip.

Respond ONLY with valid JSON:
{
  "plan_name": "string — e.g., 'Fat Loss Fuel Plan' or 'Muscle Building Protocol'",
  "goal_type": "${userGoal}",
  "daily_targets": {
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fats_g": number
  },
  "plan_notes": "string — Dom's voice, 2-3 sentences about this plan's approach",
  "grocery_list": {
    "produce": [{ "item": "string", "amount": "string" }],
    "protein_meat": [{ "item": "string", "amount": "string" }],
    "dairy": [{ "item": "string", "amount": "string" }],
    "pantry_dry_goods": [{ "item": "string", "amount": "string" }],
    "frozen": [{ "item": "string", "amount": "string" }],
    "condiments_spices": [{ "item": "string", "amount": "string" }]
  },
  "meal_prep_day_instructions": "string — what to batch-prep on Sunday, step by step, in Dom's voice",
  "days": [
    {
      "day_number": 1,
      "day_name": "Monday",
      "daily_total": { "calories": number, "protein_g": number, "carbs_g": number, "fats_g": number },
      "meals": [
        {
          "meal_type": "breakfast|lunch|dinner|snack",
          "meal_name": "string",
          "calories": number,
          "protein_g": number,
          "carbs_g": number,
          "fats_g": number,
          "prep_time_min": number,
          "cook_time_min": number,
          "servings": number,
          "ingredients": [
            { "item": "string", "amount": "string", "notes": "string or null" }
          ],
          "instructions": "string — DETAILED step-by-step cooking instructions in Dom's voice. Number every step. Include temperatures, timing, visual cues, equipment needed.",
          "storage_instructions": "string — how to store leftovers, how long it lasts, how to reheat",
          "notes": "string — meal prep tips, best time to eat, Dom's take on this meal",
          "swap_options": [
            {
              "meal_name": "string",
              "description": "string — 1 sentence what it is",
              "calories": number,
              "protein_g": number,
              "carbs_g": number,
              "fats_g": number
            }
          ]
        }
      ]
    }
  ]
}

Generate all 7 days with 4 meals each (28 total meals). Every meal must be UNIQUE. Every meal must have at least 1 swap option.`;

    console.log(`Generating ${planType} meal plan for user ${userId} — goal: ${userGoal}`);

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 32000,
      messages: [{ role: "user", content: prompt }],
    });

    const aiText = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("Failed to parse meal plan AI response:", aiText.substring(0, 500));
      return new Response(
        JSON.stringify({ error: "AI response parsing failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("Meal plan JSON parse error:", e);
      return new Response(
        JSON.stringify({ error: "Failed to parse meal plan response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store the meal plan in the database
    const { data: template, error: templateError } = await supabase
      .from("meal_plan_templates")
      .insert({
        user_id: userId,
        name: parsed.plan_name || `${userGoal} Meal Plan`,
        goal_type: parsed.goal_type || userGoal,
        description: parsed.plan_notes || null,
        calorie_range_min: Math.round((parsed.daily_targets?.calories || 2000) * 0.9),
        calorie_range_max: Math.round((parsed.daily_targets?.calories || 2000) * 1.1),
        daily_protein_g: parsed.daily_targets?.protein_g || 150,
        daily_carbs_g: parsed.daily_targets?.carbs_g || 200,
        daily_fats_g: parsed.daily_targets?.fats_g || 60,
        is_active: true,
        display_order: 1,
      })
      .select("id")
      .single();

    if (templateError || !template) {
      console.error("Failed to create meal plan template:", templateError);
      return new Response(
        JSON.stringify({ error: "Failed to store meal plan template", details: templateError?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store grocery list and meal prep instructions on the template
    if (parsed.grocery_list || parsed.meal_prep_day_instructions) {
      await supabase
        .from("meal_plan_templates")
        .update({
          grocery_list: parsed.grocery_list || null,
          meal_prep_instructions: parsed.meal_prep_day_instructions || null,
        })
        .eq("id", template.id);
    }

    // Insert days and meals
    let totalMeals = 0;
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    for (const day of parsed.days || []) {
      const { data: dayRow, error: dayError } = await supabase
        .from("meal_plan_days")
        .insert({
          template_id: template.id,
          day_number: day.day_number,
          day_name: dayNames[day.day_number - 1] || day.day_name,
        })
        .select("id")
        .single();

      if (dayError || !dayRow) {
        console.error(`Failed to create day ${day.day_number}:`, dayError);
        continue;
      }

      const mealOrder = { breakfast: 1, lunch: 2, dinner: 3, snack: 4 };

      for (const meal of day.meals || []) {
        // Build notes with storage instructions and swap options appended
        const fullNotes = [
          meal.notes || "",
          meal.storage_instructions ? `\n\nSTORAGE: ${meal.storage_instructions}` : "",
          meal.swap_options?.length ? `\n\nSWAP OPTIONS:\n${meal.swap_options.map((s: any) => `- ${s.meal_name} (${s.calories} cal, ${s.protein_g}g P / ${s.carbs_g}g C / ${s.fats_g}g F): ${s.description}`).join("\n")}` : "",
        ].join("");

        await supabase.from("meal_plan_meals").insert({
          day_id: dayRow.id,
          meal_type: meal.meal_type,
          meal_name: meal.meal_name,
          calories: meal.calories || 0,
          protein_g: meal.protein_g || 0,
          carbs_g: meal.carbs_g || 0,
          fats_g: meal.fats_g || 0,
          prep_time_min: meal.prep_time_min || 10,
          cook_time_min: meal.cook_time_min || 15,
          servings: meal.servings || 1,
          ingredients: meal.ingredients || [],
          instructions: meal.instructions || "",
          notes: fullNotes.trim(),
          display_order: mealOrder[meal.meal_type as keyof typeof mealOrder] || 5,
        });
        totalMeals++;
      }
    }

    console.log(`Meal plan generated and stored: ${totalMeals} meals across 7 days for user ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${planType === "coaching" ? "Free World" : "General Population"} meal plan generated`,
        plan_name: parsed.plan_name,
        plan_type: planType,
        goal_type: userGoal,
        total_meals: totalMeals,
        daily_targets: parsed.daily_targets,
        has_grocery_list: !!parsed.grocery_list,
        has_meal_prep_instructions: !!parsed.meal_prep_day_instructions,
        cached: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Meal plan generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
