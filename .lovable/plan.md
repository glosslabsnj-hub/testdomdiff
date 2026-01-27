
# Add Template Library Tabs to Free World Hub

## Overview
Transform the Free World admin section into a comprehensive coaching command center with three sub-tabs:
1. **Clients** - The existing client management split-pane (keep as-is)
2. **Workout Templates** - Library of 50 workout programs, organized by category, expandable and editable
3. **Nutrition Templates** - Library of 50 four-week nutrition plans, categorized and matched to user intake, editable

---

## Part 1: Restructure FreeWorldHub with Sub-Tabs

### File: `src/components/admin/FreeWorldHub.tsx`

**Changes:**
- Add internal tabs at the top: `Clients | Workout Templates | Nutrition Templates`
- Default to "Clients" tab (existing functionality)
- Import and render new components for the template tabs

```
Layout:
┌─────────────────────────────────────────────────────────────┐
│ Free World Coaching                        [Add Client]     │
├─────────────────────────────────────────────────────────────┤
│ [Clients] [Workout Templates] [Nutrition Templates]         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  (Tab content area)                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 2: Workout Templates Tab (New Component)

### File: `src/components/admin/coaching/FreeWorldWorkoutTemplates.tsx`

**Features:**
- Display all 50 workout templates organized by the 5 categories
- Accordion-style category sections (Beginner Basics, Foundation Builder, etc.)
- Each template is expandable to show:
  - 4-week structure with day/workout names
  - Exercise list for each workout day
- Inline editing capability for exercises, sets, reps, notes
- Uses existing `useProgramTemplates` and `useTemplateDetails` hooks

**UI Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏋️ Workout Template Library                  [Add Template] │
│ 50 pre-built 4-week programs organized by experience level │
├─────────────────────────────────────────────────────────────┤
│ ▼ Beginner Basics (10 templates)                           │
│   ├─ Total Body Foundations                                │
│   │    ├─ Week 1: Foundation Phase                         │
│   │    │   ├─ Monday: Full Body A (6 exercises)           │
│   │    │   ├─ Tuesday: Rest Day                            │
│   │    │   └─ ...                                          │
│   │    ├─ Week 2: Building Phase                           │
│   │    └─ ...                                              │
│   ├─ Bodyweight Beginnings                                 │
│   └─ ...                                                    │
├─────────────────────────────────────────────────────────────┤
│ ▶ Foundation Builder (10 templates)                        │
│ ▶ Intermediate Growth (10 templates)                       │
│ ▶ Advanced Performance (10 templates)                      │
│ ▶ Athletic Conditioning (10 templates)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 3: Nutrition Templates Tab (New Component)

### Database Changes Required

**New Table: `nutrition_template_categories`**
- Similar structure to `program_template_categories`
- Categories based on goal type + activity level:
  1. Fat Loss - Aggressive
  2. Fat Loss - Moderate
  3. Recomposition - Standard
  4. Muscle Building - Lean
  5. Muscle Building - Mass

**Modify Table: `meal_plan_templates`**
- Add column: `category_id` (foreign key to new categories table)
- Add column: `difficulty` (beginner/intermediate/advanced meal prep complexity)

**Expand Templates:**
- Currently: 30 templates (10 per goal)
- Target: 50 templates
- Add 20 more templates distributed across categories

### File: `src/components/admin/coaching/FreeWorldNutritionTemplates.tsx`

**Features:**
- Display all 50 nutrition templates organized by 5 categories
- Each template shows:
  - 7-day rotation (expandable)
  - 4 meals per day with macros
  - Full recipe details when expanded
- Matching score based on user intake (TDEE calculation)
- Inline editing for meals, macros, ingredients
- Uses existing `useMealPlanTemplates` hooks (extended)

**UI Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🍽️ Nutrition Template Library               [Add Template] │
│ 50 complete meal plans organized by goal and activity      │
├─────────────────────────────────────────────────────────────┤
│ ▼ Fat Loss - Aggressive (10 templates)                     │
│   ├─ 1400-1600 cal - Low Carb Focus                        │
│   │    ├─ Day 1: Monday                                    │
│   │    │   ├─ Breakfast: Protein Omelette (450 cal)       │
│   │    │   ├─ Lunch: Grilled Chicken Salad (380 cal)      │
│   │    │   ├─ Dinner: Salmon with Vegetables (520 cal)    │
│   │    │   └─ Snack: Greek Yogurt (150 cal)               │
│   │    ├─ Day 2: Tuesday                                   │
│   │    └─ ...                                              │
│   └─ ...                                                    │
├─────────────────────────────────────────────────────────────┤
│ ▶ Fat Loss - Moderate (10 templates)                       │
│ ▶ Recomposition (10 templates)                             │
│ ▶ Muscle Building - Lean (10 templates)                    │
│ ▶ Muscle Building - Mass (10 templates)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 4: Nutrition Template Assignment for Clients

### File: `src/components/admin/coaching/NutritionTemplateAssignment.tsx`

**Features:**
- Similar flow to workout `TemplateAssignment.tsx`
- Calculate TDEE from client intake data
- Recommend a nutrition category based on:
  - Goal (fat loss, muscle, recomp)
  - Activity level
  - Calculated calorie needs
- Preview the 7-day meal rotation before assignment
- Assign template to client (copy to client-specific tables)

### New Hook: `src/hooks/useNutritionTemplates.ts`

- `useNutritionTemplateCategories()` - fetch categories
- `useNutritionTemplates(categoryId?)` - fetch templates
- `useNutritionTemplateDetails(templateId)` - get full days/meals
- `useAssignNutritionTemplate()` - copy template to client

---

## Part 5: Edge Function to Populate Additional Nutrition Templates

### File: `supabase/functions/populate-nutrition-templates/index.ts`

**Purpose:**
- Create 20 additional nutrition templates to reach 50 total
- Populate with realistic 7-day meal rotations
- 4 meals per day with proper macro distribution
- Varied recipes based on goal type

**Meal Generation Logic:**
```typescript
const MEAL_POOLS = {
  fatLoss: {
    breakfast: ["Protein Omelette", "Greek Yogurt Bowl", "Egg White Scramble", ...],
    lunch: ["Grilled Chicken Salad", "Turkey Lettuce Wraps", ...],
    dinner: ["Baked Salmon", "Lean Beef Stir-Fry", ...],
    snack: ["Protein Shake", "Celery with Almond Butter", ...]
  },
  muscleBuilding: {
    breakfast: ["Power Oatmeal", "Eggs & Toast", "Breakfast Burrito", ...],
    lunch: ["Chicken & Rice Bowl", "Beef Tacos", ...],
    dinner: ["Steak & Potatoes", "Pasta with Meat Sauce", ...],
    snack: ["Mass Gainer Shake", "PB&J Sandwich", ...]
  },
  // ...
};
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/admin/coaching/FreeWorldWorkoutTemplates.tsx` | Workout template library with expandable categories |
| `src/components/admin/coaching/FreeWorldNutritionTemplates.tsx` | Nutrition template library with expandable categories |
| `src/components/admin/coaching/NutritionTemplateAssignment.tsx` | Assign nutrition templates to clients |
| `src/hooks/useNutritionTemplates.ts` | Hooks for nutrition template CRUD and assignment |
| `supabase/functions/populate-nutrition-templates/index.ts` | Populate additional nutrition templates |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/FreeWorldHub.tsx` | Add internal tabs for Clients/Workouts/Nutrition |
| `src/components/admin/coaching/ClientProgressPanel.tsx` | Add "Nutrition" sub-tab for client nutrition assignment |
| `src/components/admin/coaching/index.ts` | Export new components |

