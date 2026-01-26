

# Enhanced Free World Intake & Informational Template Categories

## Overview

This plan creates a more intensive intake questionnaire for Free World (coaching) clients that collects detailed health, fitness, and lifestyle information. Based on this data, the system will automatically recommend one of 5 level-based categories to the admin. The admin can then select any of the 10 templates within that category (50 total templates) to assign to the client.

---

## Part 1: Enhanced Free World Intake Questions

### New Fields to Add to `profiles` Table

| Field | Type | Description |
|-------|------|-------------|
| `body_fat_estimate` | TEXT | Visual estimate (lean, average, overweight, obese) |
| `activity_level` | TEXT | sedentary, lightly_active, moderately_active, very_active |
| `training_days_per_week` | INTEGER | 3-7 (minimum 3 enforced) |
| `sleep_quality` | TEXT | poor, fair, good, excellent |
| `stress_level` | TEXT | low, moderate, high |
| `previous_training` | TEXT | Description of past training experience |
| `medical_conditions` | TEXT | Any health conditions to consider |
| `motivation` | TEXT | Why they're joining (helps with coaching) |
| `short_term_goals` | TEXT | 4-week specific goals |
| `long_term_goals` | TEXT | 3-6 month vision |
| `nutrition_style` | TEXT | Current eating habits |
| `biggest_obstacle` | TEXT | What's held them back before |

### Enhanced Intake Flow (Free World Only)

**Step 1: Profile (existing)**
- Name, phone, age, height, weight

**Step 2: Body Assessment (NEW)**
- Body fat visual estimate (image selection with 4 body types)
- Current activity level
- Available equipment

**Step 3: Training Readiness (NEW)**
- Training days per week (3-7, minimum 3)
- Training experience (existing)
- Previous training history (text)
- Injuries/limitations (existing)

**Step 4: Health & Lifestyle (NEW)**
- Sleep quality
- Stress level
- Medical conditions (if any)
- Nutrition style description

**Step 5: Goals & Mindset (NEW)**
- Primary goal (existing but expanded)
- Short-term goals (4 weeks)
- Long-term goals (3-6 months)
- Biggest obstacle to success
- Motivation (why now?)

**Step 6: Faith Commitment (existing)**

**Step 7: Photos (existing)**

---

## Part 2: Informational Template Categories (Level-Based)

### 5 Categories (10 templates each = 50 total)

| # | Category Name | Target Profile | Focus |
|---|---------------|----------------|-------|
| 1 | **Beginner Basics** | New to training, sedentary background | Foundation movements, habit building, low intensity |
| 2 | **Foundation Builder** | Some experience, returning after break | Rebuild strength, establish consistency |
| 3 | **Intermediate Growth** | 1-3 years training, ready for progression | Progressive overload, split training |
| 4 | **Advanced Performance** | 3+ years, seeking optimization | Periodization, intensity techniques |
| 5 | **Athletic Conditioning** | Any level focusing on conditioning | Endurance, HIIT, functional fitness |

### Each Category Contains 10 Templates

Example for "Beginner Basics":
1. Total Body Foundations (3 days)
2. Movement Mastery (3 days)
3. First Steps to Strength (4 days)
4. Bodyweight Beginnings (3 days, no equipment)
5. Dumbbell Starter (3 days, dumbbells only)
6. Fat Loss Fundamentals (4 days)
7. Build Your Base (4 days)
8. Active Recovery Focus (3 days, low impact)
9. Mobility & Strength Intro (3 days)
10. Home Gym Basics (4 days, minimal equipment)

---

## Part 3: Suggestion Algorithm

### Category Scoring Logic

The system analyzes intake data and scores each category 0-100:

| Factor | Weight | Scoring Logic |
|--------|--------|---------------|
| **Experience Level** | 35% | Beginner → Beginner Basics, Intermediate → Intermediate Growth, etc. |
| **Body Fat Estimate** | 20% | Obese/Overweight → lower intensity categories, Athletic Conditioning |
| **Activity Level** | 20% | Sedentary → Beginner Basics, Very Active → higher categories |
| **Training Days** | 15% | 3 days → templates with 3-day splits, 6 days → more advanced |
| **Injuries** | 10% | Has injuries → favor Foundation Builder, Active Recovery |

### Admin Dashboard Display

When viewing a Free World client in the admin panel:

