

# Free World User Dashboard: Workout & Nutrition Toggle + Dietary Templates

## Summary
This plan implements two major features for the Free World (Coaching) user experience:
1. **Dual-Program Toggle** - Add a toggle to the "Your Custom Program" tile allowing coaching clients to switch between their custom workout program and their custom nutrition program, both displayed as full 4-week views with completion tracking
2. **Dietary Restriction Templates** - Create ~20 new nutrition templates specifically designed for dietary restrictions (Gluten-Free, Dairy-Free, Vegetarian, Keto) to align with the intake form questions

---

## Part 1: Dual-Program Toggle in Custom Program Tile

### Current State
The `CustomProgram.tsx` page displays:
- **Program Tab**: 4-week custom workout program with day-level completion tracking
- **Files Tab**: PDF/video uploads from coach

Coaching clients currently access nutrition via a separate `/dashboard/nutrition` page, which uses auto-matching to a template based on TDEE.

### Solution
Add a third-level toggle within the "Program" tab to switch between "Workouts" and "Nutrition" views. Both will use the same 4-week expandable structure with completion tracking.

### UI Structure
```
Your Custom Program
├── [Toggle: Workouts | Nutrition]  ← New top-level toggle
├── Workouts View (current implementation)
│   └── Week 1-4 → Days → Exercises
└── Nutrition View (new)
    └── Week 1-4 → Days → Meals (Breakfast, Lunch, Dinner, Snack)
```

### Nutrition View Implementation
The nutrition view will mirror the workout structure:
- 4 collapsible week cards
- Each week shows 7 days
- Each day shows 4 meals with expandable details
- Day-level completion tracking (mark entire day as "followed")
- Week progress badge showing "X/7 days followed"

### Data Source
For coaching clients, nutrition will come from:
1. **Admin-assigned template** - If Dom has manually assigned a nutrition template via the Free World Hub
2. **Auto-matched template** - If no manual assignment, use the TDEE-based matching (current behavior)

This requires checking for a `client_nutrition_assignment` record first, falling back to auto-matching.

### Database Changes
Create a new table for tracking nutrition assignments and day completions:

```sql
-- Track admin-assigned nutrition templates for coaching clients
CREATE TABLE public.client_nutrition_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.meal_plan_templates(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  UNIQUE(client_id)
);

-- Track daily nutrition completion for coaching clients
CREATE TABLE public.client_nutrition_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_id UUID NOT NULL REFERENCES public.meal_plan_days(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, day_id)
);

-- RLS policies
ALTER TABLE public.client_nutrition_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_nutrition_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assignments"
  ON public.client_nutrition_assignments FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Admins can manage assignments"
  ON public.client_nutrition_assignments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage their completions"
  ON public.client_nutrition_completions FOR ALL
  USING (user_id = auth.uid());
```

### New Hook: useClientNutrition
Create a hook that:
1. Checks for admin-assigned template in `client_nutrition_assignments`
2. Falls back to TDEE-based auto-matching
3. Fetches all 28 days and meals for the template
4. Tracks day-level completions
5. Provides toggle functions for completion

### UI Components
Modify `CustomProgram.tsx` to include:
- Toggle buttons at the top ("Workouts" / "Nutrition")
- New `NutritionProgramView` component that renders:
  - 4-week structure with collapsible cards
  - Daily meal lists with expandable details
  - Completion checkboxes at day level
  - Macro summary per day
  - Weekly grocery list button

---

## Part 2: Dietary Restriction Templates

### Current State
The intake form now captures:
- Gluten-free
- Dairy-free
- Vegetarian
- Keto/Low-carb

However, the current 140 nutrition templates do not account for these restrictions.

### Solution
Create ~20 new templates specifically for dietary restrictions:

| Category | Dietary Restriction | Calorie Range | Count |
|----------|---------------------|---------------|-------|
| Fat Loss - Aggressive | Gluten-Free | 1400-1800 | 2 |
| Fat Loss - Moderate | Gluten-Free | 1800-2200 | 2 |
| Recomposition | Gluten-Free | 2000-2400 | 2 |
| Fat Loss - Aggressive | Dairy-Free | 1400-1800 | 2 |
| Fat Loss - Moderate | Dairy-Free | 1800-2200 | 2 |
| Fat Loss - Aggressive | Keto | 1200-1600 | 2 |
| Muscle Building - Lean | Keto | 2000-2600 | 2 |
| Fat Loss - Moderate | Vegetarian | 1600-2000 | 2 |
| Recomposition | Vegetarian | 2000-2400 | 2 |
| Muscle Building - Lean | Vegetarian | 2400-2800 | 2 |

**Total: 20 new templates**

### Template Naming Convention
Templates will follow the pattern: `[Goal] - [Restriction] [Calories]`
- "Fat Loss - Gluten Free 1600"
- "Muscle Building - Vegetarian 2600"
- "Keto Recomp 2200"

### Database Changes
Add a `dietary_tags` column to templates for filtering:

```sql
ALTER TABLE public.meal_plan_templates
ADD COLUMN IF NOT EXISTS dietary_tags TEXT[];
```

### Edge Function Update
Modify `populate-meal-plans` to include dietary-specific meal pools:
- **Gluten-Free Meals**: No wheat, barley, rye (rice-based, potato-based)
- **Dairy-Free Meals**: No milk, cheese, yogurt, cream (use almond milk, coconut cream)
- **Keto Meals**: Under 20g net carbs per day (high fat, moderate protein)
- **Vegetarian Meals**: No meat or fish (eggs, dairy, legumes allowed)

### Recommendation Engine Update
Modify `useNutritionSuggestion` to:
1. Parse client's `dietary_restrictions` from profile
2. Filter templates by matching `dietary_tags`
3. Within filtered set, apply calorie-proximity scoring
4. If no dietary matches, fall back to standard templates

