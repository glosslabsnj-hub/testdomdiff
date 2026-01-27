

# Free World Coaching Section Enhancement

## Overview

This plan transforms the Free World Coaching admin section into a comprehensive client management hub with three distinct views: Clients (with improved detail panel), Program Library (categorized & editable workout templates), and Nutrition Library (categorized & editable meal plans). Client recommendations will appear in a dedicated "Templates" tab within the client detail panel.

---

## Part 1: New Free World Layout Structure

### Current State
The Free World section has a client list sidebar and a single client detail panel with tabs: Overview, Intake, Sessions, Goals & Actions, Messages, Program.

### New Design: Top-Level Tabs with Dedicated Libraries

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  FREE WORLD COACHING                                                            │
│  Manage your premium 1:1 coaching clients                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│  [ CLIENTS ]    [ PROGRAM LIBRARY ]    [ NUTRITION LIBRARY ]                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  (Content changes based on selected tab)                                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Tab Descriptions

| Tab | Purpose |
|-----|---------|
| **Clients** | The current split-view layout: client list sidebar + client detail panel |
| **Program Library** | Full workout template library organized by categories, with inline editing |
| **Nutrition Library** | Full nutrition template library organized by categories, with inline editing |

---

## Part 2: Enhanced Client Detail Panel

### New Client Tabs Structure

When a client is selected in the Clients tab, the detail panel will show these tabs:

```
[ Overview ] [ Templates ] [ Intake ] [ Program ] [ Sessions ] [ Goals ] [ Messages ]
               ↑ NEW
```

### "Templates" Tab Content

This new tab replaces the `ClientRecommendationsCard` that currently appears at the top of every tab. It provides:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  TEMPLATES                                                                      │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  WORKOUT RECOMMENDATION                                                     │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  │ 🏋️ Intermediate Push/Pull/Legs                                         ││
│  │  │    5 days/week • 92% Match                                              ││
│  │  │                                                                         ││
│  │  │    Reasons: Matches experience level, Days/week aligned, Has equipment ││
│  │  │                                                                         ││
│  │  │    [ View Template ]  [ Assign ]  [ Browse All → ]                      ││
│  │  └─────────────────────────────────────────────────────────────────────────┘│
│  │                                                                             │
│  │  Current Assignment: None                                                   │
│  │  (or shows assigned template with "Change" button)                          │
│  └─────────────────────────────────────────────────────────────────────────────┘
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  NUTRITION RECOMMENDATION                                                   │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  │ 🥗 Fat Loss GF 1800                                                      ││
│  │  │    1600-1900 cal • 95% Match • TDEE: 2100                               ││
│  │  │                                                                         ││
│  │  │    Reasons: Calorie range matches deficit goal, Gluten-free compatible ││
│  │  │                                                                         ││
│  │  │    [ View Template ]  [ Assign ]  [ Browse All → ]                      ││
│  │  └─────────────────────────────────────────────────────────────────────────┘│
│  │                                                                             │
│  │  Current Assignment: None                                                   │
│  └─────────────────────────────────────────────────────────────────────────────┘
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Key Features
- **Current Assignment Display**: Shows what's currently assigned with "Change" button
- **Auto-Suggested Match**: Prominently displays the best-match template with score and reasons
- **Quick Actions**: View (expands details inline), Assign (one-click), Browse All (jumps to library)
- **Change Template Flow**: If already assigned, "Change" button opens template browser

---

## Part 3: Program Library Tab (New)

### Layout
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  WORKOUT TEMPLATE LIBRARY                                                       │
│  50 pre-built 4-week programs organized by experience level                     │
│                                                            [ + Add Template ]   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ▼ BEGINNER BASICS (10 templates)                                               │
│  ├────────────────────────────────────────────────────────────────────────────┤│
│  │  ▶ Beginner Full Body 3-Day                       3 days/week    [Edit] [⋮]││
│  │  ▶ Beginner Upper/Lower Split                     4 days/week    [Edit] [⋮]││
│  │  ▶ Beginner Bodyweight Foundations                3 days/week    [Edit] [⋮]││
│  │  ...                                                                        ││
│  └────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  ▶ FOUNDATION BUILDER (10 templates)                                            │
│  ▶ INTERMEDIATE GROWTH (10 templates)                                           │
│  ▶ ADVANCED PERFORMANCE (10 templates)                                          │
│  ▶ ATHLETIC CONDITIONING (10 templates)                                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Inline Editing Features