---

## Database Migrations

### Migration 1: Create nutrition template categories

```sql
CREATE TABLE nutrition_template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  target_profile TEXT,
  icon TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed the 5 categories
INSERT INTO nutrition_template_categories (name, description, target_profile, display_order) VALUES
  ('Fat Loss - Aggressive', 'High deficit, low carb focus', 'Rapid fat loss', 1),
  ('Fat Loss - Moderate', 'Sustainable deficit', 'Steady fat loss', 2),
  ('Recomposition', 'Maintenance calories', 'Build muscle, lose fat', 3),
  ('Muscle Building - Lean', 'Slight surplus', 'Clean bulk', 4),
  ('Muscle Building - Mass', 'High surplus', 'Maximum muscle gain', 5);
```

### Migration 2: Add category to meal_plan_templates

```sql
ALTER TABLE meal_plan_templates 
ADD COLUMN category_id UUID REFERENCES nutrition_template_categories(id);

ALTER TABLE meal_plan_templates 
ADD COLUMN difficulty TEXT DEFAULT 'intermediate';

-- Update existing templates with categories based on goal_type
```

---

## Implementation Order

1. **Database migrations** - Create category table, add columns to templates
2. **Restructure FreeWorldHub** - Add the three internal tabs
3. **Create FreeWorldWorkoutTemplates** - Workout library with editing
4. **Create FreeWorldNutritionTemplates** - Nutrition library with editing
5. **Create hooks for nutrition templates** - CRUD operations
6. **Run populate edge function** - Add remaining 20 nutrition templates
7. **Add NutritionTemplateAssignment** - Client assignment workflow
8. **Add Nutrition tab to ClientProgressPanel** - Per-client nutrition management

---

## Technical Notes

- Reuse existing accordion/collapsible patterns from `ProgramTemplateManager`
- Workout templates already have full data (33 templates with exercises)
- Nutrition templates have 30 with full meals - need 20 more
- Both template types use the same category-based recommendation algorithm
- Purple accent color scheme maintained for all Free World UI
