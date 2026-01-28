
# Fix Free World Program Library: Exercises Not Displaying

## Problem Identified

The exercises exist in the database (confirmed: 18 exercises per training day), but they're not rendering when you click on Monday because of a **section type mismatch**:

| What the UI filters for | What's in the database |
|-------------------------|------------------------|
| `warmup` | `activation` (964 exercises) |
| `main` (fallback) | `mobility` (964 exercises) |
| `finisher` | `strength` (1,928 exercises) |
| `cooldown` | `accessory` (1,864 exercises) |
| | `conditioning` (1,056 exercises) |
| | `recovery` (1,928 exercises) |

The component groups exercises into 4 buckets (warmup, main, finisher, cooldown), but the database contains exercises with the 6-section premium format (activation, mobility, strength, accessory, conditioning, recovery). Since none match, nothing renders.

## Solution

Update the `DayCard` component in `FreeWorldWorkoutTemplates.tsx` to map the 6 premium section types into the 4 simple display sections you requested:

| Display Section | Maps From |
|-----------------|-----------|
| Warm-Up | `warmup`, `activation`, `mobility` |
| Main Workout | `main`, `strength`, `accessory` |
| Finisher | `finisher`, `conditioning` |
| Cool-Down | `cooldown`, `recovery` |

## Files to Change

**`src/components/admin/coaching/FreeWorldWorkoutTemplates.tsx`**

Modify the `DayCard` component's grouping logic (around lines 469-473):

Current code:
```typescript
const warmupExercises = exercises.filter(e => e.section_type === "warmup");
const mainExercises = exercises.filter(e => e.section_type === "main" || !e.section_type);
const finisherExercises = exercises.filter(e => e.section_type === "finisher");
const cooldownExercises = exercises.filter(e => e.section_type === "cooldown");
```

Updated code:
```typescript
// Map 6-section premium format to 4-section simple display
const warmupExercises = exercises.filter(e => 
  ["warmup", "activation", "mobility"].includes(e.section_type || "")
);
const mainExercises = exercises.filter(e => 
  ["main", "strength", "accessory"].includes(e.section_type || "") || !e.section_type
);
const finisherExercises = exercises.filter(e => 
  ["finisher", "conditioning"].includes(e.section_type || "")
);
const cooldownExercises = exercises.filter(e => 
  ["cooldown", "recovery"].includes(e.section_type || "")
);
```

## Expected Result

After this change:
- Expanding "Monday: Full Body Assault A" will show all 18 exercises
- Exercises grouped into 4 clear sections: Warm-Up, Main Workout, Finisher, Cool-Down
- Inline editing will continue to work as-is

## Technical Notes

- This is a display-layer fix only; no database changes required
- The underlying section_type values remain unchanged in the database
- The 6-section structure is preserved for future granular views if needed
- Video links will not be shown per your preference
