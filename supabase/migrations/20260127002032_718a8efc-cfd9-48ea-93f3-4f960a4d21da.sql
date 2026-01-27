-- Create nutrition template categories table
CREATE TABLE public.nutrition_template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  target_profile TEXT,
  icon TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nutrition_template_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access (these are system templates)
CREATE POLICY "Anyone can view nutrition template categories"
ON public.nutrition_template_categories
FOR SELECT
USING (true);

-- Only admins can modify
CREATE POLICY "Admins can manage nutrition template categories"
ON public.nutrition_template_categories
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Seed the 5 categories
INSERT INTO public.nutrition_template_categories (name, description, target_profile, icon, display_order) VALUES
  ('Fat Loss - Aggressive', 'High deficit, low carb focus for rapid results', 'Rapid fat loss', 'flame', 1),
  ('Fat Loss - Moderate', 'Sustainable deficit for steady progress', 'Steady fat loss', 'trending-down', 2),
  ('Recomposition', 'Maintenance calories to build muscle while losing fat', 'Build muscle, lose fat', 'refresh-cw', 3),
  ('Muscle Building - Lean', 'Slight caloric surplus for clean gains', 'Clean bulk', 'dumbbell', 4),
  ('Muscle Building - Mass', 'High caloric surplus for maximum muscle gain', 'Maximum muscle gain', 'zap', 5);

-- Add category_id and difficulty columns to meal_plan_templates
ALTER TABLE public.meal_plan_templates 
ADD COLUMN category_id UUID REFERENCES public.nutrition_template_categories(id);

ALTER TABLE public.meal_plan_templates 
ADD COLUMN difficulty TEXT DEFAULT 'intermediate';

-- Update existing templates with categories based on goal_type
UPDATE public.meal_plan_templates 
SET category_id = (
  SELECT id FROM public.nutrition_template_categories 
  WHERE name = CASE 
    WHEN goal_type = 'fat_loss' THEN 'Fat Loss - Moderate'
    WHEN goal_type = 'muscle_gain' THEN 'Muscle Building - Lean'
    WHEN goal_type = 'recomposition' THEN 'Recomposition'
    ELSE 'Recomposition'
  END
);