
# Free World Admin Hub: Template-Level Recommendations, Enhanced Intake & Editable Nutrition

## Summary
This plan implements five major features:
1. **Template-level recommendations** - Instead of just recommending a category, the system will recommend a specific template within that category based on calorie matching (nutrition) and intensity/equipment matching (workouts)
2. **Enhanced intake form** - Add key fields to capture calorie-relevant data and standardize goal selection for accurate template matching
3. **Editable nutrition templates** - Full inline editing for templates, days, and meals in the admin view
4. **Expandable meals with ingredients/instructions** - Each meal card expands to show detailed recipe instructions and ingredient lists
5. **Weekly grocery lists** - Auto-generated shopping lists aggregated per week from meal ingredients

---

## Part 1: Template-Level Recommendations

### Current State
- Workout: Recommends a **category** (e.g., "Foundation Builder") but not a specific template
- Nutrition: Recommends a **category** (e.g., "Fat Loss - Moderate") but not a specific template

### Solution

**For Nutrition Templates:**
Create a `calculateRecommendedNutritionTemplate` function that:
1. Takes the client's target calories from `calculateNutritionCategory`
2. Finds all templates in the recommended category
3. Scores each template by how close its `calorie_range_min/max` midpoint is to the target
4. Returns the best-matching template

Scoring formula:
```
score = 100 - (Math.abs(targetCalories - templateMidpoint) / 50)
```

**For Workout Templates:**
Create a `calculateRecommendedWorkoutTemplate` function that:
1. Takes the recommended category
2. Scores templates within that category based on:
   - Equipment match (40%): Compare client's `equipment` field to template's requirements
   - Training days match (30%): Compare `training_days_per_week` to template's `days_per_week`
   - Intensity match (30%): Map body composition + experience to intensity level

### Banner Update
The `ClientRecommendationBanner` will be updated to show:
- Recommended **category** (as before)
- Recommended **template** name with "Best Match" badge
- "View Template" button scrolls directly to that template and auto-expands it

---

## Part 2: Enhanced Free World Intake Form

The current intake collects useful data but has gaps that affect recommendation accuracy:

### Changes to Goals Step

**Current:** Free-text input for "Primary Goal"
**Problem:** Users type anything ("lose 30 lbs", "get stronger") which doesn't map cleanly to categories

**Solution:** Add a structured goal selector (radio group) with options:
- "Lose fat" (maps to fat loss categories)
- "Build muscle" (maps to muscle building categories)  
- "Both - lose fat and build muscle" (maps to recomposition)

Keep the free-text goal as a secondary "Goal Details" field for Dom to understand specifics.

### New Nutrition-Specific Questions

Add to Step 4 (Health & Lifestyle):

**Dietary Restrictions** (checkboxes):
- No restrictions
- Gluten-free
- Dairy-free
- Vegetarian
- Keto/Low-carb
- Other

**Meal Prep Preference** (radio):
- "I can cook fresh meals daily"
- "I prefer batch cooking 2-3 times per week"
- "I need quick 15-minute meals"

**Food Dislikes** (text field):
- "Any foods you absolutely won't eat?"

### New Workout-Specific Questions

Add clarifying questions to Step 3 (Training Readiness):

**Preferred Training Style** (checkboxes):
- Strength/powerlifting
- Bodybuilding/hypertrophy
- Functional fitness
- Cardio/conditioning
- Mixed

**Session Length Preference** (radio):
- "30-45 minutes"
- "45-60 minutes"  
- "60-90 minutes"

### Database Changes
Add new columns to `profiles` table:
- `goal_type` (text): Standardized goal mapping
- `dietary_restrictions` (text): Comma-separated list
- `meal_prep_preference` (text)
- `food_dislikes` (text)
- `training_style` (text): Comma-separated preferences
- `session_length_preference` (text)

---

## Part 3: Editable Nutrition Templates

