
# Rebuild Free World Templates Content Manager

## Problem Summary

The "Free World Templates" section in Admin → Content currently shows:
- **Categories** (expandable) → **Templates** (basic info cards)

But it should show the full hierarchy like the coaching Program Library does:
- **Categories** → **Templates** → **Weeks** → **Days** → **Exercises** (with full editing)

The exercises exist in the database (16-18 per training day, 400+ per template), but the UI doesn't drill down to display or edit them.

## What You Want

When you click into a template:
1. See all 4 weeks (expandable)
2. Each week expands to show 7 days
3. Each day expands to show exercises grouped by section (Warm-up, Main, Finisher, Cooldown)
4. Each exercise is editable with:
   - Exercise name, sets, reps, rest, notes
   - **Instructions** (how to perform)
   - **Form tips** (coaching cues)
   - **Video URL** (demo video)

## Implementation Plan

### Step 1: Replace ProgramTemplateManager.tsx

Rebuild this component with a proper hierarchical editor:

**Level 1 - Category Accordion:**
```
[▼ Beginner Programs] (12 templates)
   ├── Build Your Base
   ├── First Steps to Strength
   └── ...
```

**Level 2 - Template Expansion:**
When you click "Edit" on a template:
```
Editing: Build Your Base
├── Template Info (name, description, difficulty, days/week)
└── [▼ Week 1: Foundation Phase]
    └── [▼ Week 2: Building Phase]
    └── ...
```

**Level 3 - Week Expansion:**
```
[▼ Week 1: Foundation Phase]
├── [▼ Monday: Push A] (16 exercises)
├── [▼ Tuesday: Pull A] (16 exercises)
├── Wednesday: Rest Day
├── ...
```

**Level 4 - Day Expansion:**
```
[▼ Monday: Push A]
├── WARM-UP
│   ├── Arm Circles - 2 sets × 30s [Edit] [Delete]
│   └── + Add Exercise
├── MAIN WORK
│   ├── Incline Push-ups - 4 sets × 20 reps - 45s rest [Edit] [Delete]
│   └── ...
├── FINISHER
├── COOL-DOWN
```

**Level 5 - Exercise Edit Dialog:**
```
┌─────────────────────────────────────┐
│ Edit Exercise                       │
├─────────────────────────────────────┤
│ Section: [Main Work ▼]              │
│ Name: [Incline Push-ups          ]  │
│ Sets: [4] Reps: [20] Rest: [45s]    │
│ Notes: [Focus on full range...]     │
│                                     │
│ ─── Coaching Details ───            │
│ Instructions: [Place hands on       │
│   elevated surface, lower chest...] │
│ Form Tips: [Keep core tight,        │
│   elbows at 45 degrees...]          │
│ Video URL: [https://...          ]  │
└─────────────────────────────────────┘
```

### Step 2: Add Database Fields (if missing)

The `program_template_exercises` table may need additional fields:
- `instructions` (text) - How to perform the exercise
- `form_tips` (text) - Coaching cues for proper form
- `video_url` (text) - Demo video link

These may already exist from the recent upgrade. If not, a migration will add them.

### Step 3: File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/components/admin/ProgramTemplateManager.tsx` | REPLACE | Complete rebuild with hierarchical Category → Template → Week → Day → Exercise structure |
| `src/hooks/useProgramTemplates.ts` | MODIFY | Ensure exercise editing includes instructions, form_tips, video_url fields |

### Step 4: UI Features

The new editor will include:
- **Collapsible sections** at every level (categories, templates, weeks, days)
- **Inline editing** for exercises (click to expand edit form)
- **Add Exercise** button in each section
- **Delete** with confirmation
- **Drag to reorder** (optional future enhancement)
- **Exercise count badges** on each day
- **Section labels** color-coded (Warm-up = yellow, Main = gold, Finisher = red, Cooldown = blue)

## Technical Notes

- The coaching `ProgramLibrary.tsx` already has much of this logic - we'll adapt it for the Content section
- Uses existing `useTemplateDetails()` hook which fetches weeks, days, and exercises
- Exercises are stored in `program_template_exercises` linked to `program_template_days`
- Changes auto-save on blur (or explicit Save button based on your preference)

## Expected Result

After implementation:
- Click "Free World Templates" in Content navigation
- Expand any category to see templates
- Click "Edit" on any template to see full 4-week structure
- Expand any week to see 7 days
- Expand any day to see all exercises grouped by section
- Click any exercise to edit name, sets, reps, rest, notes, instructions, form tips, and video URL
- All 400+ exercises per template are fully accessible and editable
