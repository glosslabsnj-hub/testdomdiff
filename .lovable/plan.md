
# Transform All Workout Templates to Dom's High-Intensity Style

## Dom's Training Philosophy (from your answers)
- **Rep Range**: 20-30+ reps (very high endurance-focused)
- **Set Volume**: 3-5 sets per exercise
- **Intensity Technique**: AMRAP finishers at end of each workout
- **Rest Periods**: 45-60 seconds (short, keeps heart rate elevated)

---

## Current Problem

The existing exercise pools in `populate-program-templates/index.ts` use **standard gym programming**:
- Beginner: 8-12 reps, 60s rest
- Intermediate: 6-10 reps, 90s rest  
- Advanced: 4-8 reps, 120s rest

This doesn't match Dom's prison-style, high-intensity approach at all.

---

## Implementation Plan

### 1. Rewrite Exercise Pools with Dom's Style

Replace all exercise definitions with high-rep, short-rest versions adapted by difficulty level:

| Category | Rep Range | Sets | Rest | Finisher Style |
|----------|-----------|------|------|----------------|
| Beginner Basics | 20-25 reps | 3-4 sets | 60s | AMRAP 60 sec |
| Foundation Builder | 20-30 reps | 3-4 sets | 50s | AMRAP 90 sec |
| Intermediate Growth | 25-30 reps | 4 sets | 45s | AMRAP 2 min |
| Advanced Performance | 25-35 reps | 4-5 sets | 45s | AMRAP 3 min |
| Athletic Conditioning | 30+ reps | 4-5 sets | 30s | AMRAP to failure |

### 2. Add Dedicated AMRAP Finisher Section

Currently the "finisher" section is just 1 core exercise. For Dom's style, we need:

```typescript
// New finisher pool - AMRAP style
const AMRAP_FINISHERS = {
  beginner: [
    { name: "AMRAP: Burpees", duration: "60s", notes: "As many as possible in 60 seconds" },
    { name: "AMRAP: Push-ups + Squats", duration: "60s", notes: "Alternate 5 and 5 until time" },
    { name: "AMRAP: Mountain Climbers", duration: "60s", notes: "Go until you can't" },
  ],
  intermediate: [
    { name: "AMRAP: Burpees + Tuck Jumps", duration: "90s", notes: "10 burpees, 10 tucks, repeat" },
    { name: "AMRAP: Devil's Press", duration: "90s", notes: "Burpee into dumbbell snatch" },
    { name: "AMRAP: Prison Cell Complex", duration: "2 min", notes: "Push-ups, squats, lunges - no rest" },
  ],
  advanced: [
    { name: "AMRAP: The Yard Sprint", duration: "3 min", notes: "10 burpees, 20 squats, 30 push-ups - repeat" },
    { name: "AMRAP: Iron Will", duration: "3 min", notes: "5 pull-ups, 10 dips, 15 squats - until failure" },
    { name: "AMRAP: Solitary Confinement", duration: "4 min", notes: "Cell-sized chaos - everything you've got" },
  ],
};
```

### 3. Update Rep Scheme Examples

**Before (Current):**
```typescript
{ name: "Push-ups", sets: "3", reps: "8-12", rest: "60s" }
{ name: "Barbell Bench Press", sets: "4", reps: "8-10", rest: "90s" }
```