---

## Technical Implementation

### Files to Create
| File | Purpose |
|------|---------|
| `src/hooks/useClientNutrition.ts` | Fetch assigned/matched nutrition template with 28 days, track completions |
| `src/components/dashboard/NutritionProgramView.tsx` | 4-week nutrition display with completion tracking |
| `src/components/dashboard/NutritionDayCard.tsx` | Expandable day with 4 meals |
| `src/components/dashboard/NutritionMealItem.tsx` | Single meal with expand for ingredients/instructions |

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/dashboard/CustomProgram.tsx` | Add toggle between Workouts/Nutrition, integrate NutritionProgramView |
| `src/hooks/useNutritionSuggestion.ts` | Add dietary restriction filtering |
| `src/hooks/useNutritionTemplates.ts` | Update interface for dietary_tags |
| `supabase/functions/populate-meal-plans/index.ts` | Add dietary-specific meal pools and 20 new templates |

### Database Migrations
1. Create `client_nutrition_assignments` table
2. Create `client_nutrition_completions` table
3. Add `dietary_tags` column to `meal_plan_templates`
4. Set up RLS policies

---

## Nutrition Completion Tracking

### How It Works
Same pattern as workout completion:
1. Each nutrition day has a "Mark Day Complete" button
2. Clicking toggles the completion state in `client_nutrition_completions`
3. Completed days show muted styling (similar to "Served" workouts)
4. Week card shows progress badge: "5/7 days followed"
5. All 4 weeks complete triggers "Nutrition Phase Complete" celebration

### Visual Design
Nutrition days will use:
- Green accent for completed days (instead of red "Served" for workouts)
- Checkmark icon on completed days
- "Day Followed" badge instead of "Served"

This differentiates nutrition from workouts visually while maintaining the same UX pattern.

---

## Dietary Template Meals

### Gluten-Free Meal Examples
**Breakfast**: Steak & Eggs (no toast), Sweet Potato Hash, Greek Yogurt Parfait (with GF granola)
**Lunch**: Grilled Salmon with Rice, Bunless Burger with Sweet Potato Fries
**Dinner**: Herb-Crusted Chicken with Quinoa, Shrimp Stir-Fry with Rice Noodles
**Snacks**: Hard-boiled eggs, Nuts, Greek yogurt, Fruit

### Dairy-Free Meal Examples
**Breakfast**: Avocado Toast with Eggs, Turkey Sausage Hash, Oatmeal with Almond Milk
**Lunch**: Chicken Salad (olive oil dressing), Beef Tacos with Guacamole
**Dinner**: Grilled Fish with Vegetables, Coconut Curry Chicken
**Snacks**: Almond butter with apple, Trail mix, Protein shake (plant-based)

### Keto Meal Examples
**Breakfast**: Bacon & Eggs with Avocado, Keto Coffee with MCT Oil
**Lunch**: Cobb Salad (no croutons), Bunless Burger with Cheese
**Dinner**: Ribeye with Asparagus, Salmon with Creamy Spinach
**Snacks**: Cheese crisps, Olives, Pork rinds, Almonds

### Vegetarian Meal Examples
**Breakfast**: Veggie Omelet, Protein Oatmeal, Greek Yogurt with Nuts
**Lunch**: Black Bean Burrito Bowl, Caprese Salad with Quinoa
**Dinner**: Vegetable Stir-Fry with Tofu, Lentil Curry with Rice
**Snacks**: Cottage cheese, Hummus with vegetables, Protein shake

---

## Edge Function: Dietary Template Generation

The `populate-meal-plans` function will be updated to:

1. Define dietary-specific meal pools (separate from standard meals)
2. Create 20 new templates with proper `dietary_tags` array
3. Assign to appropriate categories based on goal type
4. Generate 28 days of compliant meals per template

### Dietary Tags Structure
```typescript
dietary_tags: ["gluten-free"] // or ["dairy-free"], ["keto"], ["vegetarian"]
```

Templates with no dietary restrictions will have `dietary_tags: null` or `[]`.

---

## User Flow

### Coaching Client Accesses Custom Program

1. Navigate to "Your Custom Program" tile
2. See toggle: **[Workouts]** | [Nutrition]
3. Default shows workouts (current behavior)
4. Click "Nutrition" to switch view

### Nutrition View Experience

1. See 4-week structure with collapsible weeks
2. Expand Week 1 to see Monday-Sunday
3. Expand Monday to see Breakfast, Lunch, Dinner, Snack
4. Click any meal to see ingredients and cooking instructions
5. Click "Mark Day Complete" when finished
6. Week progress updates: "1/7 days followed"
7. Click "Week Grocery List" to see shopping list for that week

### Admin Assigns Nutrition (if dietary restriction)

1. In Free World Hub, select client
2. Go to Nutrition Templates tab
3. Banner shows: "Recommended: Fat Loss - Gluten Free 1600" (if client selected gluten-free in intake)
4. Click "Assign Template" to confirm
5. Client's dashboard instantly shows the assigned template

---

## Execution Order

1. **Database Migration** - Create assignment and completion tables, add dietary_tags column
2. **Create useClientNutrition hook** - Fetch assigned template, track completions
3. **Create NutritionProgramView component** - 4-week expandable structure
4. **Create NutritionDayCard/MealItem components** - Day and meal display
5. **Update CustomProgram.tsx** - Add toggle and integrate nutrition view
6. **Update useNutritionSuggestion** - Add dietary filtering logic
7. **Update populate-meal-plans edge function** - Add dietary meal pools and templates
8. **Deploy and run edge function** - Populate 20 new dietary templates
9. **Update admin assignment flow** - Connect to client_nutrition_assignments table

