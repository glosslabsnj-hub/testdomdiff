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
    const { userId, regenerate, coachingApproach } = await req.json();

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
      .select("goal, goal_type, experience, age, height, weight, gender, equipment, activity_level, body_fat_estimate, dietary_restrictions, meal_prep_preference, food_dislikes, nutrition_style, training_days_per_week")
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
      `GENDER: ${profile.gender || "male"}`,
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

    let tierContext: string;
    if (planType === "coaching") {
      tierContext = "\n\nTHIS IS A FREE WORLD (1:1 COACHING) CLIENT. Generate PREMIUM meal plans with more variety, more detailed instructions, specific macro targets per meal, and coach notes about timing, portion adjustment, and meal swap suggestions.";
      if (coachingApproach) {
        tierContext += `\n\nDOM'S APPROVED NUTRITION APPROACH FOR THIS CLIENT:\nTitle: ${coachingApproach.title}\nApproach: ${coachingApproach.summary}\nKey Focus Areas: ${(coachingApproach.differentiators || []).join(", ")}`;
        if (coachingApproach.domNotes) {
          tierContext += `\nDom's Personal Notes: ${coachingApproach.domNotes}`;
        }
        tierContext += `\n\nFOLLOW THIS APPROVED APPROACH. The meal structure, food choices, and macro targets should reflect Dom's specific choices for this client.`;
      }
    } else {
      tierContext = "\n\nTHIS IS A GENERAL POPULATION CLIENT. Generate solid, practical meal plans with clear instructions and macros.";
    }

    // Split generation into individual day calls to stay within Haiku's 8192 token output limit
    const batches = [
      { days: [1], label: "Mon" },
      { days: [2], label: "Tue" },
      { days: [3], label: "Wed" },
      { days: [4], label: "Thu" },
      { days: [5], label: "Fri" },
      { days: [6], label: "Sat" },
      { days: [7], label: "Sun" },
    ];
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const buildMealPrompt = (dayRange: number[], isFirst: boolean, prevMeals?: string): string => {
      const dayLabels = dayRange.map(d => dayNames[d - 1]).join(", ");
      const mealSchema = `{"meal_type":"breakfast|lunch|dinner|snack","meal_name":"string","calories":0,"protein_g":0,"carbs_g":0,"fats_g":0,"prep_time_min":0,"cook_time_min":0,"servings":1,"ingredients":[{"item":"string","amount":"string"}],"instructions":"string","notes":"string"}`;
      return `${DOM_NUTRITION_PHILOSOPHY}
${tierContext}

USER PROFILE:
${nutritionContext}

Generate meals for ${dayLabels}. This day needs exactly 4 meals: breakfast, lunch, dinner, snack.
${!isFirst && prevMeals ? `\nPREVIOUS DAYS' MEALS (do NOT repeat any of these):\n${prevMeals}\n` : ""}
REQUIREMENTS:
- REAL ingredients with exact measurements (oz, cups, tbsp)
- Brief cooking instructions in Dom's voice (2-3 sentences max per meal)
- Accurate macros per meal that sum to appropriate daily totals for this user
- Practical meals, most under 30 min
- NO repeated meals from previous days
- Respect dietary restrictions

Respond ONLY with valid JSON — no markdown, no comments:
${isFirst ? `{"plan_name":"string","plan_notes":"string (1 sentence)","daily_targets":{"calories":0,"protein_g":0,"carbs_g":0,"fats_g":0},"days":[{"day_number":${dayRange[0]},"day_name":"${dayNames[dayRange[0] - 1]}","meals":[${mealSchema}]}]}` : `{"days":[{"day_number":${dayRange[0]},"day_name":"${dayNames[dayRange[0] - 1]}","meals":[${mealSchema}]}]}`}`;
    };

    console.log(`Generating ${planType} meal plan for user ${userId} — goal: ${userGoal}`);

    const allDays: any[] = [];
    let planMeta: any = {};
    let prevMealNames: string[] = [];
    const batchErrors: string[] = [];

    for (const batch of batches) {
      const isFirst = batch.days[0] === 1;
      const prevMeals = prevMealNames.length > 0 ? prevMealNames.join(", ") : undefined;
      const prompt = buildMealPrompt(batch.days, isFirst, prevMeals);

      let response;
      try {
        response = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 8192,
          messages: [{ role: "user", content: prompt }],
        });
      } catch (apiErr: any) {
        const errMsg = `API error for batch ${batch.label}: ${apiErr?.message || apiErr}`;
        console.error(errMsg);
        batchErrors.push(errMsg);
        continue;
      }

      const aiText = response.content[0].type === "text" ? response.content[0].text : "";
      console.log(`Meal batch ${batch.label}: stop=${response.stop_reason}, len=${aiText.length}`);

      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        const errMsg = `No JSON for batch ${batch.label}. First 500 chars: ${aiText.substring(0, 500)}`;
        console.error(errMsg);
        batchErrors.push(errMsg);
        continue;
      }

      let batchParsed;
      try {
        batchParsed = JSON.parse(jsonMatch[0]);
      } catch (e) {
        const errMsg = `Parse error for batch ${batch.label}: ${(e as Error).message}. First 500 chars: ${jsonMatch[0].substring(0, 500)}`;
        console.error(errMsg);
        batchErrors.push(errMsg);
        continue;
      }

      if (isFirst) {
        planMeta = {
          plan_name: batchParsed.plan_name,
          plan_notes: batchParsed.plan_notes,
          daily_targets: batchParsed.daily_targets,
        };
      }

      for (const day of batchParsed.days || []) {
        allDays.push(day);
        for (const meal of day.meals || []) {
          prevMealNames.push(meal.meal_name);
        }
      }
    }

    if (allDays.length === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to generate any meal days", details: batchErrors }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsed = { ...planMeta, days: allDays };
    console.log(`Meal plan parsed: ${allDays.length} days, plan: ${parsed.plan_name}`);

    // Calculate ACTUAL daily targets from the meal data (not the AI's separate targets)
    // This ensures displayed targets always match what the meals add up to
    let actualCalories = 0;
    let actualProtein = 0;
    let actualCarbs = 0;
    let actualFats = 0;
    let dayCount = 0;

    for (const day of parsed.days || []) {
      let dayCal = 0, dayPro = 0, dayCarb = 0, dayFat = 0;
      for (const meal of day.meals || []) {
        dayCal += meal.calories || 0;
        dayPro += meal.protein_g || 0;
        dayCarb += meal.carbs_g || 0;
        dayFat += meal.fats_g || 0;
      }
      actualCalories += dayCal;
      actualProtein += dayPro;
      actualCarbs += dayCarb;
      actualFats += dayFat;
      dayCount++;
    }

    // Average across all days for the template targets
    const avgCalories = dayCount > 0 ? Math.round(actualCalories / dayCount) : (parsed.daily_targets?.calories || 2000);
    const avgProtein = dayCount > 0 ? Math.round(actualProtein / dayCount) : (parsed.daily_targets?.protein_g || 150);
    const avgCarbs = dayCount > 0 ? Math.round(actualCarbs / dayCount) : (parsed.daily_targets?.carbs_g || 200);
    const avgFats = dayCount > 0 ? Math.round(actualFats / dayCount) : (parsed.daily_targets?.fats_g || 60);

    // Store the meal plan in the database
    const { data: template, error: templateError } = await supabase
      .from("meal_plan_templates")
      .insert({
        user_id: userId,
        name: parsed.plan_name || `${userGoal} Meal Plan`,
        goal_type: parsed.goal_type || userGoal,
        description: parsed.plan_notes || null,
        calorie_range_min: avgCalories,
        calorie_range_max: avgCalories,
        daily_protein_g: avgProtein,
        daily_carbs_g: avgCarbs,
        daily_fats_g: avgFats,
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