### Template-Level Editing
Enable inline editing for template metadata:
- Name, description
- Calorie range (min/max)
- Daily macros (protein, carbs, fats)
- Category assignment

### Day-Level Management
- Edit day names
- Reorder days within weeks

### Meal-Level Editing (Expanded View)
When a meal is expanded, show:
- Meal name (editable)
- Meal type dropdown (breakfast/lunch/dinner/snack)
- Macros (calories, protein, carbs, fats) - all editable
- Prep time, cook time, servings (editable)
- Ingredients list (editable JSON array)
- Instructions (editable textarea)
- Notes (editable)
- Image URL (editable)

Changes save via `useUpdateNutritionMeal` mutation.

### UI Structure
```
Template Row
├── Edit icon → Opens modal/inline form for template fields
└── Expanded:
    ├── Macro summary bar
    └── Week 1
        ├── Day 1: Monday
        │   ├── Breakfast: Power Egg Scramble [Edit] [Expand]
        │   │   └── Expanded:
        │   │       ├── Macros (editable)
        │   │       ├── Prep/Cook time
        │   │       ├── Ingredients (editable list)
        │   │       ├── Instructions (editable)
        │   │       └── Notes
        │   ├── Lunch: ...
        │   └── ...
```

---

## Part 4: Expandable Meals with Ingredients/Instructions

### Current State
Meals show as single-line items with basic info:
`Breakfast: Power Egg Scramble` `420 cal • P35g C28g F18g`

### Enhanced View
Each meal becomes expandable with a collapsible content section:

**Meal Header (collapsed)**
- Meal name
- Quick macros badge
- Expand/collapse chevron
- Edit icon

**Meal Content (expanded)**
- Prep time, cook time, servings badges
- Ingredients list with checkboxes (for user view in dashboard)
- Numbered cooking instructions (formatted with Dom-style motivation)
- Chef's notes section

### Ingredient Display Format
```
Ingredients (6 items):
□ 3 large eggs
□ 1 cup spinach, fresh
□ ½ bell pepper, diced
□ 1 tsp olive oil
□ 1 slice whole wheat toast
□ Salt and pepper to taste
```

### Instructions Display Format
```
1. Heat oil in pan over medium heat.
2. Sauté peppers 2 min until softened.
3. Add spinach, cook until wilted.
4. Pour in eggs, scramble until done.
5. Serve with toast. No shortcuts.
```

---

## Part 5: Weekly Grocery Lists

### Implementation Approach
The `ingredients` column already exists as JSONB with structure:
```json
[
  {"item": "Chicken breast", "amount": "6 oz"},
  {"item": "Brown rice", "amount": "1/2 cup", "notes": "cooked"}
]
```

### Grocery List Generation
Create a function that:
1. Takes all meals for a specific week (days 1-7, 8-14, 15-21, 22-28)
2. Aggregates all ingredients by item name
3. Combines amounts where logical (e.g., "6 oz chicken" x 3 = "18 oz chicken")
4. Groups by category (Proteins, Vegetables, Grains, Dairy, Pantry)

### UI Display
Add a "Grocery List" tab per week:
```
Week 1 Grocery List
────────────────────
PROTEINS
• Chicken breast: 2.5 lbs
• Salmon fillet: 1.5 lbs
• Ground beef (lean): 1 lb
• Eggs: 2 dozen

VEGETABLES
• Broccoli: 4 cups
• Spinach: 6 cups
• Bell peppers: 4
• Asparagus: 2 bunches

GRAINS
• Brown rice: 3 cups (dry)
• Quinoa: 2 cups (dry)
• Whole wheat bread: 1 loaf

[Copy to Clipboard] [Print]
```

### Category Detection
Use keyword matching to auto-categorize:
- **Proteins**: chicken, beef, salmon, fish, eggs, turkey, pork
- **Vegetables**: broccoli, spinach, peppers, asparagus, zucchini
- **Grains**: rice, quinoa, bread, oats, pasta
- **Dairy**: milk, cheese, yogurt, cottage cheese
- **Pantry**: oil, salt, pepper, spices, sauce