When "Edit" is clicked on a template row:
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ✎ EDITING: Beginner Full Body 3-Day                        [Save] [Cancel]    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Template Info                                                                  │
│  Name: [Beginner Full Body 3-Day           ]                                    │
│  Category: [Beginner Basics ▼]   Days/Week: [3 ▼]   Difficulty: [Beginner ▼]   │
│  Description: [___________________________________________________________]    │
│                                                                                 │
│  Week 1: Foundation                                                             │
│  ├── Monday: Full Body A                                                        │
│  │   ├── Warmup                                                                 │
│  │   │   1. Arm Circles         2 sets × 30 sec                    [✎] [🗑]    │
│  │   │   2. Leg Swings          2 sets × 20 reps                   [✎] [🗑]    │
│  │   ├── Main Workout                                                           │
│  │   │   1. Push-ups            3 sets × 10-15 reps     60s rest   [✎] [🗑]    │
│  │   │   2. Squats              3 sets × 15 reps        60s rest   [✎] [🗑]    │
│  │   │   [+ Add Exercise]                                                       │
│  │   ├── Finisher                                                               │
│  │   │   1. Plank AMRAP         2 sets × Max time                  [✎] [🗑]    │
│  │   │   [+ Add Exercise]                                                       │
│  ├── Wednesday: Full Body B                                                     │
│  │   ...                                                                        │
│  ├── Friday: Full Body C                                                        │
│  │   ...                                                                        │
│                                                                                 │
│  Week 2-4: (Collapsible)                                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Editing Capabilities
- Edit template name, description, category, days per week, difficulty
- Expand any week to see all days and exercises
- Inline edit exercise: name, sets, reps, rest, notes
- Add/remove exercises within any section (warmup, main, finisher, cooldown)
- Reorder exercises via drag-and-drop or up/down arrows
- Delete template (with confirmation)
- Duplicate template

---

## Part 4: Nutrition Library Tab (New)

### Layout
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  NUTRITION TEMPLATE LIBRARY                                                     │
│  100+ complete meal plans organized by goal and calorie range                   │
│                                                            [ + Add Template ]   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ▼ FAT LOSS - AGGRESSIVE (20 templates)                                         │
│  ├────────────────────────────────────────────────────────────────────────────┤│
│  │  ▶ Fat Loss 1400 Balanced           1300-1500 cal   150g P   [Edit] [⋮]    ││
│  │  ▶ Fat Loss 1400 Gluten-Free        1300-1500 cal   150g P   [Edit] [⋮]    ││
│  │  ▶ Fat Loss 1600 High Protein       1500-1700 cal   180g P   [Edit] [⋮]    ││
│  │  ...                                                                        ││
│  └────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  ▶ FAT LOSS - MODERATE (20 templates)                                           │
│  ▶ RECOMPOSITION (20 templates)                                                 │
│  ▶ MUSCLE BUILDING - LEAN (20 templates)                                        │
│  ▶ MUSCLE BUILDING - MASS (20 templates)                                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Inline Editing Features

