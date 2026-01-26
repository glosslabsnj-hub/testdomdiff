-- Add new columns to profiles table for enhanced Free World intake
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS body_fat_estimate TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS activity_level TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS training_days_per_week INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sleep_quality TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stress_level TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS previous_training TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS medical_conditions TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS motivation TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS short_term_goals TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS long_term_goals TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nutrition_style TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS biggest_obstacle TEXT;

-- Create program_template_categories table (5 level-based categories)
CREATE TABLE public.program_template_categories (
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

-- Create program_templates table (50 templates, 10 per category)
CREATE TABLE public.program_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.program_template_categories(id) ON DELETE CASCADE,
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

-- Create program_template_weeks table (4 weeks per template)
CREATE TABLE public.program_template_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.program_templates(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  title TEXT,
  focus_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create program_template_days table (7 days per week)
CREATE TABLE public.program_template_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID REFERENCES public.program_template_weeks(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  workout_name TEXT NOT NULL,
  workout_description TEXT,
  is_rest_day BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create program_template_exercises table
CREATE TABLE public.program_template_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID REFERENCES public.program_template_days(id) ON DELETE CASCADE,
  section_type TEXT DEFAULT 'main',
  exercise_name TEXT NOT NULL,
  sets TEXT,
  reps_or_time TEXT,
  rest TEXT,
  notes TEXT,
  demo_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create client_template_assignments table
CREATE TABLE public.client_template_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  template_id UUID REFERENCES public.program_templates(id) ON DELETE SET NULL,
  suggested_category_id UUID REFERENCES public.program_template_categories(id) ON DELETE SET NULL,
  match_score INTEGER,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID
);

-- Enable RLS on all new tables
ALTER TABLE public.program_template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_template_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_template_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_template_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for program_template_categories
CREATE POLICY "Anyone can view active categories" ON public.program_template_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage categories" ON public.program_template_categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for program_templates
CREATE POLICY "Anyone can view active templates" ON public.program_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage templates" ON public.program_templates
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for program_template_weeks
CREATE POLICY "Anyone can view template weeks" ON public.program_template_weeks
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.program_templates 
    WHERE program_templates.id = program_template_weeks.template_id 
    AND program_templates.is_active = true
  ));

CREATE POLICY "Admins manage template weeks" ON public.program_template_weeks
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for program_template_days
CREATE POLICY "Anyone can view template days" ON public.program_template_days
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.program_template_weeks w
    JOIN public.program_templates t ON t.id = w.template_id
    WHERE w.id = program_template_days.week_id 
    AND t.is_active = true
  ));

CREATE POLICY "Admins manage template days" ON public.program_template_days
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for program_template_exercises
CREATE POLICY "Anyone can view template exercises" ON public.program_template_exercises
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.program_template_days d
    JOIN public.program_template_weeks w ON w.id = d.week_id
    JOIN public.program_templates t ON t.id = w.template_id
    WHERE d.id = program_template_exercises.day_id 
    AND t.is_active = true
  ));

CREATE POLICY "Admins manage template exercises" ON public.program_template_exercises
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for client_template_assignments
CREATE POLICY "Admins manage assignments" ON public.client_template_assignments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients view own assignments" ON public.client_template_assignments
  FOR SELECT USING (auth.uid() = client_id);

-- Seed the 5 categories
INSERT INTO public.program_template_categories (name, description, target_profile, icon, display_order) VALUES
('Beginner Basics', 'Foundation movements, habit building, low intensity workouts designed for those new to training', 'New to training, sedentary background', 'baby', 1),
('Foundation Builder', 'Rebuild strength and establish consistency with progressive training', 'Some experience, returning after break', 'building', 2),
('Intermediate Growth', 'Progressive overload and split training for continued gains', '1-3 years training, ready for progression', 'trending-up', 3),
('Advanced Performance', 'Periodization and intensity techniques for experienced lifters', '3+ years, seeking optimization', 'zap', 4),
('Athletic Conditioning', 'Endurance, HIIT, and functional fitness for any experience level', 'Any level focusing on conditioning', 'heart-pulse', 5);

-- Create indexes for better query performance
CREATE INDEX idx_program_templates_category ON public.program_templates(category_id);
CREATE INDEX idx_program_template_weeks_template ON public.program_template_weeks(template_id);
CREATE INDEX idx_program_template_days_week ON public.program_template_days(week_id);
CREATE INDEX idx_program_template_exercises_day ON public.program_template_exercises(day_id);
CREATE INDEX idx_client_template_assignments_client ON public.client_template_assignments(client_id);