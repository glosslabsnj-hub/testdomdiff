-- Add user_id to meal_plan_templates so each user gets a personalized AI-generated plan
ALTER TABLE public.meal_plan_templates
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add grocery_list and meal_prep_instructions for AI-generated plans
ALTER TABLE public.meal_plan_templates
  ADD COLUMN IF NOT EXISTS grocery_list JSONB,
  ADD COLUMN IF NOT EXISTS meal_prep_instructions TEXT;

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_meal_plan_templates_user_id ON public.meal_plan_templates(user_id);

-- Allow authenticated users to read their own meal plans
DROP POLICY IF EXISTS "Users can view their own meal plans" ON public.meal_plan_templates;
CREATE POLICY "Users can view their own meal plans" ON public.meal_plan_templates
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can view their own meal plan days" ON public.meal_plan_days;
CREATE POLICY "Users can view their own meal plan days" ON public.meal_plan_days
  FOR SELECT USING (
    template_id IN (
      SELECT id FROM public.meal_plan_templates
      WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );

DROP POLICY IF EXISTS "Users can view their own meal plan meals" ON public.meal_plan_meals;
CREATE POLICY "Users can view their own meal plan meals" ON public.meal_plan_meals
  FOR SELECT USING (
    day_id IN (
      SELECT d.id FROM public.meal_plan_days d
      JOIN public.meal_plan_templates t ON t.id = d.template_id
      WHERE t.user_id = auth.uid() OR t.user_id IS NULL
    )
  );

-- Service role (edge functions) can insert/update/delete for any user
DROP POLICY IF EXISTS "Service role manages meal plans" ON public.meal_plan_templates;
CREATE POLICY "Service role manages meal plans" ON public.meal_plan_templates
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages meal plan days" ON public.meal_plan_days;
CREATE POLICY "Service role manages meal plan days" ON public.meal_plan_days
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages meal plan meals" ON public.meal_plan_meals;
CREATE POLICY "Service role manages meal plan meals" ON public.meal_plan_meals
  FOR ALL USING (true) WITH CHECK (true);

-- Enable RLS if not already enabled
ALTER TABLE public.meal_plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_meals ENABLE ROW LEVEL SECURITY;