When "Edit" is clicked on a nutrition template:
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ✎ EDITING: Fat Loss 1400 Balanced                          [Save] [Cancel]    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Template Info                                                                  │
│  Name: [Fat Loss 1400 Balanced             ]                                    │
│  Category: [Fat Loss - Aggressive ▼]   Goal: [fat_loss ▼]                       │
│  Calorie Range: [1300] - [1500]                                                 │
│  Daily Macros: Protein [150]g  Carbs [100]g  Fats [50]g                         │
│  Dietary Tags: [☑ Gluten-Free] [☐ Dairy-Free] [☐ Vegetarian] [☐ Keto]          │
│                                                                                 │
│  Week 1:  [ Week 1 ▾ ] [ Week 2 ] [ Week 3 ] [ Week 4 ]                        │
│  ├── Day 1: Monday                                                              │
│  │   ┌────────────────────────────────────────────────────────────────────────┐│
│  │   │ BREAKFAST: Greek Yogurt Power Bowl                     320 cal  [▼]   ││
│  │   │ 35g P | 25g C | 12g F | 10 min prep                                    ││
│  │   │                                                                        ││
│  │   │ (Expanded shows ingredients + recipe)                                  ││
│  │   │ Ingredients:                                                           ││
│  │   │   - Greek yogurt, 1 cup                         [✎] [🗑]               ││
│  │   │   - Mixed berries, 1/2 cup                      [✎] [🗑]               ││
│  │   │   - Honey, 1 tbsp                               [✎] [🗑]               ││
│  │   │   [+ Add Ingredient]                                                   ││
│  │   │                                                                        ││
│  │   │ Instructions:                                                          ││
│  │   │ [___________________________________________________________]         ││
│  │   └────────────────────────────────────────────────────────────────────────┘│
│  │   ├── LUNCH: Grilled Chicken Salad                          450 cal  [▼]  ││
│  │   ├── DINNER: Baked Salmon with Veggies                     520 cal  [▼]  ││
│  │   └── SNACK: Protein Shake                                  180 cal  [▼]  ││
│  │                                                                             │
│  ├── Day 2: Tuesday                                                            │
│  │   ...                                                                       │
│                                                                                 │
│  [ 📋 Generate Grocery List ]                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Editing Capabilities
- Edit template name, category, calorie range, daily macros
- Toggle dietary tags (Gluten-Free, Dairy-Free, Vegetarian, Keto)
- Week tabs for navigating 4-week structure
- Expandable meal cards showing full recipe details
- Inline edit meal: name, macros, prep time, ingredients, instructions
- Add/remove meals per day
- Add/remove ingredients per meal
- Auto-generate grocery list for the week
- Delete template (with confirmation)
- Duplicate template

---

## Part 5: Technical Implementation

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/admin/coaching/FreeWorldTabs.tsx` | Top-level tab container (Clients, Program Library, Nutrition Library) |
| `src/components/admin/coaching/ClientTemplatesTab.tsx` | New "Templates" tab for client detail panel |
| `src/components/admin/coaching/ProgramLibrary.tsx` | Full workout template library with inline editing |
| `src/components/admin/coaching/NutritionLibrary.tsx` | Full nutrition template library with inline editing |
| `src/components/admin/coaching/EditableTemplateRow.tsx` | Reusable inline-editable template row |
| `src/components/admin/coaching/EditableExerciseRow.tsx` | Inline-editable exercise component |
| `src/components/admin/coaching/EditableMealRow.tsx` | Inline-editable meal component |
| `src/components/admin/coaching/EditableIngredientRow.tsx` | Inline-editable ingredient component |
| `src/hooks/useUpdateProgramTemplate.ts` | Hook for updating workout template data |
| `src/hooks/useUpdateNutritionTemplate.ts` | Hook for updating nutrition template data |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/FreeWorldHub.tsx` | Add top-level tabs (Clients, Program Library, Nutrition Library) |
| `src/components/admin/coaching/ClientProgressPanel.tsx` | Add "Templates" tab, remove `ClientRecommendationsCard` from header |
| `src/components/admin/coaching/ClientRecommendationsCard.tsx` | Enhance with "Current Assignment" display and "Change" flow |
| `src/components/admin/coaching/FreeWorldWorkoutTemplates.tsx` | Refactor to support inline editing mode |
| `src/components/admin/coaching/FreeWorldNutritionTemplates.tsx` | Refactor to support inline editing mode |
| `src/hooks/useProgramTemplates.ts` | Add exercise update/delete mutations |
| `src/hooks/useNutritionTemplates.ts` | Add meal/ingredient update/delete mutations |

### Component Hierarchy