```text
┌─────────────────────────────────────────────────────────┐
│  💡 RECOMMENDED CATEGORY                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Based on John's intake:                                │
│  • Experience: Beginner (0-1 years)                     │
│  • Activity: Sedentary                                  │
│  • Body Type: Overweight                                │
│  • Training Days: 3-4 days                              │
│  • Goal: Lose fat                                       │
│                                                         │
│  ┌─────────────────────────────────────────┐            │
│  │  BEGINNER BASICS                        │            │
│  │  ★★★★★ 92% Match                        │            │
│  │  Foundation movements, habit building   │            │
│  └─────────────────────────────────────────┘            │
│                                                         │
│  OR SELECT DIFFERENT CATEGORY:                          │
│  [Foundation Builder ▼]                                │
│                                                         │
│  SELECT TEMPLATE:                                       │
│  ┌─────────────────────────────────────────┐            │
│  │ ○ Total Body Foundations (3 days)       │            │
│  │ ○ Fat Loss Fundamentals (4 days) ★      │            │
│  │ ○ Bodyweight Beginnings (3 days)        │            │
│  │ ...                                     │            │
│  └─────────────────────────────────────────┘            │
│                                                         │
│  [Assign Selected Template]                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Part 4: Database Schema

### New Tables

**program_template_categories**
```sql
CREATE TABLE program_template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  target_profile TEXT,
  icon TEXT DEFAULT 'dumbbell',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**program_templates** (50 templates)
```sql
CREATE TABLE program_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES program_template_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT DEFAULT 'intermediate',
  days_per_week INTEGER DEFAULT 4,
  equipment TEXT[] DEFAULT ARRAY['bodyweight'],
  goal_focus TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**program_template_weeks** (4 weeks per template = 200 rows)
**program_template_days** (7 days per week = 1,400 rows)
**program_template_exercises** (exercises per day = ~7,000 rows)

**client_template_assignments** (tracks which template was assigned)
```sql
CREATE TABLE client_template_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  template_id UUID REFERENCES program_templates(id),
  suggested_category_id UUID REFERENCES program_template_categories(id),
  match_score INTEGER,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID
);
```

### Profile Table Additions

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS body_fat_estimate TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS activity_level TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS training_days_per_week INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sleep_quality TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stress_level TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS previous_training TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS medical_conditions TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS motivation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS short_term_goals TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS long_term_goals TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nutrition_style TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS biggest_obstacle TEXT;
```

---

## Part 5: File Changes

### New Files

| File | Purpose |
|------|---------|
| `src/pages/FreeWorldIntake.tsx` | Enhanced intake form (7 steps) for coaching clients |
| `src/hooks/useProgramTemplates.ts` | CRUD operations for template library |
| `src/hooks/useTemplateSuggestion.ts` | Scoring algorithm for category recommendation |
| `src/components/admin/ProgramTemplateManager.tsx` | Admin UI for managing 50 templates |
| `src/components/admin/coaching/ClientIntakeTab.tsx` | Full intake data display |
| `src/components/admin/coaching/TemplateAssignment.tsx` | Category suggestion + template picker |
| `supabase/migrations/xxx.sql` | Database migration for all new tables/columns |

### Modified Files

| File | Changes |
|------|---------|
| `src/App.tsx` | Add route for `/freeworld-intake` |
| `src/pages/Login.tsx` or routing | Redirect coaching users to enhanced intake |
| `src/components/admin/coaching/ClientProgressPanel.tsx` | Add "Intake" tab |
| `src/components/admin/coaching/ClientProgramTab.tsx` | Add template assignment section |
| `src/components/admin/ContentNavigation.tsx` | Add "Program Templates" section |
| `src/components/admin/AdminDashboard.tsx` | Route to template manager |

---

## Part 6: Enhanced Intake Form UI

### Step 2: Body Assessment

