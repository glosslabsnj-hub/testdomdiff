
# Free World Admin Hub: Client Suggestions & 100 Nutrition Templates

## Summary
This plan implements three key features:
1. **Client-aware template tabs** - When a client is selected and you switch to Workout Templates or Nutrition Templates, a sticky banner shows the recommended template for that client
2. **Fix nutrition template categories** - Reassign the existing 30 templates to their correct goal categories
3. **Create 100 detailed nutrition templates** - Populate the library with comprehensive meal plans across 5 goal categories with detailed recipes, cooking instructions, and swappable meals

---

## Part 1: Client Suggestion Banners

When a client is selected in the Clients tab and the admin switches to Workout Templates or Nutrition Templates, a persistent banner will appear at the top showing:
- Client name and photo
- Recommended category based on their intake data
- Match quality score (Excellent/Good/Fair)
- Quick-assign button

### For Workout Templates
Use existing `useTemplateSuggestion` hook with client data to calculate recommendation.

### For Nutrition Templates  
Use existing `calculateNutritionCategory` function with client's:
- Goal (maps to category)
- Weight, height, age (TDEE calculation)
- Activity level (calorie adjustment)

The banner will include:
- "Recommended for [Client Name]: [Category Name]" text
- "[Target Calories] cal/day" badge
- "View Recommended" button that scrolls to and expands that category

---

## Part 2: Fix Existing Template Categories

Current state: All 30 templates are incorrectly assigned to the "Recomposition" category.

Fix via SQL update to properly assign templates based on their goal_type:
- "Lose fat" templates → Fat Loss - Aggressive or Fat Loss - Moderate (based on calorie range)
- "Build muscle" templates → Muscle Building - Lean or Muscle Building - Mass (based on calorie range)
- "Both - lose fat and build muscle" templates → Recomposition

---

## Part 3: Create 100 Nutrition Templates

### Category Distribution (Fat Loss focus as requested)
| Category | Templates | Calorie Range |
|----------|-----------|---------------|
| Fat Loss - Aggressive | 30 | 1200-1800 |
| Fat Loss - Moderate | 25 | 1800-2400 |
| Recomposition | 15 | 2000-2600 |
| Muscle Building - Lean | 15 | 2400-3200 |
| Muscle Building - Mass | 15 | 3000-4000 |
| **Total** | **100** | |

### Template Structure (each template)
- **7 days** of meals (Monday-Sunday)
- **4 meals per day**: Breakfast, Lunch, Dinner, Snack
- **28 meals total per template** with full macro tracking

### Meal Content (detailed recipes)
Each meal will include:
- Name, meal type, calories, protein/carbs/fats
- Prep time, cook time, servings
- Detailed ingredients list with amounts and notes
- 10-15 step cooking instructions with:
  - Exact temperatures
  - Timing for each step
  - Pro tips
  - Dom-style motivation cues ("No shortcuts. Iron sharpens iron.")
- Storage/reheating notes for meal prep

### Swappable Meals
The existing swap system works by:
1. Filtering available meals by same meal_type (breakfast, lunch, etc.)
2. Sorting by calorie/protein similarity
3. Marking "Good Match" when within 100 cal and 10g protein

Templates will include enough variety that each meal_type has 10+ swap options across the library.

---

## Technical Implementation

### File Changes

| File | Change |
|------|--------|
| `src/components/admin/FreeWorldHub.tsx` | Pass selectedClient to Workout/Nutrition template tabs |
| `src/components/admin/coaching/FreeWorldWorkoutTemplates.tsx` | Add ClientRecommendationBanner component |
| `src/components/admin/coaching/FreeWorldNutritionTemplates.tsx` | Add ClientRecommendationBanner component |
| New: `src/components/admin/coaching/ClientRecommendationBanner.tsx` | Shared banner component for both tabs |
| `supabase/functions/populate-meal-plans/index.ts` | Major rewrite to generate 100 templates with detailed recipes |

### New Database Updates
- Update existing template `category_id` to match their actual goal
- Insert new templates with proper category assignment
- Insert 7 days × 4 meals × 100 templates = 2,800 meals

---

## Edge Function: populate-meal-plans (Rewrite)

### Meal Pools (Expanded)
The edge function will contain:
- **20 Breakfast options** (ranging 250-600 cal)
- **20 Lunch options** (ranging 400-800 cal)
- **20 Dinner options** (ranging 400-900 cal)
- **15 Snack options** (ranging 150-350 cal)