---

## Technical Implementation

### Files to Create
| File | Purpose |
|------|---------|
| `src/hooks/useNutritionSuggestion.ts` | Template-level nutrition recommendation logic |
| `src/hooks/useWorkoutSuggestion.ts` | Template-level workout recommendation logic |
| `src/components/admin/coaching/ExpandableMealCard.tsx` | Meal display with ingredients/instructions |
| `src/components/admin/coaching/NutritionGroceryList.tsx` | Weekly grocery list generator/display |
| `src/components/admin/coaching/NutritionTemplateEditor.tsx` | Inline editing for templates/meals |

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/FreeWorldIntake.tsx` | Add structured goal selector, dietary restrictions, meal prep, training style, session length |
| `src/components/admin/coaching/ClientRecommendationBanner.tsx` | Show template-level recommendation, not just category |
| `src/components/admin/coaching/FreeWorldNutritionTemplates.tsx` | Integrate expandable meals, editing, grocery lists |
| `src/components/admin/coaching/FreeWorldWorkoutTemplates.tsx` | Integrate template-level recommendations |
| `src/hooks/useNutritionTemplates.ts` | Add template-level recommendation function, update meal interface for ingredients |

### Database Migration
```sql
-- Add new intake fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS goal_type text,
ADD COLUMN IF NOT EXISTS dietary_restrictions text,
ADD COLUMN IF NOT EXISTS meal_prep_preference text,
ADD COLUMN IF NOT EXISTS food_dislikes text,
ADD COLUMN IF NOT EXISTS training_style text,
ADD COLUMN IF NOT EXISTS session_length_preference text;
```

---

## Recommendation Algorithm Details

### Nutrition Template Selection

**Inputs:**
- Client's calculated target calories (from TDEE + goal adjustment)
- Recommended category (from goal mapping)

**Process:**
1. Filter templates by category_id
2. For each template, calculate fit score:
   ```
   templateMidpoint = (calorie_range_min + calorie_range_max) / 2
   calorieDistance = Math.abs(targetCalories - templateMidpoint)
   score = Math.max(0, 100 - (calorieDistance / 10))
   ```
3. Return template with highest score

**Example:**
- Client target: 1850 cal
- Template "Fat Loss - Standard" (1800-2000 cal): midpoint 1900, distance 50, score 95
- Template "Fat Loss - Standard Low" (1600-1800 cal): midpoint 1700, distance 150, score 85
- Result: Recommend "Fat Loss - Standard"

### Workout Template Selection

**Inputs:**
- Client's equipment list
- Training days per week
- Experience level
- Body composition

**Process:**
1. Filter templates by recommended category_id
2. For each template, calculate composite score:
   - Equipment overlap: Count matching equipment items / total template requirements
   - Days alignment: 100 if exact match, -10 per day difference
   - Intensity match: Map experience + body fat to 1-3 intensity scale, compare to template
3. Return template with highest combined score

---

## User Flow Examples

### Admin Views Client "John" in Nutrition Templates Tab

**Before:**
- Banner: "Recommended for John: Fat Loss - Moderate" 
- Button: "View Recommended" → scrolls to category

**After:**
- Banner: "Recommended for John: Fat Loss - Moderate"
- Sub-banner: "Best Template: Fat Loss - Standard (1800-2000 cal)" with "Excellent Match" badge
- Button: "View Template" → scrolls to AND expands that specific template
- Template shows auto-expanded Week 1 → Day 1 with expandable meals
- Each meal has [Expand] button showing ingredients + instructions
- Week header has [Grocery List] button

### Admin Edits a Meal

1. Navigate to template → expand week → expand day → expand meal
2. Click "Edit" on meal
3. Form shows all fields with current values
4. Change protein from 35g to 40g, update instructions
5. Click "Save" → mutation fires → success toast
6. UI updates immediately with new values
