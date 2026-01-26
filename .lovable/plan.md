

# Populate 50 Complete Free World Training Programs

## Understanding the Problem

Currently:
- **50 program templates exist** with names and metadata (days_per_week, difficulty, etc.)
- **0 weeks/days/exercises** exist for any of them
- When a template is "assigned," the system falls back to generating generic placeholder weeks

What you need:
- **Each of the 50 templates = a complete 4-week training program**
- **Each week has 7 days** (workout days + rest days based on template's `days_per_week`)
- **Each workout day has 5-8 exercises** with sets, reps, rest, and notes
- **When assigned, the entire program copies to the client's dashboard**

## Solution: Database Seeding Edge Function

I'll create an edge function that populates all 50 templates with appropriate workout content based on their category, difficulty, and days_per_week settings.

### The 5 Categories & Their Exercise Focus

| Category | Experience | Workout Style |
|----------|------------|---------------|
| **Beginner Basics** | New to training | Full body, compound movements, lower volume |
| **Foundation Builder** | Returning/some experience | Upper/Lower or Push/Pull, moderate volume |
| **Intermediate Growth** | 1-3 years | PPL or body part splits, higher volume |
| **Advanced Performance** | 3+ years | Periodized, advanced techniques |
| **Athletic Conditioning** | Any level, conditioning focus | HIIT, circuits, metabolic training |

### Week Structure Per Template

Each template will have:
- **4 weeks** with progressive overload (volume/intensity increases each week)
- **7 days per week** (workout days + rest days)
- **Workout days** based on template's `days_per_week` setting (3-6)

### Example: "Total Body Foundations" (Beginner, 3 days/week)

```
Week 1 - Movement Mastery:
  Monday - Full Body A (6 exercises)
    Warmup: Jumping Jacks (2x30), Bodyweight Squats (2x15)
    Main: Goblet Squat (3x10), DB Bench Press (3x10), DB Row (3x10)
    Finisher: Plank (3x30s)
  
  Tuesday - Rest Day
  
  Wednesday - Full Body B (6 exercises)
    Warmup: Arm Circles (2x20), Lunges (2x10)
    Main: Romanian Deadlift (3x10), Overhead Press (3x10), Lat Pulldown (3x10)
    Finisher: Dead Bug (3x10)
  
  Thursday - Rest Day
  
  Friday - Full Body C (6 exercises)
    Warmup: Mountain Climbers (2x20), Hip Circles (2x10)
    Main: Leg Press (3x12), Incline DB Press (3x10), Cable Row (3x10)
    Finisher: Farmer Walks (3x40s)
  
  Saturday - Rest Day
  Sunday - Rest Day

Week 2 - Building Consistency (+1 set)
Week 3 - Progressive Load (+2 reps)
Week 4 - Peak Week (intensity focus)
```

## Implementation Approach

### Part 1: Create Exercise Library

First, I'll define exercise pools for each category/workout type:

```typescript
const EXERCISE_POOLS = {
  beginner: {
    push: ["DB Bench Press", "Overhead Press", "Push-ups", "Incline DB Press"],
    pull: ["Lat Pulldown", "DB Row", "Cable Row", "Face Pulls"],
    legs: ["Goblet Squat", "Leg Press", "Romanian Deadlift", "Lunges"],
    core: ["Plank", "Dead Bug", "Bird Dog", "Pallof Press"],
    warmup: ["Jumping Jacks", "Bodyweight Squats", "Arm Circles", "Hip Circles"],
  },
  intermediate: {
    push: ["Barbell Bench Press", "Military Press", "Dips", "Cable Flyes"],
    pull: ["Pull-ups", "Barbell Row", "T-Bar Row", "Chin-ups"],
    legs: ["Back Squat", "Deadlift", "Bulgarian Split Squat", "Leg Curl"],
    core: ["Hanging Leg Raise", "Ab Wheel", "Cable Crunch", "Russian Twist"],
  },
  advanced: {
    push: ["Pause Bench Press", "Push Press", "Weighted Dips", "Incline Barbell"],
    pull: ["Weighted Pull-ups", "Pendlay Row", "Meadows Row", "Chest-Supported Row"],
    legs: ["Pause Squats", "Deficit Deadlift", "Front Squat", "Hip Thrust"],
  },
  conditioning: {
    hiit: ["Burpees", "Box Jumps", "Kettlebell Swings", "Battle Ropes"],
    circuits: ["Mountain Climbers", "Squat Jumps", "Med Ball Slams", "Sprint Intervals"],
  }
};
```

### Part 2: Edge Function to Populate Templates

Create `supabase/functions/populate-program-templates/index.ts`:

```typescript
// For each of the 50 templates:
// 1. Create 4 weeks in program_template_weeks
// 2. Create 7 days per week in program_template_days
// 3. Create 5-8 exercises per workout day in program_template_exercises
```

### Part 3: Program Generation Logic

Each template generates its program based on:
1. **Category** → determines exercise selection pool
2. **days_per_week** → determines workout/rest distribution
3. **difficulty** → determines volume (sets/reps)
4. **Week number** → progressive overload adjustments

### Workout Split Patterns

| Days/Week | Split Type | Day Pattern |
|-----------|------------|-------------|
| 3 | Full Body | Mon/Wed/Fri |
| 4 | Upper/Lower | Mon-Upper, Tue-Lower, Thu-Upper, Fri-Lower |
| 5 | PPL+Upper+Lower | Push/Pull/Legs/Upper/Lower |
| 6 | PPL x2 | Push/Pull/Legs repeated |

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `supabase/functions/populate-program-templates/index.ts` | Edge function to seed all 50 templates with full programs |

### Edge Function Structure

```typescript
// populate-program-templates/index.ts

const TEMPLATES_BY_CATEGORY = {
  "Beginner Basics": [
    { name: "Total Body Foundations", split: "fullbody", exercises: [...] },
    { name: "Bodyweight Beginnings", split: "fullbody", exercises: [...] },
    // ... 8 more beginner templates
  ],
  "Foundation Builder": [...],
  "Intermediate Growth": [...],
  "Advanced Performance": [...],
  "Athletic Conditioning": [...],
};

// For each template:
async function populateTemplate(template, categoryData) {
  // Create 4 weeks
  for (let weekNum = 1; weekNum <= 4; weekNum++) {
    const week = await createWeek(template.id, weekNum);
    
    // Create 7 days
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const isWorkoutDay = workoutDays.includes(dayIndex);
      const day = await createDay(week.id, dayIndex, isWorkoutDay);
      
      if (isWorkoutDay) {
        // Add 5-8 exercises based on workout type
        const exercises = generateExercises(categoryData, dayType, weekNum);
        await insertExercises(day.id, exercises);
      }
    }
  }
}
```

## Expected Result

After running the edge function:

1. **Each template has 4 weeks** with appropriate titles and focus descriptions
2. **Each week has 7 days** properly labeled with workout names or "Rest Day"
3. **Each workout day has 5-8 exercises** with:
   - Section type (warmup/main/finisher)
   - Exercise name
   - Sets & reps (adjusted per week for progression)
   - Rest periods
   - Notes/coaching cues

4. **Template assignment copies everything** - when admin assigns a template, all weeks/days/exercises copy to the client's `client_program_*` tables

## Admin Experience After Implementation

1. Open Free World tab → Select client
2. Go to Program tab → See recommended category
3. Select a template (e.g., "Total Body Foundations")
4. **Preview shows actual exercises** (not empty/auto-generated)
5. Click "Assign" → Full 4-week program copies to client
6. Client sees complete program on their dashboard

## Technical Notes

- The edge function will be idempotent (can run multiple times safely)
- It will check if a template already has weeks and skip if populated
- Exercise selection will be deterministic based on template name/category
- Progressive overload built into week-over-week set/rep changes