**After (Dom's Style):**
```typescript
{ name: "Push-ups", sets: "4", reps: "25-30", rest: "45s", notes: "Chest to deck, full lockout" }
{ name: "DB Bench Press", sets: "4", reps: "20-25", rest: "50s", notes: "No rest at top, constant tension" }
```

### 4. Create New Edge Function to Update All Exercises

Since templates are already populated, we need an edge function that:
1. Fetches all existing `program_template_exercises`
2. Updates each exercise with Dom's style based on its category
3. Adds AMRAP finisher to each workout day that doesn't have one

**File:** `supabase/functions/update-to-dom-style/index.ts`

```typescript
// Transformation logic:
// 1. Map category → difficulty level
// 2. Update all exercises: sets → 3-5, reps → 20-30+, rest → 45-60s
// 3. Add AMRAP finisher if missing
// 4. Update notes with intensity cues
```

### 5. Category-Specific Adaptations

Each category gets the same high-intensity philosophy, but adapted:

**Beginner Basics:**
- Focus on bodyweight movements
- 20-25 reps (building capacity)
- 3-4 sets with 60s rest
- Shorter AMRAP finishers (60s)
- Notes emphasize form over speed

**Foundation Builder:**
- Mix of bodyweight + light weights
- 20-30 reps
- 3-4 sets with 50s rest
- 90s AMRAP finishers
- Notes encourage pushing limits

**Intermediate Growth:**
- More complex movements
- 25-30 reps
- 4 sets with 45s rest
- 2-minute AMRAP finishers
- Notes add intensity cues ("no breaks", "grind it out")

**Advanced Performance:**
- Compound movements with weight
- 25-35 reps (or until failure)
- 4-5 sets with 45s rest
- 3-minute AMRAP finishers
- Notes: "Iron sharpens iron", "embrace the burn"

**Athletic Conditioning:**
- Explosive/plyometric focus
- 30+ reps or timed intervals
- 4-5 sets with 30s rest
- AMRAP to failure
- Notes: "Leave nothing in the tank"

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/populate-program-templates/index.ts` | Replace all exercise pools with Dom's high-rep style, add AMRAP finisher pools |
| New: `supabase/functions/update-to-dom-style/index.ts` | Edge function to transform all existing exercises to new style |

---

## Database Updates

The edge function will update the `program_template_exercises` table with:
- `sets`: "3" → "4" or "4-5" depending on category
- `reps_or_time`: "8-12" → "20-30" based on difficulty
- `rest`: "60s"/"90s" → "45s"/"50s"/"60s" based on difficulty
- `notes`: Add intensity cues ("No rest", "Push through", "Failure is the goal")
- Add new rows for AMRAP finishers where missing

---

## Example Transformed Workout

**Before:**
```
Week 1 - Monday: Full Body A
├─ Warm-Up
│   ├─ Jumping Jacks: 2×30, 0s rest
│   └─ Bodyweight Squats: 2×15, 0s rest
├─ Main Workout
│   ├─ Push-ups: 3×8-12, 60s rest
│   ├─ DB Row: 3×10-12, 60s rest
│   ├─ Goblet Squat: 3×10-12, 60s rest
│   └─ Leg Press: 3×12-15, 60s rest
├─ Finisher
│   └─ Plank: 3×30-45s, 30s rest
└─ Cool-Down
    └─ (none)
```

**After (Dom's Style):**
```
Week 1 - Monday: Full Body Assault
├─ Warm-Up
│   ├─ Burpee Complex: 2×15, 0s rest - "Get the blood pumping"
│   └─ Prisoner Squats: 2×25, 0s rest - "Hands behind head, deep"
├─ Main Workout
│   ├─ Push-ups: 4×25-30, 45s rest - "Chest to deck, no resting at top"
│   ├─ DB Row: 4×20-25, 45s rest - "Control the weight, feel every rep"
│   ├─ Goblet Squat: 4×25-30, 50s rest - "Ass to grass, no shortcuts"
│   └─ Walking Lunges: 4×20 each, 50s rest - "Burn is where growth happens"
├─ Finisher
│   └─ AMRAP: Push-up + Squat Blitz: 90 seconds - "10 push-ups, 10 squats, repeat until time. No quitting."
└─ Cool-Down
    └─ Static Stretches: 5 min - "You earned this"
```

---

## Implementation Steps

1. **Create the update edge function** with Dom's exercise definitions
2. **Run the function** to transform all 50 templates
3. **Update the populate function** so any new templates use Dom's style by default
4. **Test in admin dashboard** - verify exercises show correct high-rep schemes

---

## Technical Notes

- All updates are reversible (exercise data stored in database)
- The edge function will log what it changes for audit purposes
- AMRAP finishers will be added as `section_type: "finisher"` with appropriate display order
- Cool-down section will be added if missing (static stretches)
