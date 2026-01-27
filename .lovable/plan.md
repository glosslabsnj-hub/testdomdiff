
# Admin Dashboard Reorganization & Client Experience Enhancement

## Summary

This plan implements three major improvements:

1. **Move "Intake & Forms" from People to Coaching** - Relocate to the Free World section for better workflow
2. **Consolidate client subtabs** - Merge "Programs" and "Program Details" into one streamlined "Programs" tab
3. **Enhance client dashboard Custom Program tile** - Replace "In Progress" message with two distinct tabs (Training/Nutrition) showing full week-by-week expandable content

---

## Part 1: Admin Sidebar Reorganization

### Current State
The "Intake & Forms" item is under the "People" category in the sidebar.

### New Design
Move "Intake & Forms" from "People" to "Coaching" category, below "Free World":

```
COACHING
├── 👑 Free World
└── 📝 Intake & Forms
```

### File Changes
**`src/components/admin/AdminSidebar.tsx`**
- Remove `intake` from the "People" items array
- Add `intake` to the "Coaching" items array after "freeworld"

---

## Part 2: Client Subtab Consolidation

### Current State
ClientProgressPanel has 7 tabs:
- Programs (assignment + recommendations)
- Overview
- Intake
- Program Details (view assigned program weeks/days)
- Sessions
- Goals
- Messages

### Problems
- "Programs" and "Program Details" are confusing - should be one tab
- Admin has to jump between tabs to assign AND view the program
- "Program Details" doesn't include nutrition view

### New Design
Merge into 5 streamlined tabs:

```
[ Programs ] [ Overview ] [ Intake ] [ Sessions ] [ Goals ] [ Messages ]
     ↑
 DEFAULT - Shows assignment + full program view in one place
```

### New "Programs" Tab Structure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  PROGRAMS                                                                       │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  [ 🏋️ Training ]  [ 🍽️ Nutrition ]                    Toggle view          │
│  └─────────────────────────────────────────────────────────────────────────────┘
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  CURRENT ASSIGNMENT                                                         │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  │ ✓ Intermediate Push/Pull/Legs               [Change] [View Details]    ││
│  │  │   5 days/week • Standard difficulty                                     ││
│  │  └─────────────────────────────────────────────────────────────────────────┘│
│  │                                                                             │
│  │  OR if not assigned:                                                        │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  │ ⚠️ No training program assigned                                         ││
│  │  │ [AI Recommendation Card with Assign button]                             ││
│  │  │ [Browse All Templates]                                                  ││
│  │  └─────────────────────────────────────────────────────────────────────────┘│
│  └─────────────────────────────────────────────────────────────────────────────┘
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐
│  │  PROGRAM PREVIEW                                                            │
│  │                                                                             │
│  │  [Week 1] [Week 2] [Week 3] [Week 4]  <-- Horizontal week tabs              │
│  │                                                                             │
│  │  ▼ MONDAY: Push Day A                                                       │
│  │    ├── Warmup (3 exercises)                                                 │
│  │    ├── Main Work (5 exercises)                                              │
│  │    └── Finisher (2 exercises)                                               │
│  │                                                                             │
│  │  ▶ TUESDAY: Pull Day A                                                      │
│  │  ▶ WEDNESDAY: Legs A                                                        │
│  │  ...                                                                        │
│  └─────────────────────────────────────────────────────────────────────────────┘
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

When toggled to "Nutrition":
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  CURRENT ASSIGNMENT                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ ✓ Fat Loss GF 1800                             [Change] [View Details]     ││
│  │   1600-1900 cal • 180g protein                                              ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  MEAL PLAN PREVIEW                                                              │
│  [Week 1] [Week 2] [Week 3] [Week 4]                                           │
│                                                                                 │
│  ▼ DAY 1: Monday                                                                │
│    Breakfast: Greek Yogurt Bowl      320 cal | 35g P                           │
│    Lunch: Grilled Chicken Salad      450 cal | 45g P                           │
│    Dinner: Baked Salmon              520 cal | 48g P                           │
│    Snack: Protein Shake              180 cal | 30g P                           │
│                                                                                 │
│  ▶ DAY 2: Tuesday                                                               │
│  ▶ DAY 3: Wednesday                                                             │
│  ...                                                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 3: Enhanced Client Dashboard Custom Program Tile

### Current State
When no program is assigned, clients see "In Progress - Your Program is Being Built."
When assigned, they see a toggle between Workouts and Nutrition views.

### Problem
The current implementation works but needs better structure to match the 12-week program experience with full expandable days showing:
- Instructions
- Tips
- Video demos (if provided)
- Completion tracking

### New Design: Two Distinct Tabs

Replace the toggle with proper tabs that mirror the 12-week program experience:

