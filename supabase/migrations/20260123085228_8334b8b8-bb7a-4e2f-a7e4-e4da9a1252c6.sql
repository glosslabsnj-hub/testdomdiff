-- Create workout templates table
CREATE TABLE public.workout_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    focus TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workout exercises table
CREATE TABLE public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.workout_templates(id) ON DELETE CASCADE NOT NULL,
    section_type TEXT NOT NULL CHECK (section_type IN ('warmup', 'main', 'finisher', 'cooldown')),
    exercise_name TEXT NOT NULL,
    sets TEXT,
    reps_or_time TEXT,
    rest TEXT,
    notes TEXT,
    scaling_options TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create program weeks table
CREATE TABLE public.program_weeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_number INTEGER NOT NULL UNIQUE CHECK (week_number >= 1 AND week_number <= 12),
    phase TEXT NOT NULL CHECK (phase IN ('foundation', 'build', 'peak')),
    title TEXT,
    focus_description TEXT,
    workout_monday UUID REFERENCES public.workout_templates(id),
    workout_tuesday UUID REFERENCES public.workout_templates(id),
    workout_wednesday UUID REFERENCES public.workout_templates(id),
    workout_thursday UUID REFERENCES public.workout_templates(id),
    workout_friday UUID REFERENCES public.workout_templates(id),
    workout_saturday UUID REFERENCES public.workout_templates(id),
    conditioning_notes TEXT,
    recovery_notes TEXT,
    scripture_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create faith lessons table
CREATE TABLE public.faith_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_number INTEGER NOT NULL UNIQUE CHECK (week_number >= 1 AND week_number <= 12),
    title TEXT,
    big_idea TEXT,
    scripture TEXT,
    teaching_content TEXT,
    action_steps TEXT,
    reflection_questions TEXT,
    weekly_challenge TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create nutrition guidelines table
CREATE TABLE public.nutrition_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type TEXT NOT NULL CHECK (content_type IN ('meal_structure', 'grocery_list', 'rule', 'template')),
    title TEXT NOT NULL,
    content JSONB DEFAULT '{}'::jsonb,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create discipline routines table
CREATE TABLE public.discipline_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_type TEXT NOT NULL CHECK (routine_type IN ('morning', 'evening')),
    time_slot TEXT NOT NULL,
    action_text TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faith_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discipline_routines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_templates
CREATE POLICY "Anyone can view active workout templates"
ON public.workout_templates FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage workout templates"
ON public.workout_templates FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for workout_exercises
CREATE POLICY "Anyone can view exercises for active templates"
ON public.workout_exercises FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.workout_templates 
    WHERE id = workout_exercises.template_id AND is_active = true
));

CREATE POLICY "Admins can manage workout exercises"
ON public.workout_exercises FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for program_weeks
CREATE POLICY "Authenticated users can view program weeks"
ON public.program_weeks FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage program weeks"
ON public.program_weeks FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for faith_lessons
CREATE POLICY "Authenticated users can view published faith lessons"
ON public.faith_lessons FOR SELECT
TO authenticated
USING (is_published = true);

CREATE POLICY "Admins can manage faith lessons"
ON public.faith_lessons FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for nutrition_guidelines
CREATE POLICY "Authenticated users can view active nutrition guidelines"
ON public.nutrition_guidelines FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage nutrition guidelines"
ON public.nutrition_guidelines FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for discipline_routines
CREATE POLICY "Authenticated users can view active discipline routines"
ON public.discipline_routines FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage discipline routines"
ON public.discipline_routines FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Add updated_at triggers
CREATE TRIGGER update_workout_templates_updated_at
    BEFORE UPDATE ON public.workout_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_exercises_updated_at
    BEFORE UPDATE ON public.workout_exercises
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_program_weeks_updated_at
    BEFORE UPDATE ON public.program_weeks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faith_lessons_updated_at
    BEFORE UPDATE ON public.faith_lessons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nutrition_guidelines_updated_at
    BEFORE UPDATE ON public.nutrition_guidelines
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discipline_routines_updated_at
    BEFORE UPDATE ON public.discipline_routines
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the 4 default workout templates
INSERT INTO public.workout_templates (template_slug, name, focus, description, display_order) VALUES
('cell-block-push', 'Cell Block Push', 'Chest, Shoulders, Triceps', 'Prison-style push workout. Minimal equipment, maximum intensity.', 1),
('yard-legs', 'Yard Legs', 'Quads, Hamstrings, Glutes', 'Lower body work that builds power and endurance.', 2),
('lockdown-pull', 'Lockdown Pull', 'Back, Biceps, Rear Delts', 'Pull movements for a strong, defined back.', 3),
('full-body-circuit', 'Full Body Circuit', 'Total Body Conditioning', 'High-intensity circuit for conditioning and fat loss.', 4);

-- Seed the 12 program weeks with correct phases
INSERT INTO public.program_weeks (week_number, phase, title) VALUES
(1, 'foundation', 'Week 1'),
(2, 'foundation', 'Week 2'),
(3, 'foundation', 'Week 3'),
(4, 'foundation', 'Week 4'),
(5, 'build', 'Week 5'),
(6, 'build', 'Week 6'),
(7, 'build', 'Week 7'),
(8, 'build', 'Week 8'),
(9, 'peak', 'Week 9'),
(10, 'peak', 'Week 10'),
(11, 'peak', 'Week 11'),
(12, 'peak', 'Week 12');

-- Seed the 12 faith lesson placeholders
INSERT INTO public.faith_lessons (week_number, title) VALUES
(1, 'Week 1 Lesson'),
(2, 'Week 2 Lesson'),
(3, 'Week 3 Lesson'),
(4, 'Week 4 Lesson'),
(5, 'Week 5 Lesson'),
(6, 'Week 6 Lesson'),
(7, 'Week 7 Lesson'),
(8, 'Week 8 Lesson'),
(9, 'Week 9 Lesson'),
(10, 'Week 10 Lesson'),
(11, 'Week 11 Lesson'),
(12, 'Week 12 Lesson');