```
FreeWorldHub.tsx (updated)
├── Tabs (Clients | Program Library | Nutrition Library)
│   ├── TabsContent: Clients
│   │   ├── CoachingClientList (sidebar)
│   │   └── ClientProgressPanel (detail)
│   │       └── Tabs (Overview | Templates | Intake | Program | Sessions | Goals | Messages)
│   │           ├── ClientOverviewTab
│   │           ├── ClientTemplatesTab (NEW)
│   │           │   ├── WorkoutRecommendationCard
│   │           │   │   └── ClientRecommendationsCard (enhanced)
│   │           │   └── NutritionRecommendationCard
│   │           ├── ClientIntakeTab
│   │           ├── ImprovedProgramTab
│   │           ├── ClientSessionsTab
│   │           ├── ClientGoalsTab
│   │           └── ClientMessagesTab
│   │
│   ├── TabsContent: Program Library
│   │   └── ProgramLibrary (NEW)
│   │       ├── CategoryAccordion[]
│   │       │   └── EditableTemplateRow[]
│   │       │       ├── TemplateInfoFields
│   │       │       └── WeekEditor
│   │       │           └── DayEditor
│   │       │               └── EditableExerciseRow[]
│   │
│   └── TabsContent: Nutrition Library
│       └── NutritionLibrary (NEW)
│           ├── CategoryAccordion[]
│           │   └── EditableTemplateRow[]
│           │       ├── TemplateInfoFields
│           │       └── WeekTabs
│           │           └── DayMeals
│           │               └── EditableMealRow[]
│           │                   └── EditableIngredientRow[]
```

---

## Part 6: Database Hooks Enhancement

### New Mutations for useProgramTemplates.ts

```typescript
// Add exercise to a day
useCreateTemplateExercise()

// Update exercise details
useUpdateTemplateExercise()

// Delete exercise
useDeleteTemplateExercise()

// Reorder exercises
useReorderTemplateExercises()
```

### New Mutations for useNutritionTemplates.ts

```typescript
// Update meal details
useUpdateMeal()

// Add meal to a day
useCreateMeal()

// Delete meal
useDeleteMeal()

// Update ingredient
useUpdateIngredient()

// Add ingredient to meal
useCreateIngredient()

// Delete ingredient
useDeleteIngredient()
```

---

## Part 7: Inline Editing UX Patterns

### Edit Mode Toggle
- Each template row has an "Edit" button
- Clicking Edit expands the row into a full editing interface
- "Save" commits all changes, "Cancel" discards them
- Visual indicator (colored border, edit icon) shows row is in edit mode

### Field Editing
- Text fields: click to edit, blur to save
- Dropdowns: select to change immediately
- Numbers: input fields with increment/decrement
- Checkboxes: toggle immediately for tags

### Validation
- Required fields highlighted if empty on save attempt
- Number ranges validated (calories, macros)
- Toast notifications for save success/failure

### Confirmation for Destructive Actions
- Delete template: "Are you sure? This cannot be undone."
- Delete exercise/meal: Inline confirmation or undo toast

---

## Part 8: Execution Order

1. **Create FreeWorldTabs.tsx** - Top-level tab wrapper
2. **Update FreeWorldHub.tsx** - Integrate top-level tabs
3. **Create ClientTemplatesTab.tsx** - New Templates tab for client detail
4. **Update ClientProgressPanel.tsx** - Add Templates tab, reorganize tab order
5. **Create ProgramLibrary.tsx** - Full workout library with inline editing
6. **Create NutritionLibrary.tsx** - Full nutrition library with inline editing
7. **Create EditableTemplateRow.tsx** - Shared component for expandable editing
8. **Create EditableExerciseRow.tsx** - Exercise inline editing
9. **Create EditableMealRow.tsx** - Meal inline editing
10. **Update useProgramTemplates.ts** - Add CRUD mutations for exercises
11. **Update useNutritionTemplates.ts** - Add CRUD mutations for meals/ingredients
12. **Enhance ClientRecommendationsCard.tsx** - Add current assignment display
13. **Polish and test** - Ensure all save/cancel flows work correctly

---

## Summary of Changes

| Area | Before | After |
|------|--------|-------|
| Free World Structure | Split-view only | 3 top-level tabs (Clients, Program Library, Nutrition Library) |
| Template Recommendations | At top of every client tab | Dedicated "Templates" tab in client detail |
| Workout Templates | Browse-only, limited editing | Full inline editing of exercises, weeks, days |
| Nutrition Templates | Browse-only | Full inline editing of meals, ingredients, macros |
| Template Assignment | Via Program tab | Via dedicated Templates tab with clear current assignment |
| Client Tabs | 6 tabs | 7 tabs (added Templates) |

