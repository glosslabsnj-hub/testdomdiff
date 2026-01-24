-- Create meal plan templates table
CREATE TABLE public.meal_plan_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  goal_type TEXT NOT NULL,
  calorie_range_min INTEGER NOT NULL,
  calorie_range_max INTEGER NOT NULL,
  daily_protein_g INTEGER NOT NULL,
  daily_carbs_g INTEGER NOT NULL,
  daily_fats_g INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create meal plan days table
CREATE TABLE public.meal_plan_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.meal_plan_templates(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
  day_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(template_id, day_number)
);

-- Create meal plan meals table
CREATE TABLE public.meal_plan_meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_id UUID NOT NULL REFERENCES public.meal_plan_days(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein_g INTEGER NOT NULL,
  carbs_g INTEGER NOT NULL,
  fats_g INTEGER NOT NULL,
  prep_time_min INTEGER DEFAULT 0,
  cook_time_min INTEGER DEFAULT 0,
  servings INTEGER DEFAULT 1,
  ingredients JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  notes TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.meal_plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_meals ENABLE ROW LEVEL SECURITY;

-- RLS policies for meal_plan_templates
CREATE POLICY "Admins can manage meal plan templates"
  ON public.meal_plan_templates
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view active meal plan templates"
  ON public.meal_plan_templates
  FOR SELECT
  USING (is_active = true);

-- RLS policies for meal_plan_days
CREATE POLICY "Admins can manage meal plan days"
  ON public.meal_plan_days
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view meal plan days"
  ON public.meal_plan_days
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.meal_plan_templates
    WHERE id = meal_plan_days.template_id AND is_active = true
  ));

-- RLS policies for meal_plan_meals
CREATE POLICY "Admins can manage meal plan meals"
  ON public.meal_plan_meals
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view meal plan meals"
  ON public.meal_plan_meals
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.meal_plan_days
    JOIN public.meal_plan_templates ON meal_plan_templates.id = meal_plan_days.template_id
    WHERE meal_plan_days.id = meal_plan_meals.day_id AND meal_plan_templates.is_active = true
  ));

-- Add updated_at triggers
CREATE TRIGGER update_meal_plan_templates_updated_at
  BEFORE UPDATE ON public.meal_plan_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_plan_days_updated_at
  BEFORE UPDATE ON public.meal_plan_days
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_plan_meals_updated_at
  BEFORE UPDATE ON public.meal_plan_meals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_meal_plan_templates_goal_type ON public.meal_plan_templates(goal_type);
CREATE INDEX idx_meal_plan_templates_calorie_range ON public.meal_plan_templates(calorie_range_min, calorie_range_max);
CREATE INDEX idx_meal_plan_days_template_id ON public.meal_plan_days(template_id);
CREATE INDEX idx_meal_plan_meals_day_id ON public.meal_plan_meals(day_id);
CREATE INDEX idx_meal_plan_meals_meal_type ON public.meal_plan_meals(meal_type);