```
YOUR CUSTOM PROGRAM
[ 🏋️ Training Program ]  [ 🍽️ Nutrition Plan ]

─────────────────────────────────────────────────────────
TRAINING PROGRAM (when tab active)

▼ Week 1: Foundation
├── ▼ MONDAY: Push Day A                    [✓ Complete]
│   ├── WARMUP
│   │   • Arm Circles       2×30 sec
│   │   • Band Pull Aparts  2×15
│   ├── MAIN WORK
│   │   • Bench Press       4×8-10     90s rest
│   │     ↳ Instructions: Keep shoulder blades pinched...
│   │     ↳ Tips: Don't flare elbows past 45 degrees
│   │     ↳ 🎥 Watch Demo
│   │   • Incline DB Press  3×10-12    60s rest
│   │   ...
│   ├── FINISHER
│   │   • Push-up Burnout   2×Max
│   │
├── ▶ TUESDAY: Pull Day A
├── ▶ WEDNESDAY: Legs A
├── ▶ THURSDAY: Rest Day
...

▶ Week 2: Build
▶ Week 3: Peak
▶ Week 4: Deload

─────────────────────────────────────────────────────────
NUTRITION PLAN (when tab active)

▼ Week 1
├── ▼ DAY 1: Monday                         [✓ Followed]
│   ├── BREAKFAST: Greek Yogurt Power Bowl
│   │   320 cal | 35g P | 25g C | 12g F
│   │   ↳ Ingredients: Greek yogurt, berries, honey...
│   │   ↳ Instructions: Mix yogurt with honey...
│   │   ↳ Tips: Prep the night before for grab-n-go
│   ├── LUNCH: Grilled Chicken Salad
│   │   450 cal | 45g P | 20g C | 22g F
│   │   ...
│   ├── DINNER: Baked Salmon & Veggies
│   ├── SNACK: Protein Shake
│
├── ▶ DAY 2: Tuesday
├── ▶ DAY 3: Wednesday
...

[ 🛒 View Week 1 Grocery List ]

▶ Week 2
▶ Week 3
▶ Week 4
```

### Key Features
1. **Week-level collapsibles** - Expand each week to see all days
2. **Day-level collapsibles** - Expand each day to see full workout/meal details
3. **Exercise details inline** - Show instructions, tips, and video demo button
4. **Meal details inline** - Show ingredients, instructions, and tips
5. **Completion buttons** - Mark days as complete (Training = "SERVED", Nutrition = "Followed")
6. **Grocery list** - Available per week for nutrition tab

---

## Part 4: Technical Implementation

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/admin/coaching/UnifiedProgramsTab.tsx` | New merged Programs tab with Training/Nutrition toggle and inline preview |
| `src/components/dashboard/WorkoutProgramView.tsx` | Enhanced workout view for Custom Program page with full exercise details |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/AdminSidebar.tsx` | Move "Intake" from People to Coaching |
| `src/components/admin/coaching/ClientProgressPanel.tsx` | Remove "Program Details" tab, keep "Programs" as merged experience |
| `src/components/admin/coaching/ClientProgramsTab.tsx` | Rename to UnifiedProgramsTab, add inline program preview with full week/day/exercise structure |
| `src/pages/dashboard/CustomProgram.tsx` | Replace ToggleGroup with proper Tabs, enhance workout view to show instructions/tips/videos |
| `src/components/dashboard/NutritionDayCard.tsx` | Ensure meal instructions/tips are visible when expanded |
| `src/components/dashboard/NutritionMealItem.tsx` | Add expanded view with ingredients and instructions |

### Component Changes Summary

**AdminSidebar.tsx Changes:**
```typescript
// Move from People group
{
  title: "People",
  items: [
    { id: "users", ... },
    { id: "check-ins", ... },
    { id: "support", ... },
    // REMOVE: { id: "intake", ... }
  ],
},

// Add to Coaching group
{
  title: "Coaching",
  items: [
    { id: "freeworld", ... },
    { id: "intake", label: "Intake & Forms", icon: FileText },  // ADD
  ],
},
```

**ClientProgressPanel.tsx Changes:**
- Remove the "details" tab (Program Details)
- Keep only: programs, overview, intake, sessions, goals, messages
- The "Programs" tab will now show both assignment AND preview

**ClientProgramsTab.tsx Enhancement:**
- Add a "Program Preview" section below the assignment cards
- Show week tabs with expandable days
- Show exercise/meal details when expanded
- Toggle between Training and Nutrition views

**CustomProgram.tsx Enhancement:**
- Replace `ToggleGroup` with `Tabs` for cleaner UX
- Enhance the workout view (currently DayCard) to show:
  - Exercise instructions
  - Form tips
  - Video demo button (opens in dialog)
- Ensure parity with 12-week program experience

---

## Part 5: Execution Order

1. **Update AdminSidebar.tsx** - Move Intake to Coaching category
2. **Update ClientProgressPanel.tsx** - Remove "Program Details" tab
3. **Enhance ClientProgramsTab.tsx** - Add inline program preview with week/day/exercise details
4. **Enhance CustomProgram.tsx** - Replace toggle with tabs, add exercise instructions/tips/video
5. **Enhance NutritionMealItem.tsx** - Add expandable view with full recipe details
6. **Test & Polish** - Verify assignment flow, preview accuracy, and client dashboard experience

---

## Summary of Changes

| Area | Before | After |
|------|--------|-------|
| Sidebar: Intake location | People category | Coaching category |
| Client subtabs | 7 tabs (Programs, Overview, Intake, Program Details, Sessions, Goals, Messages) | 6 tabs (Programs, Overview, Intake, Sessions, Goals, Messages) |
| Programs tab | Assignment only | Assignment + full program preview with week/day/exercise details |
| Custom Program tile | Toggle between Workouts/Nutrition | Proper tabs with full expandable content |
| Workout details | Basic sets/reps display | Full instructions, tips, and video demos |
| Nutrition details | Basic meal list | Full ingredients, instructions, and tips |