### Detailed Recipe Format
```typescript
{
  meal_name: "Iron Will Steak & Eggs",
  meal_type: "breakfast",
  calories: 520,
  protein_g: 48,
  carbs_g: 8,
  fats_g: 34,
  prep_time_min: 10,
  cook_time_min: 15,
  servings: 1,
  ingredients: [
    { item: "Ribeye steak", amount: "6 oz", notes: "room temperature" },
    { item: "Whole eggs", amount: "3 large" },
    { item: "Butter", amount: "1 tbsp" },
    // ...
  ],
  instructions: `1. PREP: Pull steak from fridge 30 min before cooking. Pat dry with paper towels. Season generously with salt and pepper on both sides. No seasoning fear here.

2. HEAT: Get your cast iron screaming hot over medium-high heat for 5 minutes. You want it smoking. That's the commitment.

3. SEAR: Add butter, let it foam. Lay steak away from you to avoid splatter. Don't touch it for 3 minutes. Trust the process.

4. FLIP: Only once. Another 3 minutes for medium-rare, 4 for medium. Use a meat thermometer if you're disciplined: 130°F medium-rare.

5. REST: Remove steak to cutting board. Cover loosely with foil. 5 minutes minimum. This is where iron sharpens iron.

6. EGGS: While steak rests, crack eggs into same pan with leftover butter. Season with salt.

7. COOK EGGS: For over-easy: 2 minutes lid off, then 30 seconds lid on. Whites set, yolk runny.

8. PLATE: Slice steak against the grain. Arrange with eggs. Pour any pan juices over steak.

9. SERVE: Immediately. Cold food is for quitters.

PRO TIP: Make multiple steaks for meal prep. Slice cold on salads. This meal built warriors.`,
  notes: "High protein, low carb. Perfect for fat loss or muscle building. The ultimate breakfast of champions."
}
```

### Template Generation Logic
1. Calculate target macros for each calorie range
2. Select meals that sum closest to daily targets
3. Ensure variety (no duplicate meals in same week)
4. Scale portions to hit exact macro targets

---

## Client Recommendation Banner Component

```typescript
interface ClientRecommendationBannerProps {
  client: ClientWithSubscription;
  type: "workout" | "nutrition";
  onViewRecommended: (categoryId: string) => void;
}
```

### Workout Recommendation
Uses `useTemplateSuggestion` hook (already exists):
- Experience level → category match
- Body fat estimate → intensity level
- Training days → program structure

### Nutrition Recommendation
Uses `calculateNutritionCategory` (already exists) + enhancements:
- TDEE calculation from profile data
- Goal mapping to category
- Calorie range matching to specific template

Banner displays:
- Purple accent styling (matches Free World theme)
- Client avatar + name
- "Recommended: [Category Name]"
- "[TDEE] cal/day TDEE → [Target] cal target"
- "View Recommended" button

---

## Execution Order

1. **Create banner component** (new file)
2. **Update FreeWorldHub** to pass client to template tabs
3. **Update FreeWorldWorkoutTemplates** to show banner
4. **Update FreeWorldNutritionTemplates** to show banner
5. **SQL migration** to fix existing category assignments
6. **Rewrite edge function** with 75 meals and 100 template configs
7. **Run edge function** to populate database

---

## Meal Categories by Goal

### Fat Loss - Aggressive (1200-1800 cal)
- Low carb focus
- High protein for muscle preservation
- Smaller portions, nutrient-dense
- Example template names: "Iron Discipline 1400", "Lean & Mean 1600"

### Fat Loss - Moderate (1800-2400 cal)
- Balanced macros
- Sustainable deficit
- Moderate carbs around training
- Example: "Steady Burn 2000", "Active Cut 2200"

### Recomposition (2000-2600 cal)
- Maintenance calories
- High protein
- Carb cycling friendly
- Example: "Body Forge 2200", "Recomp Standard 2400"

### Muscle Building - Lean (2400-3200 cal)
- Slight surplus
- Clean food focus
- Higher carbs
- Example: "Clean Gains 2600", "Lean Mass 3000"

### Muscle Building - Mass (3000-4000 cal)
- Aggressive surplus
- Maximum protein
- Higher calorie density
- Example: "Mass Protocol 3400", "Beast Mode 3800"

---

## Swappable Meal Variety

Each meal type will have multiple options with similar macros:

### Breakfast Examples (all ~400 cal, ~35g protein)
- Power Egg Scramble
- Protein Oatmeal Bowl
- Breakfast Burrito
- Steak & Eggs
- Greek Yogurt Parfait
- Cottage Cheese Power Bowl

This ensures the swap dialog always shows "Good Match" options within 100 cal and 10g protein of the original meal.
