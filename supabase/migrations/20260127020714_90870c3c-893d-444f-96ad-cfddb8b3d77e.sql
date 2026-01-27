-- Track admin-assigned nutrition templates for coaching clients
CREATE TABLE public.client_nutrition_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  template_id UUID NOT NULL REFERENCES public.meal_plan_templates(id) ON DELETE CASCADE,
  assigned_by UUID,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  UNIQUE(client_id)
);

-- Track daily nutrition completion for coaching clients
CREATE TABLE public.client_nutrition_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  day_id UUID NOT NULL REFERENCES public.meal_plan_days(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, day_id)
);

-- Add dietary tags column to meal plan templates
ALTER TABLE public.meal_plan_templates
ADD COLUMN IF NOT EXISTS dietary_tags TEXT[];

-- RLS policies for client_nutrition_assignments
ALTER TABLE public.client_nutrition_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assignments"
  ON public.client_nutrition_assignments FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Admins can manage all assignments"
  ON public.client_nutrition_assignments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for client_nutrition_completions
ALTER TABLE public.client_nutrition_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own completions"
  ON public.client_nutrition_completions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own completions"
  ON public.client_nutrition_completions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own completions"
  ON public.client_nutrition_completions FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all completions"
  ON public.client_nutrition_completions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));