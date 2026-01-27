

# Make Solitary Confinement Meal Plans Clickable

## Overview

Currently, Solitary Confinement users see the `BasicNutritionPlan` component which displays static meal cards that cannot be expanded. Users want to tap on a meal to see more details like ingredients and cooking instructions.

## Current State

The `BasicNutritionPlan.tsx` component:
- Displays 4 meals per day (Breakfast, Lunch, Dinner, Snack) based on user goal
- Each meal shows: type, name, description, calories, protein
- Cards are NOT interactive - no expand/collapse functionality
- Meal data is hardcoded with a simple `description` field (e.g., "3 eggs scrambled, 2 slices turkey bacon, 1 cup spinach sautéed")

## Solution

### 1. Create `SolitaryMealCard` Component

A new collapsible meal card component designed for the Solitary tier:

**File:** `src/components/nutrition/SolitaryMealCard.tsx`

| Feature | Description |
|---------|-------------|
| Collapsed State | Meal type badge, name, calories, protein |
| Tap to Expand | Chevron indicator, smooth animation |
| Expanded Content | Ingredients list, basic instructions, macro breakdown |
| Mobile-Optimized | 44px+ touch targets, full-width on mobile |

### 2. Enhance Static Meal Data

Update the meal data structure in `BasicNutritionPlan.tsx` to include:
- `ingredients` array (parsed from existing descriptions)
- `instructions` string (simple cooking directions)
- `prepTime` number (estimated prep time in minutes)

Example transformation:

```text
BEFORE:
{
  type: "Breakfast",
  name: "Protein Power Start",
  description: "3 eggs scrambled, 2 slices turkey bacon, 1 cup spinach sautéed",
  calories: 400,
  protein: 35
}

AFTER:
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
    { amount: "1 cup", item: "spinach" }
  ],
  instructions: "1. Scramble eggs in a non-stick pan over medium heat.\n2. Cook turkey bacon until crispy.\n3. Sauté spinach in remaining pan with a pinch of salt.\n4. Plate together and eat immediately."
}
```

### 3. Update `BasicNutritionPlan.tsx`

- Import and use the new `SolitaryMealCard` component
- Replace static card rendering with collapsible cards
- Add the enhanced meal data with ingredients and instructions

## Component Structure

```text
SolitaryMealCard
├── Collapsed Header (always visible)
│   ├── Meal type badge (Breakfast/Lunch/etc.)
│   ├── Meal name
│   ├── Calories + Protein (right side)
│   └── Chevron indicator
│
└── Expanded Content (on tap)
    ├── Macro breakdown grid (calories, protein, carbs, fats)
    ├── Prep time badge
    ├── Ingredients list with amounts
    └── Step-by-step instructions
```

## Visual Design

Following existing patterns from `NutritionMealItem.tsx`:

- **Collapsed:** Charcoal background with border, hover state for tap indication
- **Meal type badges:** Color-coded (amber=breakfast, blue=lunch, purple=dinner, green=snack)
- **Macro grid:** 4-column layout with colored values (orange calories, blue protein, amber carbs, green fats)
- **Ingredients:** Bullet list with primary-colored amounts
- **Instructions:** Pre-wrapped text with numbered steps

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `src/components/nutrition/SolitaryMealCard.tsx` | CREATE | New collapsible meal card for Solitary tier |
| `src/components/nutrition/BasicNutritionPlan.tsx` | MODIFY | Use new card component + enhanced meal data |

## Implementation Details

### SolitaryMealCard Props

```typescript
interface SolitaryMealCardProps {
  meal: {
    type: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    prepTime?: number;
    ingredients: { amount: string; item: string }[];
    instructions: string;
  };
}
```

### Enhanced Meal Data (12 meals total - 4 per goal)

All 12 meals will be enhanced with:
- Full macro breakdown (carbs, fats added)
- Prep time estimates
- Ingredient lists parsed from descriptions
- Simple, actionable cooking instructions

## Acceptance Criteria

1. User taps any meal card → Card expands smoothly with chevron rotation
2. Expanded card shows: macro grid, prep time, ingredients list, instructions
3. User taps again → Card collapses
4. Multiple cards can be expanded simultaneously
5. Works on all mobile screen sizes (360px - 480px)
6. Touch targets are minimum 44px for accessibility

## No Breaking Changes

- Upgrade CTA to Gen Pop remains unchanged
- Solitary Rules section stays the same
- Navigation links preserved
- No database changes required (static data)