```text
┌─────────────────────────────────────────────────────────┐
│  How would you describe your current body composition?  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [🏃 Lean]     [📊 Average]   [📈 Overweight]  [⚖️ Obese] │
│  (visible abs) (some fat)    (excess fat)    (significant) │
│                                                         │
│  This helps us design a safe starting point.            │
│                                                         │
│  ─────────────────────────────────────────             │
│                                                         │
│  How active are you currently?                          │
│                                                         │
│  ○ Sedentary (desk job, minimal movement)               │
│  ○ Lightly Active (occasional walks, light activity)    │
│  ○ Moderately Active (regular exercise 2-3x/week)       │
│  ○ Very Active (intense exercise 4+ days/week)          │
│                                                         │
│  ─────────────────────────────────────────             │
│                                                         │
│  What equipment do you have access to?                  │
│                                                         │
│  ☐ Bodyweight only (home, no equipment)                 │
│  ☐ Dumbbells                                            │
│  ☐ Barbell & weights                                    │
│  ☐ Pull-up bar                                          │
│  ☐ Resistance bands                                     │
│  ☐ Full gym access                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Step 3: Training Readiness

```text
┌─────────────────────────────────────────────────────────┐
│  How many days can you commit to training?              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Minimum 3 days required for results.                   │
│                                                         │
│  [ 3 ]  [ 4 ]  [ 5 ]  [ 6 ]  [ 7 ]                      │
│                                                         │
│  ─────────────────────────────────────────             │
│                                                         │
│  Tell us about your training history:                   │
│                                                         │
│  [____________________________________________]          │
│  (What programs have you tried? What worked/didn't?)    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Step 4: Health & Lifestyle

```text
┌─────────────────────────────────────────────────────────┐
│  Your Health & Lifestyle                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  How would you rate your sleep quality?                 │
│  [ Poor ]  [ Fair ]  [ Good ]  [ Excellent ]            │
│                                                         │
│  What's your current stress level?                      │
│  [ Low ]  [ Moderate ]  [ High ]                        │
│                                                         │
│  Any medical conditions we should know about?           │
│  [____________________________________________]          │
│  (Diabetes, heart conditions, joint issues, etc.)       │
│                                                         │
│  Describe your current eating habits:                   │
│  [____________________________________________]          │
│  (Typical meals, eating schedule, challenges)           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Step 5: Goals & Mindset

```text
┌─────────────────────────────────────────────────────────┐
│  Your Goals & Mindset                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  What's your 4-week goal?                               │
│  [____________________________________________]          │
│  (Specific: "Lose 8 lbs", "Do 10 push-ups", etc.)       │
│                                                         │
│  Where do you see yourself in 3-6 months?               │
│  [____________________________________________]          │
│                                                         │
│  What's been your biggest obstacle to fitness?          │
│  [____________________________________________]          │
│  (Time, motivation, knowledge, consistency, etc.)       │
│                                                         │
│  Why are you starting now?                              │
│  [____________________________________________]          │
│  (This helps Dom understand your "why")                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Part 7: RLS Policies

```sql
-- Templates are public read, admin write
CREATE POLICY "Anyone can view active templates" ON program_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage templates" ON program_templates
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Categories same pattern
CREATE POLICY "Anyone can view active categories" ON program_template_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage categories" ON program_template_categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Client assignments
CREATE POLICY "Admins manage assignments" ON client_template_assignments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients view own assignments" ON client_template_assignments
  FOR SELECT USING (auth.uid() = client_id);
```

---

## Part 8: Template Seed Data

The migration will include a seed script that creates:

- **5 categories** with names, descriptions, and target profiles
- **50 templates** (10 per category) with:
  - Name, description, difficulty, days_per_week
  - Equipment requirements
  - Goal focus (fat loss, muscle, strength, conditioning)
- **200 weeks** (4 weeks per template)
- **1,400 days** (7 days per week)
- **~7,000 exercises** (average 5 exercises per workout day)

All exercises will be high-intensity jail-style workouts combining:
- Bodyweight movements (burpees, push-up variations, pull-ups, dips, pistol squats)
- Free weight exercises (barbell compounds, dumbbell accessories)
- Conditioning (EMOM, AMRAP, tabata, complexes)

---

## Summary

| Feature | Implementation |
|---------|----------------|
| Enhanced intake (7 steps) | New `FreeWorldIntake.tsx` page with 12 additional fields |
| 5 level-based categories | Non-jail themed, informational names |
| 50 templates | 10 per category, all pre-populated with workouts |
| Smart recommendation | Algorithm scores categories, shows best match to admin |
| Admin override | Category dropdown + template selector |
| Client intake display | New "Intake" tab in admin panel |
| Template assignment | Copy template structure to client's custom program |

The end result: When a new Free World client completes their enhanced intake, Dom sees their full profile plus a recommended category. He can accept the suggestion or pick any category/template, then assign it with one click.

